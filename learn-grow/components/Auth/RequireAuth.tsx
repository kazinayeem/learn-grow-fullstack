"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@nextui-org/react";

interface RequireAuthProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
            router.push("/login");
            return;
        }

        if (allowedRoles && allowedRoles.length > 0) {
            try {
                const user = JSON.parse(userStr);
                if (!allowedRoles.includes(user.role)) {
                    // User is logged in but doesn't have permission
                    alert("Access Denied: You do not have permission to view this page.");
                    router.push("/dashboard"); // Redirect to a safe page
                    return;
                }
            } catch (e) {
                console.error("Error parsing user data", e);
                router.push("/login");
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
        return null; // Don't render anything while redirecting
    }

    return <>{children}</>;
}
