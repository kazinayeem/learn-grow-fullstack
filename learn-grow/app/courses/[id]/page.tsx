import CourseDetails from "@/components/courses/CourseDetails";
import { Metadata } from "next";

interface Props {
    params: {
        id: string;
    };
}

// Dynamic/SSR route now
// Dynamic Render used
import { courses } from "@/lib/coursesData";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const course = courses.find(c => String(c.id) === params.id);
  return {
    title: course ? `${course.title} - Course Details` : "Course Details",
    description: course ? course.description : "View course details and enroll now.",
  };
}

export function generateStaticParams() {
    // Ensure courses is available and has data
    if (!courses || courses.length === 0) {
        console.warn("No courses data found for generateStaticParams");
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
