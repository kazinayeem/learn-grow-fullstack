"use client";

import React, { useState } from "react";
import { Input, Button, Card, CardBody, CardHeader, Link, Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";

type ForgotPasswordStep = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/forgot-password`, { email });

      if (response.data.success) {
        toast.success("OTP sent to your email!");
        setStep("otp");
      } else {
        setError(response.data.message || "Failed to send OTP");
        toast.error(response.data.message);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to send OTP";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/verify-forgot-password-otp`, {
        email,
        otp,
      });

      if (response.data.success) {
        toast.success("OTP verified!");
        setStep("password");
      } else {
        setError(response.data.message || "Invalid OTP");
        toast.error(response.data.message);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to verify OTP";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/reset-password`, {
        email,
        otp,
        newPassword: password,
      });

      if (response.data.success) {
        toast.success("Password reset successfully!");
        router.push("/login");
      } else {
        setError(response.data.message || "Failed to reset password");
        toast.error(response.data.message);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to reset password";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 p-6 border-b">
          <Link href="/login" color="primary" className="flex items-center gap-2 w-fit">
            <FaArrowLeft size={16} />
            Back to Login
          </Link>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-gray-600">
            {step === "email" && "Enter your email to receive an OTP"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "password" && "Create a new password"}
          </p>
        </CardHeader>

        <CardBody className="p-6 space-y-4">
          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<FaEnvelope className="text-gray-400" />}
                disabled={isLoading}
                size="lg"
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button
                color="primary"
                size="lg"
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full font-semibold"
              >
                Send OTP
              </Button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  We've sent a 6-digit OTP to <br />
                  <strong>{email}</strong>
                </p>
              </div>
              <Input
                type="text"
                label="Enter OTP"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                maxLength={6}
                disabled={isLoading}
                size="lg"
                className="text-center text-2xl tracking-widest"
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button
                color="primary"
                size="lg"
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full font-semibold"
              >
                Verify OTP
              </Button>
              <Button
                variant="light"
                size="sm"
                onPress={() => setStep("email")}
                disabled={isLoading}
                className="w-full"
              >
                Use Different Email
              </Button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700">
                  Enter your new password below
                </p>
              </div>
              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                size="lg"
                endContent={
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    className="text-gray-400"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                }
              />
              <Input
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                size="lg"
              />
              <p className="text-xs text-gray-600">
                Password must be at least 8 characters long
              </p>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button
                color="primary"
                size="lg"
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full font-semibold"
              >
                Reset Password
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
