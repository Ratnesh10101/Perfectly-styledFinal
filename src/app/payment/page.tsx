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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-8 px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
          <div className="space-y-3 text-purple-100">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-purple-200">Order ID</p>
              <p className="font-mono text-white">{done.orderId}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-purple-200">Amount Paid</p>
              <p className="text-2xl font-bold text-yellow-300">£{done.finalAmount.toFixed(2)}</p>
            </div>
            {done.discountCode && (
              <div className="bg-green-500/20 rounded-2xl p-4 backdrop-blur-sm border border-green-400/30">
                <p className="text-sm text-green-200">Discount Applied</p>
                <p className="font-semibold text-green-300">{done.discountCode}</p>
              </div>
            )}
          </div>
          <div className="mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <p className="text-purple-200 text-sm">
              🎉 Your personalized style report will be delivered to your email shortly!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = BASE_PRICE - (BASE_PRICE * percent) / 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-8 px-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Final Step: Secure Payment
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">💎</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Complete Your Style Journey
            </h1>
            <p className="text-purple-100 text-lg mb-6">
              Get your personalized style report
            </p>
            
            {/* Price display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              {percent > 0 ? (
                <div>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl text-purple-300 line-through">£{BASE_PRICE.toFixed(2)}</span>
                    <span className="text-4xl font-bold text-yellow-300">£{finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 px-3 py-1 bg-green-500/30 rounded-full inline-block">
                    <span className="text-green-200 text-sm font-medium">{percent}% OFF Applied!</span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-4xl font-bold text-yellow-300">£{BASE_PRICE.toFixed(2)}</span>
                  <div className="text-purple-200 text-sm mt-1">One-time payment</div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
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

          {/* Trust indicators */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="text-purple-200">
                <div className="text-2xl mb-1">🔒</div>
                <div className="text-xs">Secure</div>
              </div>
              <div className="text-purple-200">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs">Instant</div>
              </div>
              <div className="text-purple-200">
                <div className="text-2xl mb-1">💯</div>
                <div className="text-xs">Guaranteed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
