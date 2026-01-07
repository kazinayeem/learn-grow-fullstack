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
  
  if (!course) {
    return {
      title: "Course Not Found",
      description: "The requested course could not be found.",
    };
  }

  const courseUrl = `https://learnandgrow.io/courses/${params.id}`;
  const imageUrl = course.image || "https://learnandgrow.io/og-courses.jpg";

  return {
    title: `${course.title} - Learn Robotics & STEM | Learn & Grow`,
    description: course.description || `Master ${course.title} with expert instructors. Hands-on projects, live classes, and certification. Enroll in our comprehensive robotics and STEM course today!`,
    keywords: [
      course.title,
      "robotics course",
      "STEM education",
      "online learning",
      "coding course",
      "Arduino programming",
      course.category || "technology",
    ],
    authors: [{ name: "Learn & Grow Academy" }],
    openGraph: {
      title: `${course.title} - Master Robotics & STEM`,
      description: course.description,
      url: courseUrl,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} - Learn & Grow`,
      description: course.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: courseUrl,
    },
  };
}

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
    const course = courses.find(c => String(c.id) === params.id);

    // Generate JSON-LD structured data for the course
    const jsonLd = course ? {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description,
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Learn & Grow Academy",
        "url": "https://learnandgrow.io"
      },
      "url": `https://learnandgrow.io/courses/${params.id}`,
      "image": course.image || "https://learnandgrow.io/og-courses.jpg",
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": course.duration || "3 months"
      },
      "offers": {
        "@type": "Offer",
        "price": course.price || "3500",
        "priceCurrency": "BDT",
        "availability": "https://schema.org/InStock",
        "url": `https://learnandgrow.io/courses/${params.id}`
      }
    } : null;

    return (
      <>
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <CourseDetails courseId={params.id} />
      </>
    );
}
