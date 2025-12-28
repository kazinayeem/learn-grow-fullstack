"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader, RadioGroup, Radio, Spinner } from "@nextui-org/react";
import { toast } from "react-toastify";
import axios from "axios";
import { FaGraduationCap, FaChalkboardUser, FaUserShield } from "react-icons/fa6";

export default function SelectRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [selectedRole, setSelectedRole] = useState<"student" | "instructor" | "guardian">("student");
  const [isLoading, setIsLoading] = useState(false);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardBody className="p-6">
            <p className="text-red-600 font-semibold">Invalid request. User ID not found.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleSelectRole = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/select-role/${userId}`,
        { role: selectedRole }
      );

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken, user } = response.data.data;

        // Save tokens using js-cookie
        const Cookies = await import("js-cookie").then(m => m.default);
        Cookies.set("accessToken", accessToken, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        Cookies.set("refreshToken", refreshToken, {
          expires: 30,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
        Cookies.set("userRole", user.role);

        // Determine redirect path based on role
        const roleRedirects: Record<string, string> = {
          student: "/student",
          instructor: "/instructor",
          guardian: "/guardian",
          admin: "/admin",
        };

        const redirectPath = roleRedirects[user.role] || "/student";
        toast.success(`Welcome ${user.name}! Redirecting...`);
        router.push(redirectPath);
      } else {
        toast.error(response.data.message || "Failed to select role");
      }
    } catch (error: any) {
      console.error("Error selecting role:", error);
      toast.error(error.response?.data?.message || "Failed to select role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      value: "student" as const,
      label: "Student",
      description: "Learn from expert instructors and grow your skills",
      icon: <FaGraduationCap className="text-4xl text-blue-500" />,
    },
    {
      value: "instructor" as const,
      label: "Instructor",
      description: "Create and teach courses to students",
      icon: <FaChalkboardUser className="text-4xl text-green-500" />,
    },
    {
      value: "guardian" as const,
      label: "Guardian",
      description: "Monitor your child's learning progress",
      icon: <FaUserShield className="text-4xl text-purple-500" />,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-col gap-3 p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-800">Welcome! 👋</h1>
          <p className="text-gray-600">Please select your role to complete your registration</p>
        </CardHeader>

        <CardBody className="p-6 space-y-8">
          <RadioGroup
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as any)}
            className="w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.value} className="w-full">
                  <label
                    onClick={() => setSelectedRole(role.value)}
                    className={`w-full p-6 rounded-xl border-2 cursor-pointer transition-all block ${
                      selectedRole === role.value
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div>{role.icon}</div>
                      <h3 className="font-bold text-lg text-gray-800 text-center">{role.label}</h3>
                      <p className="text-sm text-gray-600 text-center">{role.description}</p>
                      <Radio value={role.value} className="mt-2" />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="flex gap-4 pt-6 border-t">
            <Button
              variant="bordered"
              size="lg"
              onPress={() => router.push("/login")}
              isDisabled={isLoading}
              className="flex-1"
            >
              Back to Login
            </Button>
            <Button
              color="primary"
              size="lg"
              onPress={handleSelectRole}
              isLoading={isLoading}
              isDisabled={isLoading}
              className="flex-1 font-semibold"
            >
              {isLoading ? "Setting up..." : "Continue"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
