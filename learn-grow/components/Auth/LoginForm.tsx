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
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { login, loginWithGoogle } from "@/lib/auth";
import { FcGoogle } from "react-icons/fc";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Demo credentials
  const demoAccounts = [
    { label: "👨‍💼 Admin", email: "admin@learngrow.com", password: "admin123", icon: "🔐" },
    { label: "👨‍🎓 Student", email: "demo@learngrow.com", password: "demo123", icon: "📚" },
    { label: "👨‍🏫 Instructor", email: "instructor@learngrow.com", password: "demo123", icon: "🎓" },
    { label: "👔 Manager", email: "manager@learngrow.com", password: "demo123", icon: "💼" },
  ];

  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
        // Get user role and redirect to appropriate dashboard
        const role = result.data?.user.role;
        
        toast.success("Login successful! Redirecting to dashboard...");
        
        // Redirect based on role
        if (role === "admin" || role === "super_admin") {
          router.push("/admin");
        } else if (role === "instructor") {
          router.push("/instructor");
        } else if (role === "guardian") {
          router.push("/guardian");
        } else if (role === "student") {
          router.push("/student");
        } else {
          router.push("/");
        }
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

          {/* Demo Credentials */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 text-center">
              🎯 Quick Login - Click to auto-fill:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {demoAccounts.map((account, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="flat"
                  color={index === 0 ? "danger" : index === 1 ? "primary" : index === 2 ? "success" : "warning"}
                  onClick={() => fillDemoCredentials(account.email, account.password)}
                  className="text-xs font-medium"
                  disabled={isLoading}
                >
                  <span className="flex flex-col items-center gap-1">
                    <span className="text-lg">{account.icon}</span>
                    <span>{account.label.split(" ")[1]}</span>
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Login Form */}
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
