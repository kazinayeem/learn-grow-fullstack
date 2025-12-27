import InstructorCourseDashboardClient from "./ClientPage";

// Hardcoded sample/main courses for static generation
const SAMPLE_COURSES = [
    { id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }
];

export function generateStaticParams() {
    return SAMPLE_COURSES.map(course => ({
        courseId: course.id
    }));
}

export default async function InstructorCourseDashboard(props: { params: Promise<{ courseId: string }> }) {
    const params = await props.params;
    return <InstructorCourseDashboardClient params={params} />;
}
