import StudentCourseDashboardClient from "./ClientPage";

export const dynamic = 'force-dynamic';

export default async function StudentCourseDashboard(props: { params: Promise<{ courseId: string }> }) {
    const params = await props.params;
    return <StudentCourseDashboardClient params={params} />;
}
