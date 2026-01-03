import RegistrationForm from "@/components/Auth/RegistrationForm";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your Learn Grow account and start your learning journey today.",
};

export default function RegisterPage() {
    return (
        <AuthGuard redirectIfLoggedIn={true} redirectTo="/student">
            <RegistrationForm />
        </AuthGuard>
    );
}
