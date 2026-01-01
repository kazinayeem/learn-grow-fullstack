"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
    Button,
    Spinner,
    Chip,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Tabs,
    Tab,
} from "@nextui-org/react";
import { useGetCourseByIdQuery } from "@/redux/api/courseApi";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import CourseModules from "@/components/course/CourseModules";
import UnifiedAssessmentView from "@/components/assessment/UnifiedAssessmentView";
import DOMPurify from "isomorphic-dompurify";
import Cookies from "js-cookie";
import { FaTrophy, FaDownload } from "react-icons/fa";
import "@/styles/prose.css";

interface CourseDetailsProps {
    courseId: string;
}

export default function CourseDetails({ courseId }: CourseDetailsProps) {
    const { data, isLoading, error, refetch } = useGetCourseByIdQuery(courseId);
    const { data: ordersData } = useGetMyOrdersQuery();
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState("overview");

    const getAuthToken = () => {
        const cookieToken = Cookies.get("accessToken");
        if (cookieToken) return cookieToken;

        // Only access localStorage in browser
        if (typeof window !== "undefined") {
            return localStorage.getItem("token") || "";
        }
        return "";
    };

    const getUserRole = () => {
        const roleFromCookie = Cookies.get("userRole");
        if (roleFromCookie) return roleFromCookie;

        // Only access localStorage in browser
        if (typeof window !== "undefined") {
            const roleFromStorage = localStorage.getItem("userRole");
            if (roleFromStorage) return roleFromStorage;
            try {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    return (JSON.parse(storedUser).role as string) || "";
                }
            } catch {
                // ignore parse errors and treat as missing role
            }
        }
        return "";
    };

    // Check if user is logged in
    const token = getAuthToken();
    const isLoggedIn = !!token;

    // Check if user is enrolled
    const enrolledCourses = useSelector(
        (state: RootState) => state.enrollment.enrolledCourses
    );
    const isEnrolled = isLoggedIn && enrolledCourses.some((e) => e.courseId === courseId);

    // Check if user has paid for this course
    const payments = useSelector((state: RootState) => state.payment.payments);
    const hasPaid = isLoggedIn && payments.some(
        (p) => p.courseId === courseId && p.status === "completed"
    );

    // Check if user has access to this course (via purchase or all-access subscription)
    const orders = ordersData?.orders || [];
    const now = new Date();

    // Check for all-access subscription
    const hasAllAccess = isLoggedIn && orders.some(
        order =>
            order.planType === "quarterly" &&
            order.paymentStatus === "approved" &&
            order.isActive &&
            order.endDate &&
            new Date(order.endDate) > now
    );

    // Check for specific course purchase
    const hasPurchasedCourse = isLoggedIn && orders.some(
        order =>
            order.planType === "single" &&
            order.paymentStatus === "approved" &&
            order.isActive &&
            order.courseId?._id === courseId
    );

    const hasAccess = isLoggedIn && (hasAllAccess || hasPurchasedCourse || hasPaid || isEnrolled);

    const handleEnrollClick = () => {
        const token = getAuthToken();
        if (!token) {
            alert("Please login to enroll in this course");
            router.push(`/login?redirect=/courses/${courseId}`);
            return;
        }

        const role = getUserRole();
        if (role && role !== "student") {
            alert("Only students can purchase courses. Please switch to a student account.");
            return;
        }

        router.push(`/checkout?plan=single&courseId=${courseId}`);
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

    // Hide unpublished or unapproved courses from public view
    const isAvailable = course?.isPublished && course?.isAdminApproved;

    // Calculate progress
    const modules = course?.modules || [];
    const allLessons = modules.flatMap((m: any) => m.lessons || []);
    const totalLessons = allLessons.length;
    const completedCount = allLessons.filter((l: any) => l.isCompleted).length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Force refetch if enrolled but content is locked (e.g. stale cache)
    useEffect(() => {
        if (isEnrolled && course?.modules?.[0]?.isLocked) {
            // Small timeout to prevent infinite loops if backend is actually broken
            const timer = setTimeout(() => {
                refetch();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isEnrolled, course, refetch]);

    // Use backend isCompleted flag if available
    const isCourseCompleted = course?.isCompleted;

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

    if (!isAvailable) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
                <p className="text-xl font-semibold">This course is not available.</p>
                <p className="text-default-500 max-w-lg">
                    The course has not been published or is pending admin approval. Please check back later.
                </p>
                <Button onPress={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Hero Image */}
                        <div className="relative w-full h-[250px] md:h-[350px] rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={
                                    course.thumbnail ||
                                    course.img ||
                                    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop"
                                }
                                alt={course.title}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop";
                                }}
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
                            <h1 className="text-2xl md:text-3xl font-bold mb-3">
                                {course.title}
                            </h1>
                        </div>

                        {/* Tabs for different sections */}
                        <Tabs
                            selectedKey={selectedTab}
                            onSelectionChange={(key) => setSelectedTab(key as string)}
                            size="md"
                            color="primary"
                            className="mb-3"
                        >
                            <Tab key="overview" title="📖 Overview">
                                <Card>
                                    <CardBody>
                                        <h3 className="text-xl font-semibold mb-3">Description</h3>
                                        <div
                                            className="prose max-w-none text-default-600"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(String(course.description || "")) }}
                                        />
                                    </CardBody>
                                </Card>
                            </Tab>

                            <Tab key="content" title="📚 Content">
                                <CourseModules
                                    courseId={courseId}
                                    isEnrolled={isEnrolled}
                                    modulesFromApi={course.modules}
                                    hasAccess={hasAccess}
                                />
                            </Tab>

                            <Tab key="instructor" title="👨‍🏫 Instructor">
                                <Card>
                                    <CardBody className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            {course.instructorId?.profileImage ? (
                                                <img
                                                    src={course.instructorId.profileImage}
                                                    alt={course.instructorId.name || "Instructor"}
                                                    className="w-24 h-24 rounded-full object-cover border-3 border-primary shadow-lg"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                                                    {(course.instructorId?.name || "U")[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold mb-2">
                                                    {course.instructorId?.name || "Unknown Instructor"}
                                                </h3>
                                                <p className="text-default-500 mb-4">
                                                    {course.instructorId?.role || "Instructor"}
                                                </p>
                                            </div>
                                        </div>

                                        <Divider />

                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold">Contact Information</h4>
                                            <div className="space-y-3">
                                                {course.instructorId?.email && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-xl">📧</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-default-500">Email</p>
                                                            <p className="font-medium">{course.instructorId.email}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {course.instructorId?.phone && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                                            <span className="text-xl">📱</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-default-500">Phone</p>
                                                            <p className="font-medium">{course.instructorId.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {course.instructorId?.bio && (
                                            <>
                                                <Divider />
                                                <div className="space-y-3">
                                                    <h4 className="text-lg font-semibold">About</h4>
                                                    <p className="text-default-600 leading-relaxed">
                                                        {course.instructorId.bio}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        {course.instructorId?.expertise && course.instructorId.expertise.length > 0 && (
                                            <>
                                                <Divider />
                                                <div className="space-y-3">
                                                    <h4 className="text-lg font-semibold">Expertise</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {course.instructorId.expertise.map((skill: string, index: number) => (
                                                            <Chip key={index} color="primary" variant="flat">
                                                                {skill}
                                                            </Chip>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {(course.instructorId?.experience || course.instructorId?.education) && (
                                            <>
                                                <Divider />
                                                <div className="space-y-4">
                                                    {course.instructorId?.experience && (
                                                        <div>
                                                            <h4 className="text-lg font-semibold mb-2">Experience</h4>
                                                            <p className="text-default-600">{course.instructorId.experience}</p>
                                                        </div>
                                                    )}
                                                    {course.instructorId?.education && (
                                                        <div>
                                                            <h4 className="text-lg font-semibold mb-2">Education</h4>
                                                            <p className="text-default-600">{course.instructorId.education}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </CardBody>
                                </Card>
                            </Tab>

                            <Tab key="assessments" title="📚 Assessments">
                                <UnifiedAssessmentView courseId={courseId} hasAccess={hasAccess} />
                            </Tab>

                        </Tabs>
                    </div>

                    {/* Right Column: Enrollment Card */}
                    <div className="lg:col-span-1">
                        {/* Certificate Card - Show when course is fully completed (lessons + assessments) */}
                        {isCourseCompleted && (
                            <Card className="border-2 border-success bg-gradient-to-br from-success-50 to-success-100 mb-6">
                                <CardHeader className="flex-col items-start gap-1">
                                    <div className="flex items-center gap-2">
                                        <FaTrophy className="text-2xl text-success" />
                                        <h3 className="font-bold text-lg">Congratulations! 🎉</h3>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        You've completed all course content!
                                    </p>
                                </CardHeader>
                                <CardBody className="pt-0">
                                    <Button
                                        color="success"
                                        size="lg"
                                        className="w-full"
                                        startContent={<FaDownload />}
                                        onPress={() => {
                                            const certificateUrl = `/api/certificate/generate?courseId=${courseId}&courseName=${encodeURIComponent(course.title)}`;
                                            window.open(certificateUrl, '_blank');
                                        }}
                                    >
                                        Download Certificate
                                    </Button>
                                </CardBody>
                            </Card>
                        )}
                        <Card className="sticky top-24 p-3 shadow-lg">
                            <CardBody className="gap-4">
                                <div className="text-center">
                                    <p className="text-default-500 text-sm mb-1">Price</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        BDT {course.price}
                                    </p>
                                </div>

                                <Divider />

                                {/* Instructor Information */}
                                <div className="space-y-2">
                                    <p className="font-semibold text-base">Instructor:</p>
                                    <div className="flex items-start gap-3">
                                        {course.instructorId?.profileImage ? (
                                            <img
                                                src={course.instructorId.profileImage}
                                                alt={course.instructorId.name || "Instructor"}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                                {(course.instructorId?.name || course.instructorName || "Unknown")[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg">
                                                {course.instructorId?.name || course.instructorName || "Unknown Instructor"}
                                            </p>
                                            {course.instructorId?.email && (
                                                <p className="text-sm text-default-500 flex items-center gap-1">
                                                    <span>📧</span>
                                                    {course.instructorId.email}
                                                </p>
                                            )}
                                            {course.instructorId?.phone && (
                                                <p className="text-sm text-default-500 flex items-center gap-1">
                                                    <span>📱</span>
                                                    {course.instructorId.phone}
                                                </p>
                                            )}
                                            {course.instructorId?.bio && (
                                                <p className="text-sm text-default-600 mt-2 line-clamp-3">
                                                    {course.instructorId.bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                <div className="space-y-2">
                                    <p className="font-semibold text-base mb-2">
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

                                {/* Registration gating logic */}
                                {hasAccess ? (
                                    <Button
                                        color="success"
                                        size="md"
                                        className="w-full font-semibold"
                                        variant="shadow"
                                        onPress={() => setSelectedTab("content")}
                                        startContent={<span>🎓</span>}
                                    >
                                        Start Learning
                                    </Button>
                                ) : (
                                    <>
                                        <RegistrationInfo course={course} />
                                        <Button
                                            color="primary"
                                            size="md"
                                            className="w-full font-semibold"
                                            variant="shadow"
                                            onPress={handleEnrollClick}
                                            isDisabled={!isEnrollmentOpen(course)}
                                        >
                                            {isEnrollmentOpen(course) ? (course.price > 0 ? "💳 Buy Now" : "🎓 Enroll Free") : "Enrollment Closed"}
                                        </Button>
                                    </>
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


        </>
    );
}

function isEnrollmentOpen(course: any): boolean {
    const open = !!course?.isRegistrationOpen;
    const deadline = course?.registrationDeadline ? new Date(course.registrationDeadline) : null;
    const now = new Date();
    if (deadline && !isNaN(deadline.getTime())) {
        return open && now < deadline;
    }
    return open;
}

function RegistrationInfo({ course }: { course: any }) {
    const deadline = useMemo(() => {
        if (!course?.registrationDeadline) return null;
        const d = new Date(course.registrationDeadline);
        return isNaN(d.getTime()) ? null : d;
    }, [course?.registrationDeadline]);

    const [remaining, setRemaining] = useState<string>("");

    useEffect(() => {
        if (!deadline) return;
        const tick = () => {
            const now = new Date().getTime();
            const end = deadline.getTime();
            const diff = end - now;
            if (diff <= 0) {
                setRemaining("0d 0h 0m 0s");
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [deadline]);

    const open = isEnrollmentOpen(course);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Registration:</span>
                <span className={open ? "text-success" : "text-danger"}>{open ? "Open" : "Closed"}</span>
            </div>
            {deadline && (
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Closes in:</span>
                    <span>{remaining}</span>
                </div>
            )}
        </div>
    );
}
