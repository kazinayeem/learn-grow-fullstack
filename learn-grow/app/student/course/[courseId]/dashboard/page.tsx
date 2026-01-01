import StudentCourseDashboardClient from "./ClientPage";
import RequireAuth from "@/components/Auth/RequireAuth";

export const dynamic = 'force-dynamic';

export default async function StudentCourseDashboard(props: { params: Promise<{ courseId: string }> }) {
    const params = await props.params;
    return (
        <RequireAuth allowedRoles={["student", "instructor", "admin"]}>
            <StudentCourseDashboardClient params={params} />
        </RequireAuth>
    );
}
