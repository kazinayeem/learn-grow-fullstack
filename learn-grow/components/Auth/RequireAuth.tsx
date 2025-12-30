"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface RequireAuthProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
    const router = useRouter();
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        
        const token = Cookies.get("accessToken");
        const userRole = Cookies.get("userRole");

        // No token - redirect to login
        if (!token) {
            hasChecked.current = true;
            router.replace("/login");
            return;
        }

        // Check role-based access
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(userRole || "")) {
                hasChecked.current = true;
                router.replace("/unauthorized");
                return;
            }
        }

        hasChecked.current = true;
    }, []);

    return <>{children}</>;
}
