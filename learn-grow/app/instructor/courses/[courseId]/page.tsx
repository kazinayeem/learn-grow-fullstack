import InstructorCourseDashboardClient from "./ClientPage";

export const dynamic = 'force-dynamic';

export default async function InstructorCourseDashboard(props: { params: Promise<{ courseId: string }> }) {
    const params = await props.params;
    return <InstructorCourseDashboardClient params={params} />;
}
