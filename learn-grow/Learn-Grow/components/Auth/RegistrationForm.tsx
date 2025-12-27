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
    Chip,
} from "@nextui-org/react";
import { useSendEmailOtpMutation, useVerifyEmailOtpMutation, useRegisterMutation } from "@/redux/api/authApi";
import { useRouter } from "next/navigation";

export default function RegistrationForm() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "otp" | "details">("email");
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
        name: "",
    });
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState("");

    const [sendEmailOtp, { isLoading: isSendingOtp }] = useSendEmailOtpMutation();
    const [verifyEmailOtp, { isLoading: isVerifyingOtp }] = useVerifyEmailOtpMutation();
    const [register, { isLoading: isRegistering }] = useRegisterMutation();

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        setError("");
        
        if (!isValidEmail(formData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            await sendEmailOtp({ email: formData.email }).unwrap();
            setStep("otp");
            setTimer(60);
            
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

    const handleVerifyOtp = async () => {
        setError("");
        
        if (formData.otp.length !== 6) {
            setError("Please enter a 6-digit OTP");
            return;
        }

        try {
            await verifyEmailOtp({ 
                email: formData.email, 
                otp: formData.otp 
            }).unwrap();
            setStep("details");
        } catch (error: any) {
            setError(error?.data?.message || "Invalid OTP. Please try again.");
        }
    };

    const handleRegister = async () => {
        setError("");
        
        if (!formData.name.trim()) {
            setError("Please enter your full name");
            return;
        }

        try {
            const payload = {
                email: formData.email,
                name: formData.name,
                otp: formData.otp,
            };

            const result = await register(payload).unwrap();
            
            if (result.data?.accessToken) {
                localStorage.setItem("token", result.data.accessToken);
                if (result.data?.user) {
                    localStorage.setItem("user", JSON.stringify(result.data.user));
                }
                router.push("/dashboard");
            } else {
                router.push("/login");
            }
        } catch (error: any) {
            setError(error?.data?.message || "Registration failed. Please try again.");
        }
    };

    const handleBack = () => {
        if (step === "otp") {
            setStep("email");
            setFormData({ ...formData, otp: "" });
        } else if (step === "details") {
            setStep("otp");
        }
        setError("");
    };

    const handleGoogleSignup = () => {
        setError("Google sign up will be available soon");
    };

    const getStepNumber = () => {
        switch (step) {
            case "email": return 1;
            case "otp": return 2;
            case "details": return 3;
            default: return 1;
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <Card className="w-full max-w-md shadow-2xl border border-gray-700 bg-gray-800/50 backdrop-blur-xl">
                <CardHeader className="flex flex-col gap-2 items-center pt-8 pb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-sm text-gray-400">Join us today</p>
                    <Chip color="primary" variant="flat" size="sm" className="mt-2">
                        Step {getStepNumber()} of 3
                    </Chip>
                </CardHeader>
                
                <Divider className="bg-gray-700" />
                
                <CardBody className="gap-6 p-8">
                    {step === "email" && (
                        <>
                            {/* Email Input Step */}
                            <div className="space-y-4">
                                <Input
                                    type="email"
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                    classNames={{
                                        input: "text-white",
                                        label: "text-gray-400",
                                        inputWrapper: "border-gray-600 hover:border-green-500"
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
                                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 font-semibold"
                                    onPress={handleSendOtp} 
                                    isLoading={isSendingOtp}
                                    isDisabled={!isValidEmail(formData.email)}
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

                            {/* Google Signup Button */}
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
                                onPress={handleGoogleSignup}
                            >
                                Sign up with Google
                            </Button>
                        </>
                    )}

                    {step === "otp" && (
                        <>
                            {/* OTP Verification Step */}
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <p className="text-gray-400 text-sm">
                                        We've sent a 6-digit code to
                                    </p>
                                    <p className="text-white font-semibold">{formData.email}</p>
                                </div>

                                <Input
                                    type="text"
                                    label="Enter OTP"
                                    placeholder="000000"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        otp: e.target.value.replace(/\D/g, "").slice(0, 6) 
                                    })}
                                    variant="bordered"
                                    maxLength={6}
                                    classNames={{
                                        input: "text-white text-center text-2xl tracking-widest",
                                        label: "text-gray-400",
                                        inputWrapper: "border-gray-600 hover:border-green-500"
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
                                    isLoading={isVerifyingOtp}
                                    isDisabled={formData.otp.length !== 6}
                                >
                                    Verify & Continue
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
                                            className="text-green-400 hover:text-green-300"
                                            onPress={handleSendOtp}
                                        >
                                            Resend OTP
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {step === "details" && (
                        <>
                            {/* User Details Step */}
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-white font-semibold">Email Verified!</p>
                                    <p className="text-gray-400 text-sm">Complete your profile</p>
                                </div>

                                <Input
                                    type="text"
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    variant="bordered"
                                    classNames={{
                                        input: "text-white",
                                        label: "text-gray-400",
                                        inputWrapper: "border-gray-600 hover:border-green-500"
                                    }}
                                    startContent={
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                                    color="success" 
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 font-semibold"
                                    onPress={handleRegister} 
                                    isLoading={isRegistering}
                                    isDisabled={!formData.name.trim()}
                                >
                                    Complete Registration
                                </Button>

                                <Button
                                    size="sm"
                                    variant="light"
                                    className="w-full text-gray-400 hover:text-white"
                                    onPress={handleBack}
                                >
                                    ← Back
                                </Button>
                            </div>
                        </>
                    )}

                    <div className="text-center text-sm text-gray-400 mt-4">
                        Already have an account?{" "}
                        <Link href="/login" className="text-green-400 hover:text-green-300 font-semibold">
                            Login
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
