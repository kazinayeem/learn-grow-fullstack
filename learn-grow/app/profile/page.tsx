import UserProfile from "@/components/profile/UserProfile";
import RequireAuth from "@/components/Auth/RequireAuth";

export default function ProfilePage() {
    return (
        <RequireAuth>
            <UserProfile />
        </RequireAuth>
    );
}
