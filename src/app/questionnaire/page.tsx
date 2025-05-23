"use client";

import QuestionnaireForm from "@/components/QuestionnaireForm";
// useAuth removed
import { useToast } from "@/hooks/use-toast";
// saveQuestionnaireData action removed, will be handled by payment action
import { useRouter } from "next/navigation";
import type { QuestionnaireData } from "@/types";
// Card, Button, Link imports might be adjusted if this page changes significantly, but for now, they are used for the intro text.

const PENDING_QUESTIONNAIRE_KEY = "pendingQuestionnaireData_v2"; 

export default function QuestionnairePage() {
  // Removed useAuth related logic
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (data: QuestionnaireData) => {
    // No longer checking currentUser, as auth is removed.
    // Always save to localStorage and redirect to payment.
    try {
      localStorage.setItem(PENDING_QUESTIONNAIRE_KEY, JSON.stringify(data));
      toast({ title: "Questionnaire Completed!", description: "Please proceed to payment to get your report." });
      router.push("/payment"); 
    } catch (error) {
      toast({ title: "Error Saving Answers", description: "Could not save your answers locally. Please try again.", variant: "destructive" });
      console.error("Error saving questionnaire to localStorage:", error);
    }
  };

  // Removed all conditional rendering based on userMeta or authLoading,
  // as there's no logged-in state.

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 p-6 bg-card border rounded-lg shadow">
        <h2 className="text-xl font-semibold text-primary mb-4">Before You Begin...</h2>
        <div className="space-y-3 text-sm text-foreground">
            <p>You will need a mirror, a metre stick, and a measuring tape.</p>
            <p>
                Before answering the questionnaire, think of three words to sum up
                the following - what characteristics do I want my style to reflect?
                E.g. quirky, creative, friendly, powerful, on-trend, approachable,
                or knowledgeable.
            </p>
            <p>
                Note that the words might change based on the occasion or situation.
                Now, think how these words might look as outfits and accessories.
                Bear these words in mind when choosing outfits to buy.
            </p>
            <p>
                Now, answer the questionnaire and recieve the results of your style
                analysis along with recommended items of clothes and accessories
                that will look best on each area of your body covered in the
                questions!
            </p>
        </div>
      </div>
      <QuestionnaireForm onSubmit={handleSubmit} />
    </div>
  );
}