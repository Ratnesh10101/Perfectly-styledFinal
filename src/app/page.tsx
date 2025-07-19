"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../config/firebase";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleStart = async () => {
    if (!isValidEmail(email)) return;

    try {
      setLoading(true);
      const docRef = doc(firestore, "questionnaire_responses", email);
      await setDoc(
        docRef,
        {
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: "email_entered",
        },
        { merge: true }
      );

      router.push(`/questionnaire?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error("Failed to save email:", err);
      alert("Something went wrong saving your email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
      {/* Left Image */}
      <div className="hidden lg:block mr-6">
        <img
          src="/Images/left-side.png"
          alt="Left style visual"
          className="w-[300px] h-[500px] object-cover rounded-lg shadow-md"
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-4xl font-bold tracking-tight text-primary">
              Welcome to Perfectly Styled!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Our analysis helps you understand your body shape, scale and line
              to curate a wardrobe that truly represents you. Please note that
              this analysis is designed only for women.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-1">
                  Personalised Insights
                </h3>
                <p className="text-sm text-muted-foreground">
                  Unlock recommendations tailored to your specific features.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-1">
                  Exhaustive and Detailed
                </h3>
                <p className="text-sm text-muted-foreground">
                  The questionnaire is thorough and the report is very detailed.
                  It covers all aspects of clothes and accessories.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-1">Boost Confidence</h3>
                <p className="text-sm text-muted-foreground">
                  Dress with confidence knowing your outfits are perfectly
                  styled for you.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-left text-muted-foreground"
              >
                Enter your email to continue:
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
              />
              {touched && !isValidEmail(email) && (
                <p className="text-sm text-red-600 text-left">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <p className="text-muted-foreground">
              First, complete our questionnaire. Then, proceed to get your
              comprehensive style report.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pt-6">
            <Button
              size="lg"
              disabled={!isValidEmail(email) || loading}
              onClick={handleStart}
            >
              {loading ? "Saving..." : "Start Your Questionnaire"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Image */}
      <div className="hidden lg:block ml-6">
        <img
          src="/Images/right-side.png"
          alt="Right style visual"
          className="w-[300px] h-[500px] object-cover rounded-lg shadow-md"
        />
      </div>
    </div>
  );
}
