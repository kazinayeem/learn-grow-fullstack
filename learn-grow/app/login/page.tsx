import LoginForm from "@/components/Auth/LoginForm";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Learn Grow account to access courses and learning materials.",
};

export default function LoginPage() {
    return (
        <AuthGuard redirectIfLoggedIn={true} redirectTo="/student">
            <LoginForm />
        </AuthGuard>
    );
}
