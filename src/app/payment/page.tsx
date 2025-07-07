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
<<<<<<< HEAD
import type { QuestionnaireData } from '@/types';
=======
import type { QuestionnaireData, UserReportData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
>>>>>>> c8341bb (Payment page update)

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

  // Calculate finalPrice once at the top level of the component
  const finalPrice = BASE_PRICE - (BASE_PRICE * percent) / 100;

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
<<<<<<< HEAD
      } catch (e) {
        console.error("Error parsing payment status from sessionStorage:", e);
        sessionStorage.removeItem('paymentSuccessStatus');
=======
        console.log("Client: useEffect - Found stored payment status, setting paymentDone and showEmailInput.");
      } catch (e) {
        console.error("Client: useEffect - Error parsing stored payment status from sessionStorage:", e);
        sessionStorage.removeItem('paymentSuccessStatus'); // Clear invalid data
>>>>>>> c8341bb (Payment page update)
      }
    }
  }, []);

  const handlePaymentSuccess = (data: PaymentSuccessData) => {
    console.log("Client: handlePaymentSuccess called with data:", data);
    setPaymentDone(data);
    setShowEmailInput(true);
    sessionStorage.setItem('paymentSuccessStatus', JSON.stringify(data));
    toast({
      title: "Payment Confirmed!",
      description: "Your payment was successful. Please provide your email to receive the report.",
      duration: 3000,
    });
<<<<<<< HEAD
=======
    console.log("Client: Payment successful. State updated: paymentDone set, showEmailInput set to true.");
    console.log("Client: Current state after update attempt - paymentDone:", data, "showEmailInput:", true);
>>>>>>> c8341bb (Payment page update)
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

<<<<<<< HEAD
=======
    console.log("Client: Attempting to call processPaymentAndGenerateReport with:", {
      email: values.email,
      questionnaireDataExists: !!questionnaireData,
      paymentDataExists: !!paymentDone,
      paymentDoneData: paymentDone // Log the actual paymentDone data being sent
    });

>>>>>>> c8341bb (Payment page update)
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

  // Debugging indicator - this will show up if paymentDone and showEmailInput are true
  // before the return statement, helping confirm the state values at render time.
  console.log("Client: PaymentPage render. paymentDone:", !!paymentDone, "showEmailInput:", showEmailInput);
  if (paymentDone && showEmailInput) {
    console.log("Client: PaymentPage rendering email input form.");
    return (
<<<<<<< HEAD
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
=======
      <div className="min-h-screen flex items-center justify-center bg-white py-8 px-4">
        <Card className="w-full max-w-md mx-auto"> {/* Changed to Card for consistent styling */}
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">✓</span>
>>>>>>> c8341bb (Payment page update)
            </div>
            <CardTitle className="text-3xl font-bold text-primary mb-2">Payment Successful!</CardTitle>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Please enter your email to receive your personalized style report.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="bg-secondary/50 rounded-lg p-3 border border-border"> {/* Adjusted styling */}
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-foreground">{paymentDone.orderId}</p>
              </div>
<<<<<<< HEAD
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
=======
              <div className="bg-secondary/50 rounded-lg p-3 border border-border"> {/* Adjusted styling */}
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold text-primary">£{paymentDone.finalAmount.toFixed(2)}</p>
              </div>
              {paymentDone.discountCode && (
                <div className="bg-green-100 rounded-lg p-3 border border-green-200"> {/* Adjusted styling */}
                  <p className="text-sm text-green-700">Discount Applied</p>
                  <p className="font-semibold text-green-800">{paymentDone.discountCode}</p>
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          {...field}
                          type="email"
                          className="bg-background text-foreground placeholder:text-muted-foreground border-input focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-indigo-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isGeneratingReport}>
                  {isGeneratingReport ? <LoadingSpinner size={20} className="mr-2"/> : <Send className="mr-2 h-4 w-4" />}
                  Get My Report
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
>>>>>>> c8341bb (Payment page update)
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-gray-700 text-sm font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Final Step: Secure Payment
          </div>
        </div>

<<<<<<< HEAD
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">💎</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Complete Your Style Journey</h1>
            <p className="text-purple-100 text-lg mb-6">Get your personalized style report</p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
=======
        {/* Main card - Initial Payment Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">💎</span>
            </div>
            <CardTitle className="text-3xl font-bold text-primary mb-3">
              Complete Your Style Journey
            </CardTitle>
            <p className="text-muted-foreground text-lg mb-6">
              Get your personalized style report
            </p>
          </CardHeader>
          <CardContent>
            {/* Price display */}
            <div className="bg-secondary/50 border border-border rounded-lg p-6 mb-8">
>>>>>>> c8341bb (Payment page update)
              {percent > 0 ? (
                <div>
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl text-muted-foreground line-through">£{BASE_PRICE.toFixed(2)}</span>
                    <span className="text-4xl font-bold text-primary">£{finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 px-3 py-1 bg-green-100 rounded-full inline-block">
                    <span className="text-green-700 text-sm font-medium">{percent}% OFF Applied!</span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-4xl font-bold text-primary">£{BASE_PRICE.toFixed(2)}</span>
                  <div className="text-muted-foreground text-sm mt-1">One-time payment</div>
                </div>
              )}
            </div>

<<<<<<< HEAD
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
=======
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
            <div className="mt-8 pt-6 border-t border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="text-muted-foreground">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-xs">Secure</div>
                </div>
                <div className="text-muted-foreground">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs">Instant</div>
                </div>
                <div className="text-muted-foreground">
                  <div className="text-2xl mb-1">💯</div>
                  <div className="text-xs">Guaranteed</div>
                </div>
>>>>>>> c8341bb (Payment page update)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}