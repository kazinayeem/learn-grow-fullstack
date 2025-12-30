"use client";

<<<<<<< HEAD
import { useEffect, useRef, ReactNode } from "react";
=======
import { useEffect, useState, useRef, ReactNode } from "react";
>>>>>>> 85bc5c61374d940c6aa2f0fde8616367de30bcb3
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
<<<<<<< HEAD
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    
    const token = Cookies.get("accessToken");
    const isLoggedIn = !!token;

    if (redirectIfLoggedIn && isLoggedIn) {
      hasChecked.current = true;
      const role = Cookies.get("userRole") || "student";
=======
  const [isChecking, setIsChecking] = useState(true);
  const hasRedirected = useRef(false); // Prevent multiple redirects

  useEffect(() => {
    // Prevent multiple executions
    if (hasRedirected.current) {
      console.log("🔐 AuthGuard: Already redirected, skipping");
      return;
    }

    console.log("🔐 AuthGuard: useEffect triggered");
    console.log("🔐 AuthGuard: redirectIfLoggedIn =", redirectIfLoggedIn);
    console.log("🔐 AuthGuard: redirectTo =", redirectTo);
    
    // 🚨 FIRST: Clear logout flag when user reaches login page
    const isLoggingOut = sessionStorage.getItem("loggingOut") === "1";
    console.log("🔐 AuthGuard: loggingOut flag =", isLoggingOut);
    
    if (isLoggingOut) {
      console.log("🔐 AuthGuard: Clearing logout flag and showing login page");
      sessionStorage.removeItem("loggingOut");
      setIsChecking(false);
      return; // Don't redirect, let them see login page
    }

    // Check if user is already logged in
    const token = Cookies.get("accessToken");
    const role = Cookies.get("userRole");
    console.log("🔐 AuthGuard: token =", token ? "EXISTS" : "MISSING");
    console.log("🔐 AuthGuard: role =", role);

    if (redirectIfLoggedIn && token) {
      console.log("🔐 AuthGuard: User is logged in, redirecting away from login page");
      
>>>>>>> 85bc5c61374d940c6aa2f0fde8616367de30bcb3
      const roleRedirects: Record<string, string> = {
        student: "/student",
        instructor: "/instructor",
        guardian: "/guardian",
        admin: "/admin",
      };
<<<<<<< HEAD
      router.replace(roleRedirects[role] || redirectTo);
    }
  }, []);
=======

      const target = (redirectTo === "/student" || redirectTo === "/")
        ? (roleRedirects[role || "student"] || "/admin")
        : redirectTo;

      console.log("🔐 AuthGuard: Redirecting to:", target);
      hasRedirected.current = true; // Mark as redirected
      router.replace(target);
    } else {
      console.log("🔐 AuthGuard: Showing login page");
      setIsChecking(false);
    }
  }, []); // Empty dependency array - run only once
>>>>>>> 85bc5c61374d940c6aa2f0fde8616367de30bcb3

  return <>{children}</>;
}

export default AuthGuard;
