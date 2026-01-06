import CourseList from "@/components/courses/CourseList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Robotics & STEM Courses - Learn Arduino, Coding & Engineering",
  description: "Explore our comprehensive robotics and STEM courses. Learn Arduino programming, robot building, coding fundamentals, and engineering principles with expert instructors and hands-on projects.",
  keywords: [
    "robotics courses",
    "Arduino programming",
    "STEM courses online",
    "learn coding",
    "robot building course",
    "engineering courses",
    "programming classes",
    "robotics training",
    "online STEM education",
    "coding bootcamp"
  ],
  openGraph: {
    title: "Robotics & STEM Courses - Master Technology Skills",
    description: "Browse our comprehensive collection of robotics, coding, and STEM education courses. Expert-led training for all skill levels.",
    type: "website",
    url: "https://learnandgrow.io/courses",
    images: [
      {
        url: "https://learnandgrow.io/og-courses.jpg",
        width: 1200,
        height: 630,
        alt: "Learn & Grow Courses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Robotics & STEM Courses - Learn & Grow",
    description: "Master robotics, coding, and engineering with our expert-led courses.",
    images: ["https://learnandgrow.io/og-courses.jpg"],
  },
  alternates: {
    canonical: "https://learnandgrow.io/courses",
  },
};

export default function CoursesPage() {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Robotics & STEM Courses",
      "description": "Comprehensive collection of robotics, coding, and STEM education courses",
      "url": "https://learnandgrow.io/courses",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Learn & Grow Academy",
        "url": "https://learnandgrow.io"
      }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
        </>
    );
}
