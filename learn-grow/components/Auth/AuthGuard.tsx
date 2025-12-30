"use client";

import { useEffect, useRef, ReactNode } from "react";
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
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    
    const token = Cookies.get("accessToken");
    const isLoggedIn = !!token;

    if (redirectIfLoggedIn && isLoggedIn) {
      hasChecked.current = true;
      const role = Cookies.get("userRole") || "student";
      const roleRedirects: Record<string, string> = {
        student: "/student",
        instructor: "/instructor",
        guardian: "/guardian",
        admin: "/admin",
      };
      router.replace(roleRedirects[role] || redirectTo);
    }
  }, []);

  return <>{children}</>;
}

export default AuthGuard;
