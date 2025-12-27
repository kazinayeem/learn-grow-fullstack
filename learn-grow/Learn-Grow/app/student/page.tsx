"use client";

import StudentDashboard from "@/components/dashboard/StudentDashboard";
import RequireAuth from "@/components/Auth/RequireAuth";

export default function StudentDashboardPage() {
    return (
        <RequireAuth allowedRoles={["student"]}>
            <StudentDashboard />
        </RequireAuth>
    );
}
