"use client";

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useState } from 'react';
import type { PaymentSuccessData } from '@/types/payment';

interface Props {
  baseAmount: number;
  discountCode: string | null;
  discountPercent: number;
  onSuccess: (d: PaymentSuccessData) => void;
  onError: (e: unknown) => void;
}

export default function PayPalCheckout({
  baseAmount,
  discountCode,
  discountPercent,
  onSuccess,
  onError,
}: Props) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [busy, setBusy] = useState(false);

  const savings = (baseAmount * discountPercent) / 100;
  const final = Math.max(0.5, baseAmount - savings);

  return (
    <>
      <div className="mb-3">
        <p>Subtotal: £{baseAmount.toFixed(2)}</p>
        {discountCode && (
          <p>
            Discount ({discountCode}): −£{savings.toFixed(2)}
          </p>
        )}
        <p className="font-semibold">Total: £{final.toFixed(2)}</p>
      </div>

      {isPending && <p>Loading PayPal…</p>}

      <PayPalButtons
        style={{ layout: 'vertical' }}
        disabled={busy}
        createOrder={async () => {
          setBusy(true);
          try {
            const res = await fetch('/api/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ baseAmount, discountCode }),
            });
            const { orderId, error } = (await res.json()) as { orderId?: string; error?: string };
            if (!orderId) throw new Error(error);
            return orderId;
          } catch (e) {
            onError(e);
            setBusy(false);
            throw e;
          }
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order!.capture();
            await fetch('/api/payment-success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: details.id,
                payerId: details.payer.payer_id,
                finalAmount: final,
                discountCode,
              }),
            });
            onSuccess({
              orderId: details.id,
              payerId: details.payer.payer_id,
              finalAmount: final,
              discountCode: discountCode ?? undefined,
            });
          } catch (e) {
            onError(e);
          } finally {
            setBusy(false);
          }
        }}
        onError={onError}
      />
    </>
  );
}