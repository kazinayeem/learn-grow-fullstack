"use client";

import React, { useState } from "react";
import {
    Image,
    Button,
    Spinner,
    Chip,
    Card,
    CardBody,
    Divider,
    useDisclosure,
    Tabs,
    Tab,
} from "@nextui-org/react";
import { useGetCourseByIdQuery } from "@/redux/api/courseApi";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import PaymentModal from "@/components/payment/PaymentModal";
import CourseModules from "@/components/course/CourseModules";
import QuizList from "@/components/quiz/QuizList";

interface CourseDetailsProps {
    courseId: string;
}

export default function CourseDetails({ courseId }: CourseDetailsProps) {
    const { data, isLoading, error } = useGetCourseByIdQuery(courseId);
    const router = useRouter();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedTab, setSelectedTab] = useState("overview");

    // Check if user is enrolled
    const enrolledCourses = useSelector(
        (state: RootState) => state.enrollment.enrolledCourses
    );
    const isEnrolled = enrolledCourses.some((e) => e.courseId === courseId);

    // Check if user has paid for this course
    const payments = useSelector((state: RootState) => state.payment.payments);
    const hasPaid = payments.some(
        (p) => p.courseId === courseId && p.status === "completed"
    );

    const handleEnrollClick = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login to enroll in this course");
            router.push("/login");
            return;
        }

        // Open payment modal
        onOpen();
    };

    // sample courses for offline backup
    const sampleCourses: any[] = [
        {
            _id: "1",
            title: "Robotics for Beginners",
            description: "Learn to build and program your first robot.\n\nThis course introduces you to the exciting world of robotics. You will learn about basic electronics, motors, sensors, and programming microcontrollers to make your robot move and interact with the world.",
            price: 1500,
            level: "Beginner",
            img: "https://images.unsplash.com/photo-1535378433864-ed1c29cee23d?q=80&w=1000&auto=format&fit=crop"
        },
        {
            _id: "2",
            title: "Web Development Bootcamp",
            description: "Master HTML, CSS, and JavaScript from scratch.\n\nBecome a full-stack web developer with this comprehensive bootcamp. We cover everything from the basics of the web to advanced frontend frameworks and backend technologies.",
            price: 2000,
            level: "Intermediate",
            img: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop"
        },
        {
            _id: "3",
            title: "Python for Kids",
            price: 1200,
            level: "Beginner",
            description: "Fun and interactive Python programming course.\n\nPython is a great language for beginners. In this course, kids will learn programming concepts through fun games and visual projects.",
            img: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?q=80&w=1000&auto=format&fit=crop"
        },
        {
            _id: "4",
            title: "Game Development with scratch",
            price: 1000,
            level: "Beginner",
            description: "Create your own games using Scratch visual programming.",
            img: "https://images.unsplash.com/photo-1596496356938-a2a11b63d888?q=80&w=1000&auto=format&fit=crop"
        }
    ];

    const course = data?.data || data || sampleCourses.find(c => c._id === courseId) || sampleCourses[0];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Spinner size="lg" label="Loading course details..." />
            </div>
        );
    }

    if (error && !course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-red-500 text-lg">Failed to load course details.</p>
                <Button onPress={() => router.back()}>Go Back</Button>
            </div>
        );
    }



    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <p className="text-lg">Course not found.</p>
                <Button onPress={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hero Image */}
                        <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src={
                                    course.img ||
                                    course.thumbnail ||
                                    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop"
                                }
                                alt={course.title}
                                className="object-cover w-full h-full"
                                removeWrapper
                            />
                        </div>

                        {/* Title & Badges */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Chip color="primary" variant="flat">
                                    {course.level || "Beginner"}
                                </Chip>
                                <Chip color="secondary" variant="flat">
                                    {course.category?.name || "Programming"}
                                </Chip>
                                {hasPaid && (
                                    <Chip color="warning" variant="flat">
                                        💳 Paid
                                    </Chip>
                                )}
                                {isEnrolled && (
                                    <Chip color="success" variant="flat">
                                        ✓ Enrolled
                                    </Chip>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                {course.title}
                            </h1>
                        </div>

                        {/* Tabs for different sections */}
                        <Tabs
                            selectedKey={selectedTab}
                            onSelectionChange={(key) => setSelectedTab(key as string)}
                            size="lg"
                            color="primary"
                            className="mb-4"
                        >
                            <Tab key="overview" title="📖 Overview">
                                <Card>
                                    <CardBody>
                                        <h3 className="text-xl font-semibold mb-3">Description</h3>
                                        <p className="text-default-600 leading-relaxed whitespace-pre-line">
                                            {course.description}
                                        </p>
                                    </CardBody>
                                </Card>
                            </Tab>

                            <Tab key="content" title="📚 Content">
                                <CourseModules courseId={courseId} isEnrolled={isEnrolled} />
                            </Tab>

                            <Tab key="quizzes" title="📝 Quizzes">
                                <QuizList courseId={courseId} />
                            </Tab>
                        </Tabs>
                    </div>

                    {/* Right Column: Enrollment Card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 p-4 shadow-xl">
                            <CardBody className="gap-6">
                                <div className="text-center">
                                    <p className="text-default-500 text-sm mb-2">Price</p>
                                    <p className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        ${course.price}
                                    </p>
                                </div>

                                <Divider />

                                <div className="space-y-2">
                                    <p className="font-semibold text-lg mb-3">
                                        Course Features:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-default-600">
                                            <span className="text-success">✓</span>
                                            Full lifetime access
                                        </li>
                                        <li className="flex items-center gap-2 text-default-600">
                                            <span className="text-success">✓</span>
                                            Certificate of completion
                                        </li>
                                        <li className="flex items-center gap-2 text-default-600">
                                            <span className="text-success">✓</span>
                                            Access on mobile and TV
                                        </li>
                                        <li className="flex items-center gap-2 text-default-600">
                                            <span className="text-success">✓</span>
                                            Assignments & Quizzes
                                        </li>
                                        <li className="flex items-center gap-2 text-default-600">
                                            <span className="text-success">✓</span>
                                            Live class sessions
                                        </li>
                                    </ul>
                                </div>

                                <Divider />

                                {isEnrolled ? (
                                    <Button
                                        color="success"
                                        size="lg"
                                        className="w-full font-semibold shadow-lg"
                                        variant="shadow"
                                        onPress={() => router.push("/dashboard")}
                                    >
                                        Go to Dashboard
                                    </Button>
                                ) : (
                                    <Button
                                        color="primary"
                                        size="lg"
                                        className="w-full font-semibold shadow-lg"
                                        variant="shadow"
                                        onPress={handleEnrollClick}
                                    >
                                        {course.price > 0 ? "💳 Buy Now" : "🎓 Enroll Free"}
                                    </Button>
                                )}

                                <Button
                                    variant="bordered"
                                    className="w-full"
                                    onPress={() => router.back()}
                                >
                                    ← Back to Courses
                                </Button>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                courseId={courseId}
                courseTitle={course.title}
                amount={course.price}
            />
        </>
    );
}
