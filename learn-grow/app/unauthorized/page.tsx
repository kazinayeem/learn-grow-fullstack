"use client";

import Link from "next/link";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { FaArrowLeft, FaHome, FaShieldAlt } from "react-icons/fa";

export default function UnauthorizedPage() {
  const router = useRouter();
  const userRole = Cookies.get("userRole");

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 p-6 border-b bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <FaShieldAlt size={24} />
            <h1 className="text-2xl font-bold">Access Denied</h1>
          </div>
          <p className="text-sm opacity-90">You don't have permission to access this page</p>
        </CardHeader>

        <CardBody className="p-6 space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-gray-700">
              Your current role: <strong className="text-orange-600 uppercase">{userRole || "unknown"}</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              You are not authorized to view this page. Please return to your dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <Link href={getRoleDashboard(userRole)} className="block">
              <Button
                color="primary"
                size="lg"
                className="w-full font-semibold"
                startContent={<FaHome />}
              >
                Go to My Dashboard
              </Button>
            </Link>
            <Button
              variant="bordered"
              size="lg"
              onClick={() => router.back()}
              startContent={<FaArrowLeft />}
              className="w-full"
            >
              Go Back
            </Button>
          </div>

          {/* Role Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Role Access:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>👤 <strong>Student:</strong> /student</li>
              <li>👨‍🏫 <strong>Instructor:</strong> /instructor</li>
              <li>👪 <strong>Guardian:</strong> /guardian</li>
              <li>⚙️ <strong>Admin:</strong> /admin</li>
              <li>💼 <strong>Manager:</strong> /manager</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
