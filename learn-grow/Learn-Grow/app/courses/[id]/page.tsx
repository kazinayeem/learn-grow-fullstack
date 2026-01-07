import CourseDetails from "@/components/courses/CourseDetails";

interface Props {
    params: {
        id: string;
    };
}

// Dynamic/SSR route now
// Dynamic Render used
import { courses } from "@/lib/coursesData";

export function generateStaticParams() {
    // Ensure courses is available and has data
    if (!courses || courses.length === 0) {
        return [];
    }

    return courses.map((course) => ({
        id: String(course.id),
    }));
}

export default async function CourseDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return <CourseDetails courseId={params.id} />;
}
