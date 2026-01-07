"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@nextui-org/react";
import { handleOAuthCallback } from "@/lib/auth";
import { toast } from "react-toastify";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const success = handleOAuthCallback(searchParams);

        if (success) {
          const role = searchParams.get("role");
          const redirect = searchParams.get("redirect");
          const redirectUrl = redirect || "/student"; // Default to /student
          
          // Small delay to ensure user data is saved
          await new Promise(resolve => setTimeout(resolve, 500));
          
          toast.success("Login successful!");
          router.push(redirectUrl);
        } else {
          toast.error("Authentication failed. Please try again.");
          router.push("/login");
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.");
        router.push("/login");
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Spinner size="lg" color="current" />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
