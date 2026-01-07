"use client";
import React, { useState } from "react";
import { Card, CardBody, CardFooter, Button, Chip, Spinner, Image } from "@nextui-org/react";
import { useGetAllCoursesQuery } from "@/redux/api/courseApi";
import { useRouter } from "next/navigation";

const CoursesSection = () => {
  const [language] = useState<"en" | "bn">("bn");
  const { data, isLoading, error } = useGetAllCoursesQuery({});
  const router = useRouter();

  if (error) {
    // API error - will use fallback courses
  }

  // Use API data or fallback to sampleCourses if error exists
  const displayCourses = (data?.data || data) ? (data?.data || data) : [];

  // Gradient mapping for visual variety (cycling through based on index)
  const gradients = [
    "bg-gradient-robotics",
    "bg-gradient-coding",
    "bg-gradient-math",
    "bg-gradient-science",
  ];

  const shadows = [
    "hover:shadow-glow-primary",
    "hover:shadow-glow-accent",
    "hover:shadow-glow-secondary",
    "hover:shadow-xl",
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" label="Loading courses..." />
      </div>
    );
  }

  return (
    <section className="py-8 px-6 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-block mb-4">
            <Chip
              className="bg-primary-100 text-primary-700 font-semibold"
              size="lg"
              variant="flat"
            >
              {language === "en" ? "📚 Our Courses" : "📚 আমাদের কোর্স"}
            </Chip>
          </div>
          <h2
            className={`text-4xl md:text-5xl font-black text-gray-900 mb-4 ${language === "bn" ? "font-siliguri" : ""}`}
          >
            {language === "en"
              ? "Explore Our Programs"
              : "আমাদের প্রোগ্রাম দেখুন"}
          </h2>
          <p
            className={`text-lg md:text-xl text-gray-600 max-w-3xl mx-auto ${language === "bn" ? "font-siliguri" : ""}`}
          >
            {language === "en"
              ? "Choose from our carefully designed courses to start your STEM journey"
              : "আপনার STEM যাত্রা শুরু করতে আমাদের সযত্নে ডিজাইন করা কোর্স থেকে বেছে নিন"}
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCourses.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              No courses available at the moment.
            </div>
          ) : (
            displayCourses.map((course: any, index: number) => (
              <Card
                key={course._id}
                className={`group cursor-pointer transition-all duration-300 hover:-translate-y-2 ${shadows[index % shadows.length]} shadow-card animate-slideUp border-0`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Course Image Header */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    removeWrapper
                    alt={course.title}
                    className="z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={course.img || "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-blue-900/20 to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <Chip color="primary" size="sm" variant="flat" className="bg-white/90 text-primary-700 font-bold shadow-sm">
                      {course.level}
                    </Chip>
                  </div>
                </div>

                <CardBody className="p-6">
                  {/* Course Title */}
                  <h3
                    className={`text-xl font-bold text-gray-900 mb-2 ${language === "bn" ? "font-siliguri" : ""}`}
                  >
                    {course.title}
                  </h3>

                  {/* Subtitle */}
                  {course.subtitle && (
                    <p
                      className={`text-primary-600 text-sm font-semibold mb-3 ${language === "bn" ? "font-siliguri" : ""}`}
                    >
                      {course.subtitle}
                    </p>
                  )}

                  {/* Description */}
                  <p
                    className={`text-gray-600 text-sm mb-4 line-clamp-3 ${language === "bn" ? "font-siliguri" : ""}`}
                  >
                    {course.description}
                  </p>

                  {/* Duration & Age Range */}
                  <div className="flex gap-4 mb-4">
                    {course.duration && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>⏱️</span>
                        <span className={language === "bn" ? "font-siliguri" : ""}>{course.duration}</span>
                      </div>
                    )}
                    {course.ageRange && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>👥</span>
                        <span className={language === "bn" ? "font-siliguri" : ""}>{course.ageRange}</span>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  {course.features && course.features.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {course.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span className={language === "bn" ? "font-siliguri" : ""}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>

                <CardFooter className="p-6 pt-0">
                  <Button
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold shadow-md hover:shadow-lg transition-shadow"
                    size="lg"
                    onPress={() => {
                      // Check if user is logged in
                      const token = localStorage.getItem("token");
                      if (!token) {
                        // Redirect to register if not logged in
                        router.push("/register");
                      } else {
                        // Go to course details if logged in
                        router.push(`/courses/${course._id}`);
                      }
                    }}
                  >
                    <span className={language === "bn" ? "font-siliguri" : ""}>
                      {language === "en" ? "Enroll Now →" : "এনরোল করুন →"}
                    </span>
                  </Button>
                </CardFooter>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
              </Card>
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div
          className="text-center mt-12 animate-fadeIn"
          style={{ animationDelay: "600ms" }}
        >
          <p
            className={`text-gray-600 mb-6 ${language === "bn" ? "font-siliguri" : ""}`}
          >
            {language === "en"
              ? "Can't decide? We'll help you choose the perfect course!"
              : "সিদ্ধান্ত নিতে পারছেন না? আমরা আপনাকে নিখুঁত কোর্স বেছে নিতে সাহায্য করব!"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="border-2 border-primary-500 text-primary-600 font-bold hover:bg-primary-50"
              size="lg"
              variant="bordered"
            >
              <span className={language === "bn" ? "font-siliguri" : ""}>
                {language === "en"
                  ? "📞 Talk to Advisor"
                  : "📞 পরামর্শদাতার সাথে কথা বলুন"}
              </span>
            </Button>
            <Button
              className="bg-gradient-secondary text-white font-bold shadow-glow-secondary"
              size="lg"
              onPress={() => router.push("/courses")}
            >
              <span className={language === "bn" ? "font-siliguri" : ""}>
                {language === "en"
                  ? "🎁 View All Courses"
                  : "🎁 সব কোর্স দেখুন"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>

  );
};

export default CoursesSection;
