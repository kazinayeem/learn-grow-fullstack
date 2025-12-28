"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";
import Cookies from "js-cookie";

interface RequireAuthProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get("accessToken");
        const userRole = Cookies.get("userRole");

        // No token - redirect to login
        if (!token) {
            router.push("/login");
            return;
        }

        // Check role-based access
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(userRole || "")) {
                // User is logged in but doesn't have permission
                router.push("/unauthorized");
                return;
            }
        }

        setAuthorized(true);
        setLoading(false);
    }, [router, allowedRoles]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" label="Verifying access..." />
            </div>
        );
    }

    if (!authorized) {
        return null;
    }

    return children;
}
