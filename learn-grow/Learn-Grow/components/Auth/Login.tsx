"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function Login() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({ loginInput: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const phone = credentials.loginInput.trim();
        const password = credentials.password;

        try {
            // Try real API first
            const { data } = await api.post('/auth/login', { phone, password });

            // Save real data from backend
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));
            localStorage.setItem("userRole", data.data.user.role);

            // Redirect based on role from backend
            const role = data.data.user.role;
            if (role === "admin") router.push("/admin");
            else if (role === "instructor") router.push("/instructor");
            else if (role === "guardian") router.push("/guardian");
            else if (role === "student") router.push("/student");

            setIsLoading(false);
        } catch (apiError: any) {

            // FALLBACK: Mock authentication if backend is down
            if (phone === "01706276447" && password === "@M.jabed3834") {
                loginUserMock("admin", phone);
            } else if (phone === "01711111111" && password === "teacher123") {
                loginUserMock("instructor", phone);
            } else if (phone === "01722222222" && password === "student123") {
                loginUserMock("student", phone);
            } else if (phone === "01733333333" && password === "guardian123") {
                loginUserMock("guardian", phone);
            } else {
                setError("Invalid credentials. Backend may be offline.");
                setIsLoading(false);
            }
        }
    };

    const loginUserMock = (role: string, identifier: string) => {
        try {
            localStorage.setItem("userRole", role);
            localStorage.setItem("user", JSON.stringify({ identifier, role }));

            // Redirect based on role
            if (role === "admin") router.push("/admin");
            else if (role === "instructor") router.push("/instructor");
            else if (role === "guardian") router.push("/guardian");
            else router.push("/student");
        } catch (err) {
            setError("Login Error");
            setIsLoading(false);
        }
    };

    const handleQuickLogin = async (type: "admin" | "instructor" | "student" | "parent") => {
        // Restored Verified Credentials
        const creds = {
            admin: { loginInput: "01706276447", password: "@M.jabed3834" },
            instructor: { loginInput: "01711111111", password: "teacher123" },
            student: { loginInput: "01722222222", password: "student123" },
            parent: { loginInput: "01733333333", password: "guardian123" }
        };
        const selected = creds[type];
        setCredentials(selected);

        // Auto-login logic
        const roleMap: Record<string, string> = {
            admin: "admin", instructor: "instructor", student: "student", parent: "guardian"
        };

        setIsLoading(true);
        setTimeout(() => {
            loginUser(roleMap[type], selected.loginInput);
        }, 500);
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
                            <label htmlFor="loginInput" className="sr-only">Phone Number</label>
                            <input
                                id="loginInput"
                                name="loginInput"
                                type="text"
                                required
                                value={credentials.loginInput}
                                onChange={(e) => setCredentials({ ...credentials, loginInput: e.target.value })}
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300/20 bg-white/10 backdrop-blur text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Phone Number"
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
                        <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-500/20">
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
                                className="px-3 py-2 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Login as Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin("instructor")}
                                className="px-3 py-2 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Login as Instructor
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin("student")}
                                className="px-3 py-2 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Login as Student
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickLogin("parent")}
                                className="px-3 py-2 text-xs font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Login as Parent
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <a
                            href="/auth/register"
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
