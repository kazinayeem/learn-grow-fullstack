"use client";

import { getUserRole, canAccess, Role } from "@/lib/permissions";
import { ReactNode, useEffect, useState } from "react";

interface PermissionGateProps {
    children: ReactNode;
    action: "create" | "read" | "update" | "delete";
    resource: string;
    fallback?: ReactNode;
}

/**
 * Permission Gate Component
 * 
 * Only renders children if user has permission for the specified action/resource
 * 
 * @example
 * ```tsx
 * <PermissionGate action="create" resource="course">
 *   <Button>Create Course</Button>
 * </PermissionGate>
 * ```
 */
export function PermissionGate({ children, action, resource, fallback = null }: PermissionGateProps) {
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const role = getUserRole();
        if (role) {
            setHasPermission(canAccess(role, action, resource));
        }
        setLoading(false);
    }, [action, resource]);

    if (loading) return null;
    if (!hasPermission) return <>{fallback}</>;
    return <>{children}</>;
}

interface RoleGateProps {
    children: ReactNode;
    allowedRoles: Role[];
    fallback?: ReactNode;
}

/**
 * Role Gate Component
 * 
 * Only renders children if user has one of the allowed roles
 * 
 * @example
 * ```tsx
 * <RoleGate allowedRoles={["admin", "teacher"]}>
 *   <AdminPanel />
 * </RoleGate>
 * ```
 */
export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
    const [hasRole, setHasRole] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const role = getUserRole();
        if (role && allowedRoles.includes(role)) {
            setHasRole(true);
        }
        setLoading(false);
    }, [allowedRoles]);

    if (loading) return null;
    if (!hasRole) return <>{fallback}</>;
    return <>{children}</>;
}
