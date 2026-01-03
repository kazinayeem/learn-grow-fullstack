"use client";

import UserProfile from "@/components/profile/UserProfile";
import RequireAuth from "@/components/Auth/RequireAuth";

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
    return (
        <RequireAuth>
            <UserProfile />
        </RequireAuth>
    );
}
