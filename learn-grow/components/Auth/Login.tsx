"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { toast } from "react-toastify";

export default function Login() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({ loginInput: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const loginInput = credentials.loginInput.trim();
        const password = credentials.password;

        // Determine if input is email or phone
        const isEmail = loginInput.includes("@");
        const loginData = isEmail 
            ? { email: loginInput, password }
            : { phone: loginInput, password };

        console.log("🔐 Attempting login with:", loginData);

        try {
            // Use real API via lib/auth
            const { data, success, message } = await login(loginData);

            if (success && data) {
                console.log("✅ API Login successful:", data);
                toast.success(`Welcome back, ${data.user.name}!`);

                // Redirect based on role from backend
                const role = data.user.role;
                if (role === "admin" || role === "super_admin") router.push("/admin");
                else if (role === "instructor") router.push("/instructor");
                else if (role === "guardian") router.push("/guardian");
                else if (role === "student") router.push("/student");
            } else {
                setError(message || "Login failed");
                toast.error(message || "Login failed");
            }
            setIsLoading(false);
        } catch (apiError: any) {
            console.error("❌ Login error:", apiError);
            const errorMsg = apiError.response?.data?.message || apiError.message || "Login failed";
            setError(errorMsg);
            toast.error(errorMsg);
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async (type: "admin" | "instructor" | "student" | "parent") => {
        const creds = {
            admin: { loginInput: "01706276447", password: "@M.jabed3834" },
            instructor: { loginInput: "01711111111", password: "teacher123" },
            student: { loginInput: "01722222222", password: "student123" },
            parent: { loginInput: "01733333333", password: "guardian123" }
        };
        const selected = creds[type];
        setCredentials(selected);

        // Auto-login after setting credentials
        setIsLoading(true);
        try {
            const { data, success, message } = await login({ phone: selected.loginInput, password: selected.password });
            
            if (success && data) {
                toast.success(`Welcome, ${data.user.name}!`);
                const role = data.user.role;
                if (role === "admin" || role === "super_admin") router.push("/admin");
                else if (role === "instructor") router.push("/instructor");
                else if (role === "guardian") router.push("/guardian");
                else router.push("/student");
            } else {
                setError(message || "Login failed");
                toast.error(message || "Login failed");
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Login failed";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/10">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-white">
                        Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-300">
                        Welcome back to Learn & Grow
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="loginInput" className="sr-only">Phone or Email</label>
                            <input
                                id="loginInput"
                                name="loginInput"
                                type="text"
                                required
                                value={credentials.loginInput}
                                onChange={(e) => setCredentials({ ...credentials, loginInput: e.target.value })}
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300/20 bg-white/10 backdrop-blur text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Phone Number or Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300/20 bg-white/10 backdrop-blur text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>

                    {/* Quick Login Buttons (Demo Only) */}
                    <div className="pt-6 border-t border-gray-700">
                        <p className="text-center text-xs text-gray-400 mb-3">Quick Login (Demo Mode)</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleQuickLogin("admin")}
                                disabled={isLoading}
                                className="px-3 py-2 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Login as Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin("instructor")}
                                disabled={isLoading}
                                className="px-3 py-2 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Login as Instructor
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin("student")}
                                disabled={isLoading}
                                className="px-3 py-2 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Login as Student
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin("parent")}
                                disabled={isLoading}
                                className="px-3 py-2 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Login as Parent
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <a
                            href="/register"
                            className="font-medium text-purple-300 hover:text-purple-200 transition-colors text-sm"
                        >
                            Don't have an account? Register
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
