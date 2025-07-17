
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftingCompass } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center justify-center text-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-4xl font-bold tracking-tight text-primary">
              Welcome to Perfectly Styled!
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Our analysis helps you understand your body shape, scale and line to curate a wardrobe that truly represents you. Please note that this analysis is designed only for women.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-1">Personalised Insights</h3>
                <p className="text-sm text-muted-foreground">Unlock recommendations tailored to your specific features.</p>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-1">Exhaustive and Detailed</h3>
                <p className="text-sm text-muted-foreground">The questionnaire is thorough and the report is full of detail and covers all aspects of clothes and accessories.</p>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold text-lg mb-1">Boost Confidence</h3>
                <p className="text-sm text-muted-foreground">Dress with confidence knowing your outfits are perfectly styled for you.</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              First, complete our questionnaire. Then, proceed to get your comprehensive style report.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button asChild size="lg">
              <Link href="/questionnaire">
                Start Your Questionnaire
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
