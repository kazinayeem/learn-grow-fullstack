"use client";

import Link from "next/link";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { FaArrowLeft, FaHome, FaShieldAlt, FaExclamationTriangle } from "react-icons/fa";
import { useEffect, useState, Suspense } from "react";

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<string | undefined>();
  const sessionExpired = searchParams?.get("session_expired") === "true";

  useEffect(() => {
    // Get role from cookies or try to get from localStorage
    let role = Cookies.get("userRole");
    if (!role && typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          role = JSON.parse(storedUser)?.role || undefined;
        } catch (e) {
          // ignore
        }
      }
    }
    setUserRole(role);
  }, []);

  const getRoleDashboard = (role?: string) => {
    const roleRedirects: Record<string, string> = {
      student: "/student",
      instructor: "/instructor",
      guardian: "/guardian",
      admin: "/admin",
      manager: "/manager",
    };
    return roleRedirects[role || "student"] || "/student";
  };

  const handleLogout = async () => {
    // Set logout flag
    sessionStorage.setItem("loggingOut", "1");

    // Clear all auth data
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    Cookies.remove("userRole", { path: "/" });
    Cookies.remove("token", { path: "/" });

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("refreshToken");
    }

    // Redirect to login
    router.replace("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 p-6 border-b bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            {sessionExpired ? <FaExclamationTriangle size={24} /> : <FaShieldAlt size={24} />}
            <h1 className="text-2xl font-bold">{sessionExpired ? "Session Expired" : "Access Denied"}</h1>
          </div>
          <p className="text-sm opacity-90">
            {sessionExpired 
              ? "Your session has expired. Please login again to continue." 
              : "You don't have permission to access this page"}
          </p>
        </CardHeader>

        <CardBody className="p-6 space-y-4">
          {sessionExpired ? (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
              <p className="text-gray-700 font-semibold">
                🕐 Your session has expired after being logged in for an extended period.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                For security reasons, you need to login again to continue using the platform.
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-gray-700">
                Your current role:{" "}
                <strong className="text-orange-600 uppercase">
                  {userRole || "unknown"}
                </strong>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                You are not authorized to view this page. Please login with an
                account that has the necessary permissions.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {sessionExpired ? (
              <Link href="/login" className="block">
                <Button
                  color="primary"
                  size="lg"
                  className="w-full font-semibold"
                >
                  Login Again
                </Button>
              </Link>
            ) : (
              <Button
                color="danger"
                variant="flat"
                size="lg"
                onClick={handleLogout}
                className="w-full font-semibold"
              >
                Logout & Go to Login
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
}
