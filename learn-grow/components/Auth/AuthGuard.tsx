"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface AuthGuardProps {
  children: ReactNode;
  redirectIfLoggedIn?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  redirectIfLoggedIn = false,
  redirectTo = "/"
}: AuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);
  const hasRedirected = useRef(false); // Prevent multiple redirects

  useEffect(() => {
    // Prevent multiple executions
    if (hasRedirected.current) {
      return;
    }


    // 🚨 FIRST: Clear logout flag when user reaches login page
    const isLoggingOut = sessionStorage.getItem("loggingOut") === "1";

    if (isLoggingOut) {
      sessionStorage.removeItem("loggingOut");
      setIsChecking(false);
      setShouldRender(true);
      return; // Don't redirect, let them see login page
    }

    // Check if user is already logged in
    const token = Cookies.get("accessToken");
    const role = Cookies.get("userRole");

    if (redirectIfLoggedIn && token) {

      const roleRedirects: Record<string, string> = {
        student: "/student",
        instructor: "/instructor",
        guardian: "/guardian",
        admin: "/admin",
      };

      const target = (redirectTo === "/student" || redirectTo === "/")
        ? (roleRedirects[role || "student"] || "/admin")
        : redirectTo;

      hasRedirected.current = true; // Mark as redirected
      router.replace(target);
      return; // Don't set shouldRender to true - redirecting
    } else {
      setIsChecking(false);
      setShouldRender(true);
    }
  }, []); // Empty dependency array - run only once

  // Don't render children while checking auth or if redirecting
  if (isChecking || !shouldRender) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
