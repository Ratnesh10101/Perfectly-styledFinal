import { NextRequest, NextResponse } from 'next/server';
import { doc, increment, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Order } from '@/types/discount';
import type { PaymentSuccessData } from '@/types/payment';

export async function POST(req: NextRequest) {
  try {
    const { orderId, payerId, finalAmount, discountCode } =
      (await req.json()) as PaymentSuccessData;

    const orderData: Order = {
      id: orderId,
      orderId,
      payerId,
      amount: finalAmount,
      baseAmount: 9.99,
      discountCode: discountCode ?? undefined,
      discountAmount: discountCode ? 9.99 - finalAmount : undefined,
      influencerId: undefined,
      status: 'completed',
      createdAt: new Date().toISOString(),
      capturedAt: new Date().toISOString(),
    };

    if (discountCode) {
      const ref = doc(db, 'discountCodes', discountCode);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        orderData.influencerId = snap.data().owner;
        await updateDoc(ref, { uses: increment(1) });
      }
    }

    await setDoc(doc(db, 'orders', orderId), orderData);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}