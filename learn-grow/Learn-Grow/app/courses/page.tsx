import CourseList from "@/components/courses/CourseList";

export default function CoursesPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Explore Our Courses</h1>
            <CourseList />
        </div>
    );
}
