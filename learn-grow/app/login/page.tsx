import LoginForm from "@/components/Auth/LoginForm";
import { AuthGuard } from "@/components/Auth/AuthGuard";

export default function LoginPage() {
    return (
        <AuthGuard redirectIfLoggedIn={true} redirectTo="/student">
            <LoginForm />
        </AuthGuard>
    );
}
