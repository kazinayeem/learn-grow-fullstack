"use client";

import React, { useState } from "react";
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Link,
  RadioGroup,
  Radio,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { sendOTP, verifyOTP, register, loginWithGoogle } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";

type Step = "contact" | "otp" | "details";

export default function RegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("contact");
  // Email-only flow; phone collected later in details step
  const [contactMethod] = useState<"email">("email");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\d{10,}$/.test(phone.replace(/\D/g, ""));
  };

  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSendOTP = async () => {
    setError("");

    if (!formData.email) {
      setError("Email is required");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError("Invalid email format");
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendOTP(formData.email, undefined);

      if (result.success) {
        setStep("otp");
        setTimer(300); // 5 minutes

        // Timer countdown
        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast.success("OTP sent successfully!");
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to send OTP";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");

    if (!formData.otp) {
      setError("OTP is required");
      return;
    }

    if (formData.otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOTP(formData.otp, formData.email, undefined);

      if (result.success) {
        setStep("details");
        toast.success("OTP verified!");
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to verify OTP";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate name
    if (!formData.name) {
      setError("Name is required");
      return;
    }

    // Validate password
    if (!formData.password) {
      setError("Password is required");
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: "student",
      };

      const result = await register(userData as any);

      if (result.success) {
        toast.success("Registration successful! Redirecting to dashboard...");
        router.push("/student");
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Registration failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleGoogleSignup = () => {
    try {
      loginWithGoogle();
    } catch (err: any) {
      toast.error("Google sign up failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-sm opacity-90">Join Learn & Grow today as a Student</p>
        </CardHeader>

        <Divider />

        <CardBody className="gap-6 p-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Signup Button - shown on all steps */}
          {step === "contact" && (
            <>
              <Button
                isDisabled={isLoading}
                startContent={<FcGoogle size={20} />}
                fullWidth
                variant="bordered"
                onClick={handleGoogleSignup}
              >
                Sign up with Google
              </Button>

              <div className="flex items-center gap-3">
                <Divider className="flex-1" />
                <span className="text-xs text-gray-500">OR</span>
                <Divider className="flex-1" />
              </div>
            </>
          )}

          {/* Step 1: Contact Information (Email only) */}
          {step === "contact" && (
            <div className="space-y-4">
              <Input
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />

              <Button
                fullWidth
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
                onClick={handleSendOTP}
                disabled={isLoading}
                isLoading={isLoading}
              >
                Send OTP
              </Button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  OTP sent to{" "}
                  <span className="font-semibold">
                    {contactMethod === "email" ? formData.email : formData.phone}
                  </span>
                </p>
              </div>

              <Input
                label="Enter OTP"
                placeholder="000000"
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                maxLength={6}
                disabled={isLoading}
              />

              <div className="text-center text-sm text-gray-600">
                {timer > 0 ? (
                  <p>Expires in: {formatTimer()}</p>
                ) : (
                  <p>OTP expired. Please request a new one.</p>
                )}
              </div>

              <Button
                fullWidth
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
                onClick={handleVerifyOTP}
                disabled={isLoading || timer === 0}
                isLoading={isLoading}
              >
                Verify OTP
              </Button>

              <Button
                fullWidth
                variant="light"
                onClick={() => {
                  setStep("contact");
                  setFormData({ ...formData, otp: "" });
                  setError("");
                }}
              >
                Back to Contact
              </Button>
            </div>
          )}

          {/* Step 3: Account Details */}
          {step === "details" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />

              <Input
                label="Phone Number (optional)"
                placeholder="+1 (555) 000-0000"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading}
              />

              <Input
                label="Password"
                placeholder="Enter a strong password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-default-400 hover:text-default-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                }
                required
              />

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-default-400 hover:text-default-600"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                }
                required
              />

              <Button
                type="submit"
                fullWidth
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}

          <div className="flex flex-col gap-2 text-sm text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 font-semibold hover:text-purple-600">
                Sign in
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
