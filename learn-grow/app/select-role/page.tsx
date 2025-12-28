"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, CardBody, CardHeader, Input, Spinner } from "@nextui-org/react";
import { toast } from "react-toastify";

export default function SelectRolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("Invalid request. User ID not found.");
    }
  }, [userId]);

  const handleSubmit = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/select-role/${userId}`,
        {
          role: "student",
          name: name || undefined,
          phone: phone || undefined,
        }
      );

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken, user } = response.data.data;

        const Cookies = await import("js-cookie").then((m) => m.default);
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
        Cookies.set("userRole", user.role || "student");

        toast.success("You're all set! Redirecting to dashboard...");
        router.push("/student");
      } else {
        setError(response.data.message || "Failed to complete setup.");
        toast.error(response.data.message || "Failed to complete setup.");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to complete setup. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardBody className="p-6">
            <p className="text-red-600 font-semibold">Invalid request. User ID not found.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col gap-2 p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Finish your setup</h1>
          <p className="text-gray-600">All accounts are student accounts. Update your details if needed.</p>
        </CardHeader>
        <CardBody className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <Input
            label="Full Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />

          <Input
            label="Mobile Number"
            placeholder="+8801XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />

          <Button
            color="primary"
            className="w-full"
            onPress={handleSubmit}
            isDisabled={isLoading}
            isLoading={isLoading}
            startContent={isLoading ? <Spinner size="sm" color="white" /> : null}
          >
            Save & Continue
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
