import UserProfile from "@/components/profile/UserProfile";
import RequireAuth from "@/components/Auth/RequireAuth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "View and manage your Learn Grow profile information.",
};

export default function ProfilePage() {
    return (
        <RequireAuth>
            <UserProfile />
        </RequireAuth>
    );
}
