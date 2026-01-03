import CourseList from "@/components/courses/CourseList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Courses - Learn & Grow Academy",
  description: "Browse our comprehensive collection of courses in robotics, coding, and STEM education. Find the perfect course to advance your skills.",
};

export default function CoursesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white py-16 mb-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Explore Our Courses
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light">
                        Discover world-class education designed to help you master new skills and advance your career
                    </p>
                </div>
            </div>

            {/* Course List */}
            <div className="container mx-auto px-4 pb-16">
                <CourseList />
            </div>
        </div>
    );
}
