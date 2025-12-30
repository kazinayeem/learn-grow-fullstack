"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";
import Cookies from "js-cookie";

interface RequireAuthProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const hasChecked = useRef(false); // Prevent multiple checks

   useEffect(() => {
    // Prevent multiple executions
    if (hasChecked.current) {
      console.log("🔒 RequireAuth: Already checked, skipping");
      return;
    }
    hasChecked.current = true;

    console.log("🔒 RequireAuth: useEffect triggered");
    
    // 🚨 FIRST: Check if logout is in progress
    const loggingOut = sessionStorage.getItem("loggingOut");
    console.log("🔒 RequireAuth: loggingOut flag =", loggingOut);
    
    if (loggingOut === "1") {
      console.log("🔒 RequireAuth: Logout in progress, redirecting to /login");
      setLoading(false);
      router.replace("/login");
      return;
    }

    // Check authentication
    const token = Cookies.get("accessToken");
    const role = Cookies.get("userRole");
    console.log("🔒 RequireAuth: token =", token ? "EXISTS" : "MISSING");
    console.log("🔒 RequireAuth: role =", role);
    console.log("🔒 RequireAuth: allowedRoles =", allowedRoles);

    if (!token) {
      console.log("🔒 RequireAuth: No token found, redirecting to /login");
      setLoading(false);
      router.replace("/login");
      return;
    }

    // Check role authorization
    if (allowedRoles && !allowedRoles.includes(role || "")) {
      console.log("🔒 RequireAuth: Role not authorized, redirecting to /unauthorized");
      console.log("🔒 RequireAuth: User role:", role, "Allowed roles:", allowedRoles);
      setLoading(false);
      router.replace("/unauthorized");
      return;
    }

    // All checks passed
    console.log("🔒 RequireAuth: All checks passed, user authorized");
    setAuthorized(true);
    setLoading(false);
  }, []); // Empty dependency array - run only once


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Verifying access..." />
            </div>
        );
    }

    if (!authorized) {
        return null;
    }

    return children;
}
