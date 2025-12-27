"use client";

import React, { useState } from "react";
import { Input, Button, Card, CardBody, CardHeader, Divider, Link, Chip } from "@nextui-org/react";
import { useSendEmailOtpMutation, useVerifyEmailOtpMutation } from "@/redux/api/authApi";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "otp">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState("");

    const [sendEmailOtp, { isLoading: isSendingOtp }] = useSendEmailOtpMutation();
    const [verifyEmailOtp, { isLoading: isVerifying }] = useVerifyEmailOtpMutation();

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSendOtp = async () => {
        setError("");
        
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            await sendEmailOtp({ email }).unwrap();
            setStep("otp");
            setTimer(60);
            
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
        } catch (error: any) {
            setError(error?.data?.message || "Failed to send OTP. Please try again.");
        }
    };

    const decodeJwt = (token: string): any | null => {
        try {
            const parts = token.split(".");
            if (parts.length < 2) return null;
            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
            const json = atob(padded);
            return JSON.parse(json);
        } catch {
            return null;
        }
    };

    const roleRedirect = (role?: string) => {
        const map: Record<string, string> = {
            admin: "/admin",
            instructor: "/instructor",
            student: "/student",
            guardian: "/guardian",
        };
        return map[role || ""] || "/dashboard";
    };

    const handleVerifyOtp = async () => {
        setError("");
        
        if (otp.length !== 6) {
            setError("Please enter a 6-digit OTP");
            return;
        }

        try {
            const result = await verifyEmailOtp({ email, otp }).unwrap();
            const token = result?.data?.accessToken || result?.accessToken;
            let user = result?.data?.user || result?.user;

            if (!token) {
                throw new Error("No access token returned by server");
            }

            // Persist token first so subsequent API calls include Authorization
            localStorage.setItem("token", token);

            // If backend didn't return user, decode from JWT payload
            if (!user) {
                const payload = decodeJwt(token);
                if (payload) {
                    user = {
                        _id: payload._id || payload.id || payload.userId || payload.sub,
                        email: payload.email,
                        name: payload.name,
                        role: payload.role || "student",
                    };
                }
            }

            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
            }

            // Redirect based on role if available
            const target = roleRedirect(user?.role);
            router.push(target);
        } catch (error: any) {
            setError(error?.data?.message || "Invalid OTP. Please try again.");
        }
    };

    const handleGoogleLogin = () => {
        // This will be implemented with NextAuth or backend OAuth
        setError("Google login will be available soon");
    };

    // Dev quick login (one-click)
    const handleDevLogin = (role: "admin" | "instructor" | "student" | "guardian") => {
        const routeMap: Record<string, string> = {
            admin: "/admin",
            instructor: "/instructor",
            student: "/student",
            guardian: "/guardian",
        };

        const demoUsers: Record<string, { name: string; email: string; profileImage?: string }> = {
            admin: { name: "Super Admin", email: "superadmin@example.com", profileImage: "https://example.com/super-admin.png" },
            instructor: { name: "Instructor One", email: "instructor@example.com", profileImage: "https://example.com/instructor.png" },
            student: { name: "Student One", email: "student@example.com", profileImage: "https://example.com/student.png" },
            guardian: { name: "Guardian One", email: "guardian@example.com", profileImage: "https://example.com/guardian.png" },
        };

        const user = { ...demoUsers[role], role };
        localStorage.setItem("token", "dev-token");
        localStorage.setItem("user", JSON.stringify(user));
        router.push(routeMap[role] || "/dashboard");
    };

    const handleBack = () => {
        setStep("email");
        setOtp("");
        setError("");
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <Card className="w-full max-w-md shadow-2xl border border-gray-700 bg-gray-800/50 backdrop-blur-xl">
                <CardHeader className="flex flex-col gap-2 items-center pt-8 pb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-gray-400">Login to your account</p>
                    {step === "otp" && (
                        <Chip color="primary" variant="flat" size="sm" className="mt-2">
                            Step 2 of 2
                        </Chip>
                    )}
                </CardHeader>
                
                <Divider className="bg-gray-700" />
                
                <CardBody className="gap-6 p-8">
                    {step === "email" ? (
                        <>
                            {/* Email Input Step */}
                            <div className="space-y-4">
                                <Input
                                    type="email"
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    variant="bordered"
                                    classNames={{
                                        input: "text-white",
                                        label: "text-gray-400",
                                        inputWrapper: "border-gray-600 hover:border-blue-500"
                                    }}
                                    startContent={
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    }
                                />
                                
                                {error && (
                                    <div className="text-red-400 text-sm flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                <Button 
                                    color="primary" 
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold"
                                    onPress={handleSendOtp} 
                                    isLoading={isSendingOtp}
                                    isDisabled={!isValidEmail(email)}
                                >
                                    Send OTP
                                </Button>
                            </div>

                            {/* Divider with "OR" */}
                            <div className="relative">
                                <Divider className="bg-gray-700" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-gray-800 px-3 text-sm text-gray-400">OR</span>
                                </div>
                            </div>

                            {/* Google Login Button */}
                            <Button
                                size="lg"
                                variant="bordered"
                                className="w-full border-gray-600 hover:border-gray-500 text-white"
                                startContent={
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                }
                                onPress={handleGoogleLogin}
                            >
                                Continue with Google
                            </Button>

                            {process.env.NODE_ENV === "development" && (
                                <div className="mt-6 space-y-3">
                                    <p className="text-xs text-gray-400">Dev Quick Login</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button className="bg-purple-600 text-white" onPress={() => handleDevLogin("admin")}>Super Admin</Button>
                                        <Button className="bg-blue-600 text-white" onPress={() => handleDevLogin("instructor")}>Instructor</Button>
                                        <Button className="bg-green-600 text-white" onPress={() => handleDevLogin("student")}>Student</Button>
                                        <Button className="bg-amber-600 text-white" onPress={() => handleDevLogin("guardian")}>Guardian</Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* OTP Verification Step */}
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <p className="text-gray-400 text-sm">
                                        We've sent a 6-digit code to
                                    </p>
                                    <p className="text-white font-semibold">{email}</p>
                                </div>

                                <Input
                                    type="text"
                                    label="Enter OTP"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    variant="bordered"
                                    maxLength={6}
                                    classNames={{
                                        input: "text-white text-center text-2xl tracking-widest",
                                        label: "text-gray-400",
                                        inputWrapper: "border-gray-600 hover:border-blue-500"
                                    }}
                                />

                                {error && (
                                    <div className="text-red-400 text-sm flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                <Button 
                                    color="success" 
                                    size="lg"
                                    className="w-full font-semibold"
                                    onPress={handleVerifyOtp} 
                                    isLoading={isVerifying}
                                    isDisabled={otp.length !== 6}
                                >
                                    Verify & Login
                                </Button>

                                <div className="flex justify-between items-center">
                                    <Button
                                        size="sm"
                                        variant="light"
                                        className="text-gray-400 hover:text-white"
                                        onPress={handleBack}
                                    >
                                        ← Change Email
                                    </Button>
                                    
                                    {timer > 0 ? (
                                        <span className="text-sm text-gray-400">
                                            Resend in {timer}s
                                        </span>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="light"
                                            className="text-blue-400 hover:text-blue-300"
                                            onPress={handleSendOtp}
                                        >
                                            Resend OTP
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="text-center text-sm text-gray-400 mt-4">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                            Create Account
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
