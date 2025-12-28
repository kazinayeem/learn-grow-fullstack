"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Spinner } from "@nextui-org/react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[]; // e.g., ["student"] or ["instructor"] or ["student", "instructor"]
  redirectTo?: string;
}

export function RoleGuard({ 
  children, 
  allowedRoles = [],
  redirectTo = "/unauthorized"
}: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    const userRole = Cookies.get("userRole");

    // Not logged in
    if (!token) {
      router.push("/login");
      return;
    }

    // Check if user's role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole || "")) {
      router.push(redirectTo);
      return;
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, [allowedRoles, redirectTo, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="current" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return children;
}

export default RoleGuard;
