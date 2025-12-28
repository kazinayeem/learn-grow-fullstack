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
  Spinner,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { login, loginWithGoogle } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";

type LoginMethod = "email" | "phone" | "password";

export default function LoginForm() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    return /^\d{10,}$/.test(phone.replace(/\D/g, ""));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Invalid email format");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        toast.success("Login successful!");
        const role = result.data?.user.role;

        // Redirect based on role
        const roleRedirects: Record<string, string> = {
          student: "/student",
          instructor: "/instructor",
          guardian: "/guardian",
          admin: "/admin",
        };

        const redirectUrl = roleRedirects[role || ""] || "/dashboard";
        router.push(redirectUrl);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Login failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      loginWithGoogle();
    } catch (err: any) {
      toast.error("Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm opacity-90">Sign in to your Learn & Grow account</p>
        </CardHeader>

        <Divider />

        <CardBody className="gap-6 p-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <Button
            isDisabled={isLoading}
            startContent={<FcGoogle size={20} />}
            fullWidth
            variant="bordered"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <Divider className="flex-1" />
            <span className="text-xs text-gray-500">OR</span>
            <Divider className="flex-1" />
          </div>

          {/* Login Method Selection - Email Only */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <Input
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={isLoading}
              size="lg"
              required
            />

            {/* Password Input */}
            <Input
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
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

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="flex flex-col gap-2 text-sm text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 font-semibold hover:text-purple-600"
              >
                Create one
              </Link>
            </p>
            <Link
              href="/forgot-password"
              className="text-indigo-600 hover:text-purple-600 text-xs"
            >
              Forgot your password?
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
