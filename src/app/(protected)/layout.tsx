// app/(protected)/layout.tsx
'use client'; // This is a Client Component because it uses hooks and client-side Firebase Auth

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase'; // Your client-side Firebase setup
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from '@/components/LoadingSpinner'; // Make sure this path is correct

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isQuestionnaireCompleted, setIsQuestionnaireCompleted] = useState(false);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User is NOT authenticated, redirect them to the questionnaire page
        router.replace('/questionnaire');
        setIsLoading(false);
        return; // Stop further execution
      }

      // User IS authenticated
      setIsAuthenticated(true);
      const userId = user.uid;
      const userDocRef = doc(db, 'users', userId); // Reference to the user's document in Firestore

      try {
        const userDocSnap = await getDoc(userDocRef); // Fetch the user's document
        if (userDocSnap.exists() && userDocSnap.data()?.questionnaireCompleted) {
          // Questionnaire is completed
          setIsQuestionnaireCompleted(true);
        } else {
          // Questionnaire NOT completed, redirect
          router.replace('/questionnaire');
        }
      } catch (error) {
        console.error('Error fetching questionnaire status:', error);
        // In case of an error (e.g., network issue, Firestore rules), redirect to be safe
        router.replace('/questionnaire');
      } finally {
        setIsLoading(false); // Stop loading once checks are done
      }
    });

    return () => unsubscribe(); // Clean up the auth state listener when component unmounts
  }, [router]); // Dependency array: re-run effect if router changes (unlikely)

  // Show a loading spinner while we are checking authentication and questionnaire status
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If, after loading, the user is not authenticated or questionnaire is not completed,
  // the router.replace() would have already occurred. This `null` prevents rendering
  // any content before the redirect takes effect.
  if (!isAuthenticated || !isQuestionnaireCompleted) {
    return null;
  }

  // If authenticated and questionnaire completed, render the children (the protected page content)
  return <>{children}</>;
}
