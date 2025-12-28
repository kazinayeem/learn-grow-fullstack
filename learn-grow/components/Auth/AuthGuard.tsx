"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Spinner } from "@nextui-org/react";

interface AuthGuardProps {
  children: ReactNode;
  redirectIfLoggedIn?: boolean; // If true, redirect logged-in users away from this page
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  redirectIfLoggedIn = false, 
  redirectTo = "/" 
}: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    const isLoggedIn = !!token;

    if (redirectIfLoggedIn && isLoggedIn) {
      // User is logged in and trying to access login/register
      // Redirect based on their role
      const role = Cookies.get("userRole") || "student";
      const roleRedirects: Record<string, string> = {
        student: "/student",
        instructor: "/instructor",
        guardian: "/guardian",
        admin: "/admin",
      };
      router.push(roleRedirects[role] || redirectTo);
    } else {
      setIsChecking(false);
    }
  }, [redirectIfLoggedIn, redirectTo, router]);

  if (isChecking && redirectIfLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="current" />
      </div>
    );
  }

  return children;
}

export default AuthGuard;
