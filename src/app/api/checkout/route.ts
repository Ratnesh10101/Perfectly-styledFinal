import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { DiscountCode } from '@/types/discount';
import type { CheckoutRequest, CheckoutResponse } from '@/types/payment';

const PAYPAL = 'https://api-m.sandbox.paypal.com';

async function paypalToken() {
  const id = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID!;
  const secret = process.env.PAYPAL_SANDBOX_SECRET!;
  const res = await fetch(`${PAYPAL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error_description);
  return j.access_token as string;
}

async function paypalOrder(amount: number, access: string) {
  const res = await fetch(`${PAYPAL}/v2/checkout/orders`, {
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
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(j));
  return j.id as string;
}

export async function POST(req: NextRequest) {
  try {
    const { baseAmount, discountCode } = (await req.json()) as CheckoutRequest;
    if (baseAmount <= 0) throw new Error('Bad amount');

    let final = baseAmount;

    if (discountCode) {
      const snap = await getDoc(doc(db, 'discountCodes', discountCode));
      if (!snap.exists()) throw new Error('Invalid code');
      const d = snap.data() as DiscountCode;
      if (!d.isActive) throw new Error('Inactive code');
      if (d.expiresAt && new Date(d.expiresAt) < new Date()) throw new Error('Expired');
      if (d.maxUses && d.uses >= d.maxUses) throw new Error('Usage limit');
      final = Math.max(0.5, baseAmount - (baseAmount * d.percentOff) / 100);
    }

    const token = await paypalToken();
    const orderId = await paypalOrder(final, token);

    return NextResponse.json<CheckoutResponse>({
      success: true,
      orderId,
      finalAmount: final,
    });
  } catch (e) {
    return NextResponse.json<CheckoutResponse>(
      { success: false, error: (e as Error).message },
      { status: 400 },
    );
  }
}