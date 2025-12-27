"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@nextui-org/react";
import { handleOAuthCallback } from "@/lib/auth";
import { toast } from "react-toastify";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const success = handleOAuthCallback(searchParams);

        if (success) {
          const role = searchParams.get("role");
          const roleRedirects: Record<string, string> = {
            student: "/student/dashboard",
            instructor: "/instructor/dashboard",
            guardian: "/guardian/dashboard",
            admin: "/admin",
          };

          const redirectUrl = roleRedirects[role || "student"] || "/dashboard";
          toast.success("Google login successful!");
          router.push(redirectUrl);
        } else {
          toast.error("Authentication failed. Please try again.");
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
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
