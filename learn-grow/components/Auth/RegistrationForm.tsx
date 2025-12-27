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
import { sendOTP, verifyOTP, register } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";

type Step = "role" | "contact" | "otp" | "details";

export default function RegistrationForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"student" | "instructor" | "guardian">("student");
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email");
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

    if (contactMethod === "email") {
      if (!formData.email) {
        setError("Email is required");
        return;
      }
      if (!isValidEmail(formData.email)) {
        setError("Invalid email format");
        return;
      }
    } else {
      if (!formData.phone) {
        setError("Phone number is required");
        return;
      }
      if (!isValidPhone(formData.phone)) {
        setError("Invalid phone number (minimum 10 digits)");
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await sendOTP(
        contactMethod === "email" ? formData.email : undefined,
        contactMethod === "phone" ? formData.phone : undefined
      );

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
      const result = await verifyOTP(
        formData.otp,
        contactMethod === "email" ? formData.email : undefined,
        contactMethod === "phone" ? formData.phone : undefined
      );

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
        email: contactMethod === "email" ? formData.email : undefined,
        phone: contactMethod === "phone" ? formData.phone : undefined,
        password: formData.password,
        role,
      };

      const result = await register(userData as any);

      if (result.success) {
        toast.success(`Registration successful as ${role}!`);

        // Redirect based on role
        const roleRedirects: Record<string, string> = {
          student: "/student",
          instructor: "/instructor",
          guardian: "/guardian",
        };

        const redirectUrl = roleRedirects[role] || "/dashboard";
        router.push(redirectUrl);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-sm opacity-90">Join Learn & Grow today</p>
        </CardHeader>

        <Divider />

        <CardBody className="gap-6 p-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === "role" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold mb-4">Select your role</h2>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => {
                    setRole(value as any);
                    setError("");
                  }}
                >
                  <div className="space-y-3">
                    <Card className="cursor-pointer hover:bg-blue-50" isPressable onClick={() => setRole("student")}>
                      <CardBody>
                        <div className="flex items-center gap-3">
                          <Radio value="student" />
                          <div>
                            <p className="font-semibold">Student</p>
                            <p className="text-sm text-gray-600">Learn from our expert instructors</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="cursor-pointer hover:bg-blue-50" isPressable onClick={() => setRole("instructor")}>
                      <CardBody>
                        <div className="flex items-center gap-3">
                          <Radio value="instructor" />
                          <div>
                            <p className="font-semibold">Instructor</p>
                            <p className="text-sm text-gray-600">Share your knowledge and teach</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="cursor-pointer hover:bg-blue-50" isPressable onClick={() => setRole("guardian")}>
                      <CardBody>
                        <div className="flex items-center gap-3">
                          <Radio value="guardian" />
                          <div>
                            <p className="font-semibold">Guardian/Parent</p>
                            <p className="text-sm text-gray-600">Monitor your child's progress</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              <Button
                fullWidth
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
                onClick={() => setStep("contact")}
              >
                Continue as {role.charAt(0).toUpperCase() + role.slice(1)}
              </Button>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === "contact" && (
            <div className="space-y-4">
              <Button
                size="sm"
                variant="light"
                onClick={() => setStep("role")}
                className="text-indigo-600"
              >
                ← Change Role
              </Button>

              <RadioGroup
                label="Contact method"
                value={contactMethod}
                onValueChange={(value) => {
                  setContactMethod(value as "email" | "phone");
                  setFormData({ ...formData, otp: "", email: "", phone: "" });
                  setError("");
                }}
                orientation="horizontal"
              >
                <Radio value="email">Email</Radio>
                <Radio value="phone">Phone</Radio>
              </RadioGroup>

              {contactMethod === "email" && (
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
              )}

              {contactMethod === "phone" && (
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              )}

              <Button
                fullWidth
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
                disabled={isLoading}
                isLoading={isLoading}
                onClick={handleSendOTP}
              >
                Send OTP
              </Button>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === "otp" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Enter the OTP sent to your {contactMethod}
                </p>
                <Input
                  label="OTP"
                  placeholder="000000"
                  maxLength={6}
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {timer > 0 ? `Expires in: ${formatTimer()}` : "OTP expired"}
                </span>
                {timer === 0 && (
                  <Button
                    size="sm"
                    variant="light"
                    onClick={handleSendOTP}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </Button>
                )}
              </div>

              <Button
                fullWidth
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
                disabled={isLoading || timer === 0}
                isLoading={isLoading}
                onClick={handleVerifyOTP}
              >
                Verify OTP
              </Button>
            </div>
          )}

          {/* Step 4: User Details */}
          {step === "details" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />

              <Input
                label="Password"
                placeholder="At least 6 characters"
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
                placeholder="Re-enter password"
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
                Create Account
              </Button>
            </form>
          )}

          {step !== "role" && (
            <>
              <Divider />
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 font-semibold hover:text-purple-600"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
