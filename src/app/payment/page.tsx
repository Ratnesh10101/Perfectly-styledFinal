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
import type { QuestionnaireData, UserReportData } from '@/types';

// New Base Price
const BASE_PRICE = 15.99;

// Zod schema for email validation
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

  // Effect to check if payment was already successful (e.g., on page refresh)
  useEffect(() => {
    const storedPaymentStatus = sessionStorage.getItem('paymentSuccessStatus');
    if (storedPaymentStatus) {
      try {
        const parsedStatus: PaymentSuccessData = JSON.parse(storedPaymentStatus);
        setPaymentDone(parsedStatus);
        setShowEmailInput(true);
        // Pre-fill email if available from previous session (e.g., if user was logged in)
        // This part might need integration with your AuthContext if you want to pre-fill user's email
        // For now, it will remain empty for manual entry.
      } catch (e) {
        console.error("Client: Error parsing stored payment status from sessionStorage:", e);
        sessionStorage.removeItem('paymentSuccessStatus'); // Clear invalid data
      }
    }
  }, []);


  const handlePaymentSuccess = (data: PaymentSuccessData) => {
    setPaymentDone(data);
    setShowEmailInput(true);
    // Store payment success status in session storage
    sessionStorage.setItem('paymentSuccessStatus', JSON.stringify(data));
    toast({
      title: "Payment Confirmed!",
      description: "Your payment was successful. Please provide your email to receive the report.",
      duration: 3000,
    });
    console.log("Client: Payment successful, showing email input.");
  };

  const handleEmailSubmit = async (values: EmailFormValues) => {
    console.log("Client: handleEmailSubmit initiated. Email:", values.email);
    setIsGeneratingReport(true);
    
    let questionnaireData: QuestionnaireData | null = null;
    try {
      const storedQuestionnaireData = sessionStorage.getItem(PENDING_QUESTIONNAIRE_KEY);
      if (storedQuestionnaireData) {
        questionnaireData = JSON.parse(storedQuestionnaireData);
        console.log("Client: Retrieved questionnaire data from sessionStorage successfully.");
      } else {
        console.warn("Client: No questionnaire data found in sessionStorage for key:", PENDING_QUESTIONNAIRE_KEY);
      }
    } catch (e) {
      console.error("Client: Error parsing questionnaire data from sessionStorage:", e);
      toast({
        title: "Error",
        description: "Could not retrieve questionnaire data. Please try again.",
        variant: "destructive",
      });
      setIsGeneratingReport(false);
      return;
    }

    if (!questionnaireData) {
      console.error("Client: Questionnaire data is null or undefined after retrieval attempt.");
      toast({
        title: "Missing Data",
        description: "Questionnaire data not found. Please complete the questionnaire first.",
        variant: "destructive",
      });
      setIsGeneratingReport(false);
      return;
    }

    // Crucial check: Ensure payment data is available
    if (!paymentDone) {
      console.error("Client: Payment data is missing. Cannot proceed with report generation.");
      toast({
        title: "Payment Data Missing",
        description: "Payment details were not found. Please complete the payment process again.",
        variant: "destructive",
      });
      setIsGeneratingReport(false);
      return;
    }

    console.log("Client: Attempting to call processPaymentAndGenerateReport with:", {
      email: values.email,
      questionnaireDataExists: !!questionnaireData,
      paymentDataExists: !!paymentDone,
    });

    try {
      // Pass paymentDone to the server action
      const result = await processPaymentAndGenerateReport(questionnaireData, paymentDone, values.email);
      console.log("Client: Result from processPaymentAndGenerateReport:", result);

      if (result.success && result.reportData) {
        sessionStorage.setItem("generatedReportData", JSON.stringify(result.reportData));
        sessionStorage.removeItem(PENDING_QUESTIONNAIRE_KEY); // Clear questionnaire data after use
        sessionStorage.removeItem('paymentSuccessStatus'); // Clear payment status after report generation
        toast({
          title: "Report Generated!",
          description: "Your personalized style report is ready and has been sent to your email.",
          duration: 5000,
        });
        router.push("/report");
      } else {
        console.error("Client: Report generation failed or reportData is missing. Message:", result.message);
        toast({
          title: "Report Generation Failed",
          description: result.message || "An unexpected error occurred while generating your report. Please try again.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Client: UNEXPECTED ERROR during report generation/email sending:", e);
      toast({
        title: "Error",
        description: "Failed to finalize report. An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      console.log("Client: handleEmailSubmit finished.");
      setIsGeneratingReport(false);
    }
  };


  if (paymentDone && showEmailInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-8 px-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 text-center text-white">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl">✓</span>
          </div>
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
                {isGeneratingReport ? <LoadingSpinner size={20} className="mr-2"/> : <Send className="mr-2 h-4 w-4" />}
                Get My Report
              </Button>
            </form>
          </Form>
>>>>>>> ff75e1b (Payment page final)
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
              onSuccess={handlePaymentSuccess}
              onError={e => {
                console.error("PayPal Checkout Error:", e);
                toast({
                  title: "Payment Error",
                  description: "There was an issue with your PayPal payment. Please try again.",
                  variant: "destructive",
                });
              }}
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
