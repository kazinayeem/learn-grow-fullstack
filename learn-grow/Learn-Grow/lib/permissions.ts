/**
 * Role-based Permission System
 * Defines what each role can and cannot do
 */

export type Role = "admin" | "teacher" | "student" | "guardian";

export interface Permission {
    create: string[];
    read: string[];
    update: string[];
    delete: string[];
}

/**
 * Permission Matrix
 * Defines CRUD permissions for each role
 */
export const PERMISSIONS: Record<Role, Permission> = {
    admin: {
        // Admin can do EVERYTHING
        create: ["course", "module", "lecture", "file", "quiz", "exam", "live-class", "user", "record", "assignment"],
        read: ["course", "module", "lecture", "file", "quiz", "exam", "live-class", "user", "record", "assignment", "analytics"],
        update: ["course", "module", "lecture", "file", "quiz", "exam", "live-class", "user", "record", "assignment"],
        delete: ["course", "module", "lecture", "file", "quiz", "exam", "live-class", "user", "record", "assignment"],
    },
    teacher: {
        // Teacher can create everything EXCEPT courses
        create: ["module", "lecture", "file", "quiz", "exam", "live-class", "record", "assignment"],
        read: ["course", "module", "lecture", "file", "quiz", "exam", "live-class", "record", "assignment", "student"],
        update: ["module", "lecture", "file", "quiz", "exam", "live-class", "record", "assignment"],
        delete: ["module", "lecture", "file", "quiz", "exam", "live-class", "record", "assignment"],
    },
    student: {
        // Students can only read and submit
        create: ["quiz-submission", "assignment-submission"],
        read: ["course", "module", "lecture", "file", "quiz", "exam", "live-class", "record"],
        update: ["profile"],
        delete: [],
    },
    guardian: {
        // Guardians monitor children and handle payments
        create: ["payment"],
        read: ["course", "child-progress", "payment-history", "report"],
        update: ["profile", "child"],
        delete: [],
    },
};

/**
 * Check if a user can perform an action on a resource
 */
export function canAccess(
    role: Role,
    action: "create" | "read" | "update" | "delete",
    resource: string
): boolean {
    const permissions = PERMISSIONS[role];
    if (!permissions) return false;
    return permissions[action].includes(resource);
}

/**
 * Check if user can create courses (Admin only)
 */
export function canCreateCourse(role: Role): boolean {
    return canAccess(role, "create", "course");
}

/**
 * Check if user can create modules/lectures/etc (Teacher + Admin)
 */
export function canCreateCourseContent(role: Role): boolean {
    return role === "admin" || role === "teacher";
}

/**
 * Check if user can manage users (Admin only)
 */
export function canManageUsers(role: Role): boolean {
    return role === "admin";
}

/**
 * Check if user can assign teachers to courses (Admin only)
 */
export function canAssignTeachers(role: Role): boolean {
    return role === "admin";
}

/**
 * Get user role from localStorage
 */
export function getUserRole(): Role | null {
    if (typeof window === "undefined") return null;

    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;

        const user = JSON.parse(userStr);
        return user.role as Role;
    } catch {
        return null;
    }
}

/**
 * Check if current user has permission
 */
export function hasPermission(
    action: "create" | "read" | "update" | "delete",
    resource: string
): boolean {
    const role = getUserRole();
    if (!role) return false;
    return canAccess(role, action, resource);
}
