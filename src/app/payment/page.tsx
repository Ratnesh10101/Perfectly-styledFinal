// src/app/payment/page.tsx
"use client";

import { useState, useEffect } from 'react';
import DiscountCodeInput from '@/components/DiscountCodeInput';
import PayPalCheckout from '@/components/PayPalCheckout';
import type { PaymentSuccessData } from '@/types/payment';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { processPaymentAndGenerateReport } from '@/actions/questionnaireActions';
import type { QuestionnaireData } from '@/types';

const BASE_PRICE = 15.99;

const emailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type EmailFormValues = z.infer<typeof emailSchema>;

const PENDING_QUESTIONNAIRE_KEY = "pendingQuestionnaireData_v2";

export default function PaymentPage() {
  const [code, setCode] = useState<string | null>(null);
  const [percent, setPercent] = useState(0);
  const [paymentDone, setPaymentDone] = useState<PaymentSuccessData | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    const storedPaymentStatus = sessionStorage.getItem('paymentSuccessStatus');
    if (storedPaymentStatus) {
      try {
        const parsedStatus: PaymentSuccessData = JSON.parse(storedPaymentStatus);
        setPaymentDone(parsedStatus);
        setShowEmailInput(true);
      } catch (e) {
        console.error("Error parsing payment status from sessionStorage:", e);
        sessionStorage.removeItem('paymentSuccessStatus');
      }
    }
  }, []);

  const handlePaymentSuccess = (data: PaymentSuccessData) => {
    setPaymentDone(data);
    setShowEmailInput(true);
    sessionStorage.setItem('paymentSuccessStatus', JSON.stringify(data));
    toast({
      title: "Payment Confirmed!",
      description: "Your payment was successful. Please provide your email to receive the report.",
      duration: 3000,
    });
  };

  const handleEmailSubmit = async (values: EmailFormValues) => {
    setIsGeneratingReport(true);

    let questionnaireData: QuestionnaireData | null = null;
    try {
      const storedData = sessionStorage.getItem(PENDING_QUESTIONNAIRE_KEY);
      if (storedData) {
        questionnaireData = JSON.parse(storedData);
      } else {
        throw new Error("Questionnaire data not found");
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not retrieve questionnaire data. Please try again.",
        variant: "destructive",
      });
      setIsGeneratingReport(false);
      return;
    }

    if (!paymentDone) {
      toast({
        title: "Payment Data Missing",
        description: "Payment details were not found. Please complete the payment process again.",
        variant: "destructive",
      });
      setIsGeneratingReport(false);
      return;
    }

    try {
      const result = await processPaymentAndGenerateReport(questionnaireData, paymentDone, values.email);

      if (result.success && result.reportData) {
        sessionStorage.setItem("generatedReportData", JSON.stringify(result.reportData));
        sessionStorage.removeItem(PENDING_QUESTIONNAIRE_KEY);
        sessionStorage.removeItem('paymentSuccessStatus');
        toast({
          title: "Report Generated!",
          description: "Your personalized style report has been sent to your email.",
          duration: 5000,
        });
        router.push("/report");
      } else {
        toast({
          title: "Report Generation Failed",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to generate report.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const finalPrice = BASE_PRICE - (BASE_PRICE * percent) / 100;

  if (paymentDone && showEmailInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-8 px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 text-center text-white">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl">✓</span>
          </div>
<<<<<<< HEAD
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-purple-100 mb-6">Enter your email to receive your style report.</p>

=======
          <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-lg text-purple-100 mb-6">
            Thank you for your purchase. Please enter your email to receive your personalized style report.
          </p>
          <div className="space-y-3 text-purple-100 mb-6">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-purple-200">Order ID</p>
              <p className="font-mono text-white">{paymentDone.orderId}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-sm text-purple-200">Amount Paid</p>
              <p className="text-2xl font-bold text-yellow-300">£{paymentDone.finalAmount.toFixed(2)}</p>
            </div>
            {paymentDone.discountCode && (
              <div className="bg-green-500/20 rounded-2xl p-4 backdrop-blur-sm border border-green-400/30">
                <p className="text-sm text-green-200">Discount Applied</p>
                <p className="font-semibold text-green-300">{paymentDone.discountCode}</p>
              </div>
            )}
          </div>
          
>>>>>>> d67afaa (Page)
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-200">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        {...field}
                        className="bg-white/20 text-white placeholder:text-purple-200 border-purple-400 focus:border-purple-600"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isGeneratingReport}>
                {isGeneratingReport ? <LoadingSpinner size={20} className="mr-2" /> : <Send className="mr-2 h-4 w-4" />} Get My Report
              </Button>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-8 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Final Step: Secure Payment
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">💎</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Complete Your Style Journey</h1>
            <p className="text-purple-100 text-lg mb-6">Get your personalized style report</p>

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
              onSuccess={handlePaymentSuccess}
              onError={(e) => {
                console.error("PayPal Checkout Error:", e);
                toast({
                  title: "Payment Error",
                  description: "There was an issue with your PayPal payment. Please try again.",
                  variant: "destructive",
                });
              }}
            />
          </div>

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
