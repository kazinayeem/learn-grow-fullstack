"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";

interface RequireAuthProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Decode JWT token without verification (client-side)
function decodeJWT(token: string): { exp?: number; role?: string; id?: string } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (error) {
        return null;
    }
}

// Check if token is expired or expiring soon (within 5 minutes)
function isTokenExpired(token: string): boolean {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
}

function isTokenExpiringSoon(token: string): boolean {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;
    return decoded.exp - now < fiveMinutes;
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
    const router = useRouter();
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        
        async function checkAuth() {
            // 🚨 Check if logout is in progress - if so, don't redirect yet
            const loggingOut = sessionStorage.getItem("loggingOut") === "1";
            if (loggingOut) {
                console.log("🔐 RequireAuth: Logout in progress, skipping redirect");
                hasChecked.current = true;
                return;
            }
            
            let token = Cookies.get("accessToken") || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
            let userRole = Cookies.get("userRole");
            
            if (!userRole && typeof window !== "undefined") {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    try {
                        userRole = JSON.parse(storedUser)?.role || undefined;
                    } catch (e) {
                        // ignore parse errors
                    }
                }
            }

            // No token - redirect to login
            if (!token) {
                hasChecked.current = true;
                router.replace("/login");
                return;
            }

            // Check if token is expired or expiring soon
            if (isTokenExpired(token) || isTokenExpiringSoon(token)) {
                console.log("🔄 Token expired or expiring soon, attempting refresh...");
                
                // Try to refresh the token
                const refreshToken = Cookies.get("refreshToken") || (typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null);
                
                if (refreshToken) {
                    try {
                        const response = await axios.post(`${API_URL}/users/refresh-token`, {
                            refreshToken
                        });
                        
                        if (response.data?.success && response.data?.data?.accessToken) {
                            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                            
                            // Update tokens
                            Cookies.set("accessToken", accessToken, { 
                                path: "/",
                                expires: 7,
                                secure: false,
                                sameSite: "lax"
                            });
                            if (newRefreshToken) {
                                Cookies.set("refreshToken", newRefreshToken, { 
                                    path: "/",
                                    expires: 30,
                                    secure: false,
                                    sameSite: "lax"
                                });
                                if (typeof window !== "undefined") {
                                    localStorage.setItem("refreshToken", newRefreshToken);
                                }
                            }
                            if (typeof window !== "undefined") {
                                localStorage.setItem("token", accessToken);
                            }
                            
                            console.log("✅ Token refreshed successfully");
                            token = accessToken; // Use the new token for role check
                            
                            // Get role from refreshed token
                            const decoded = decodeJWT(accessToken);
                            if (decoded?.role) {
                                userRole = decoded.role;
                                Cookies.set("userRole", decoded.role, { path: "/" });
                            }
                        } else {
                            throw new Error("Failed to refresh token");
                        }
                    } catch (refreshError) {
                        console.error("❌ Token refresh failed:", refreshError);
                        // Clear all auth data
                        Cookies.remove("accessToken", { path: "/" });
                        Cookies.remove("refreshToken", { path: "/" });
                        Cookies.remove("userRole", { path: "/" });
                        if (typeof window !== "undefined") {
                            localStorage.removeItem("token");
                            localStorage.removeItem("refreshToken");
                            localStorage.removeItem("user");
                            localStorage.removeItem("userRole");
                        }
                        hasChecked.current = true;
                        router.replace("/login?session_expired=true");
                        return;
                    }
                } else {
                    // No refresh token, redirect to login
                    Cookies.remove("accessToken", { path: "/" });
                    Cookies.remove("userRole", { path: "/" });
                    hasChecked.current = true;
                    router.replace("/login?session_expired=true");
                    return;
                }
            }

            // Check role-based access
            if (allowedRoles && allowedRoles.length > 0) {
                // If no role in cookies, try to decode from token
                if (!userRole && token) {
                    const decoded = decodeJWT(token);
                    userRole = decoded?.role || undefined;
                    if (userRole) {
                        Cookies.set("userRole", userRole, { path: "/" });
                    }
                }
                
                if (!allowedRoles.includes(userRole || "")) {
                    hasChecked.current = true;
                    router.replace("/unauthorized");
                    return;
                }
            }

            hasChecked.current = true;
        }
        
        checkAuth();
    }, [router, allowedRoles]);

    return <>{children}</>;
}
