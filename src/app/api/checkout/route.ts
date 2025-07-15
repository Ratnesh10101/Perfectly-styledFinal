// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { DiscountCode } from '@/types/discount';
import type { CheckoutRequest, CheckoutResponse } from '@/types/payment';

// --- PayPal API Base URL ---
// For LIVE PayPal transactions, this should be 'https://api-m.paypal.com'
// For SANDBOX (testing), it's 'https://api-m.sandbox.paypal.com'
// Ensure this environment variable is set correctly for your deployment.
const PAYPAL_API_BASE_URL = process.env.PAYPAL_API_BASE_URL || 'https://api.sandbox.paypal.com';

async function paypalToken() {
  // --- Use PayPal Client ID and Secret ---
  // For sandbox, use NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID and PAYPAL_SANDBOX_SECRET.
  // For live, you would typically use different environment variables (e.g., PAYPAL_LIVE_CLIENT_ID, PAYPAL_LIVE_SECRET).
  // Make sure these environment variables are set in your deployment environment.
  const id = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;
  const secret = process.env.PAYPAL_SANDBOX_SECRET;

  if (!id || !secret) {
    console.error("PayPal API credentials are not set in environment variables!");
    // It's crucial to throw an error here to prevent further execution with missing credentials.
    throw new Error("Missing PayPal API credentials. Please set NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID and PAYPAL_SANDBOX_SECRET.");
  }

  const res = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const j = await res.json();
  if (!res.ok) {
    console.error("Failed to get PayPal access token:", j);
    // Provide a more structured error if possible, otherwise stringify the whole response.
    throw new Error(`Failed to get PayPal access token: ${j.error_description || JSON.stringify(j)}`);
  }
  return j.access_token as string;
}

// Modified paypalOrder function to accept the request object
async function paypalOrder(amount: number, access: string, req: NextRequest) {
  // Dynamically get the base URL from the request headers
  const protocol = req.headers.get('x-forwarded-proto') || 'http'; // 'x-forwarded-proto' is common in deployed environments
  const host = req.headers.get('host'); // 'host' header gives the domain
  const APP_BASE_URL = `${protocol}://${host}`;

  console.log(`PayPal Order Creation: Using base URL for redirects: ${APP_BASE_URL}`); // Log the constructed URL

  const res = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'GBP', value: amount.toFixed(2) },
          description: 'Perfectly Styled report',
        },
      ],
      // Use the dynamically constructed APP_BASE_URL for return_url and cancel_url
      application_context: {
        return_url: `${APP_BASE_URL}/payment`,
        cancel_url: `${APP_BASE_URL}/payment`,
        shipping_preference: 'NO_SHIPPING', // Adjust as needed
      },
    }),
  });
  const j = await res.json();
  if (!res.ok) {
    console.error("Failed to create PayPal order:", j);
    // Provide a more structured error if possible, otherwise stringify the whole response.
    throw new Error(`Failed to create PayPal order: ${JSON.stringify(j)}`);
  }
  return j.id as string;
}

export async function POST(req: NextRequest) {
  try {
    const { baseAmount, discountCode } = (await req.json()) as CheckoutRequest;
    if (baseAmount <= 0) {
      return NextResponse.json<CheckoutResponse>(
        { success: false, error: 'Bad amount: Base amount must be greater than 0.' },
        { status: 400 },
      );
    }

    let final = baseAmount;

    if (discountCode) {
      const snap = await getDoc(doc(db, 'discountCodes', discountCode));
      if (!snap.exists()) {
        return NextResponse.json<CheckoutResponse>(
          { success: false, error: 'Invalid discount code.' },
          { status: 400 },
        );
      }
      const d = snap.data() as DiscountCode;
      if (!d.isActive) {
        return NextResponse.json<CheckoutResponse>(
          { success: false, error: 'Inactive discount code.' },
          { status: 400 },
        );
      }
      if (d.expiresAt && new Date(d.expiresAt) < new Date()) {
        return NextResponse.json<CheckoutResponse>(
          { success: false, error: 'Expired discount code.' },
          { status: 400 },
        );
      }
      if (d.maxUses && d.uses >= d.maxUses) {
        return NextResponse.json<CheckoutResponse>(
          { success: false, error: 'Discount code usage limit reached.' },
          { status: 400 },
        );
      }
      final = Math.max(0.5, baseAmount - (baseAmount * d.percentOff) / 100);
    }

    const token = await paypalToken();
    const orderId = await paypalOrder(final, token, req); // Pass the request object here

    return NextResponse.json<CheckoutResponse>({
      success: true,
      orderId,
      finalAmount: final,
    });
  } catch (e) {
    console.error("Error in /api/checkout POST handler:", e);
    // Ensure the error message is user-friendly and doesn't expose sensitive backend details.
    const errorMessage = (e instanceof Error) ? e.message : "An unknown error occurred during checkout.";
    return NextResponse.json<CheckoutResponse>(
      { success: false, error: `Checkout failed: ${errorMessage}` },
      { status: 500 }, // Use 500 for server-side errors, 400 for bad client requests
    );
  }
}

// You might also want to add a PUT route for capturing the order if your frontend calls it separately
// For example:
/*
export async function PUT(req: NextRequest) {
  try {
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const accessToken = await paypalToken(); // Reuse the token generation
    const url = `${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderID}/capture`;

    const paypalResponse = await fetch(url, {
      method: "POST", // Capture is a POST request to the capture endpoint
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const captureData = await paypalResponse.json();

    if (!paypalResponse.ok) {
      console.error("PayPal Capture Order API error:", captureData);
      return NextResponse.json(
        { error: captureData.message || "Failed to capture PayPal order.", details: captureData },
        { status: paypalResponse.status || 500 }
      );
    }

    return NextResponse.json({ captureData });
  } catch (error) {
    console.error("Error in /api/checkout PUT:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
*/
