"use client";

import { useState } from 'react';
import DiscountCodeInput from '@/components/DiscountCodeInput';
import PayPalCheckout from '@/components/PayPalCheckout';
import type { PaymentSuccessData } from '@/types/payment';

const BASE_PRICE = 9.99;

export default function PaymentPage() {
  const [code, setCode] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState<PaymentSuccessData | null>(null);

  if (done) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl text-green-600 mb-4">Payment successful!</h1>
        <p>Order ID: {done.orderId}</p>
        <p>Paid: £{done.finalAmount.toFixed(2)}</p>
        {done.discountCode && <p>Code used: {done.discountCode}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-center">Style Report – £9.99</h1>

      <DiscountCodeInput
        baseAmount={BASE_PRICE}
        onCodeChange={(c, p) => {
          setCode(c);
          setPercent(p);
        }}
      />

      <PayPalCheckout
        baseAmount={BASE_PRICE}
        discountCode={code}
        discountPercent={percent}
        onSuccess={setDone}
        onError={e => alert('Payment error: ' + (e as Error).message)}
      />
    </div>
  );
}