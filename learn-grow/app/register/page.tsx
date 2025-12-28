import RegistrationForm from "@/components/Auth/RegistrationForm";
import { AuthGuard } from "@/components/Auth/AuthGuard";

export default function RegisterPage() {
    return (
        <AuthGuard redirectIfLoggedIn={true} redirectTo="/student">
            <RegistrationForm />
        </AuthGuard>
    );
}
