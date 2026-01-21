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

    // Check for all-access subscription (including lifetime)
    const hasAllAccess = isLoggedIn && orders.some(
        order =>
            order.planType === "quarterly" &&
            order.paymentStatus === "approved" &&
            order.isActive &&
            (order.endDate === null || (order.endDate && new Date(order.endDate) > now))
    );

    // Check for specific course purchase
    const hasPurchasedCourse = isLoggedIn && orders.some(
        order =>
            order.planType === "single" &&
            order.paymentStatus === "approved" &&
            order.isActive &&
            order.courseId?._id === courseId &&
            (order.endDate === null || (order.endDate && new Date(order.endDate) > now))
    );

    // Check if course is in any purchased combo/bundle
    const hasComboAccess = isLoggedIn && orders.some(
        order => {
            if (order.planType === "combo" && 
                order.paymentStatus === "approved" && 
                order.isActive &&
                (order.endDate === null || (order.endDate && new Date(order.endDate) > now)) &&
                order.comboId) {
                const combo = typeof order.comboId === "object" ? order.comboId : null;
                if (combo && combo.courses && Array.isArray(combo.courses)) {
                    return combo.courses.some((course: any) => {
                        const cId = typeof course === "object" ? course._id : course;
                        return cId?.toString() === courseId;
                    });
                }
            }
            return false;
        }
    );

    const hasAccess = isLoggedIn && (hasAllAccess || hasPurchasedCourse || hasComboAccess || hasPaid || isEnrolled);

    // Pending approval states
    const hasPendingAllAccess = isLoggedIn && orders.some(
        order =>
            order.planType === "quarterly" &&
            order.paymentStatus !== "approved" &&
            order.isActive
    );

    const hasPendingCourseOrder = isLoggedIn && orders.some(
        order =>
            order.planType === "single" &&
            order.courseId?._id === courseId &&
            order.paymentStatus !== "approved"
    );

    const isAwaitingApproval = hasPendingAllAccess || hasPendingCourseOrder;

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

  
    const course = data?.data || data;

    // For free courses: anyone can see outline/preview
    const isFree = course?.isFree || course?.price === 0;
    const canViewPreview = isFree || hasAccess;

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
            {/* Responsive container with proper padding and max-width */}
            <div className="w-full bg-default-50 min-h-screen">
                {/* Top navigation spacing */}
                <div className="pt-4 sm:pt-6 md:pt-8"></div>
                
                <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
                    {/* Main grid: Responsive column layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        {/* Left Column: Main Content - Full width on mobile, 2 cols on tablet, 2 cols on desktop */}
                        <div className="md:col-span-2 space-y-4 sm:space-y-6">
                            {/* Hero Image - Responsive height and aspect ratio */}
                            <div className="relative w-full overflow-hidden shadow-md sm:shadow-lg rounded-lg sm:rounded-xl">
                                {/* Aspect ratio container for responsive image */}
                                <div className="relative w-full pt-[56.25%]">
                                    <img
                                        src={
                                            course.thumbnail ||
                                            course.img ||
                                            "/images/course-placeholder.jpg"
                                        }
                                        alt={course.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) => {
                                            const img = e.currentTarget;
                                            img.onerror = null;
                                            img.src = "/logo.png";
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Title & Badges - Responsive typography */}
                            <div className="space-y-3 sm:space-y-4">
                                {/* Badges with responsive wrapping */}
                                <div className="flex flex-wrap gap-2">
                                    <Chip 
                                        color="primary" 
                                        variant="flat"
                                        className="text-xs sm:text-sm"
                                    >
                                        {course.level || "Beginner"}
                                    </Chip>
                                    <Chip 
                                        color="secondary" 
                                        variant="flat"
                                        className="text-xs sm:text-sm"
                                    >
                                        {course.category?.name || "Programming"}
                                    </Chip>
                                    {hasPaid && (
                                        <Chip 
                                            color="warning" 
                                            variant="flat"
                                            className="text-xs sm:text-sm"
                                        >
                                            💳 Paid
                                        </Chip>
                                    )}
                                    {isEnrolled && (
                                        <Chip 
                                            color="success" 
                                            variant="flat"
                                            className="text-xs sm:text-sm"
                                        >
                                            ✓ Enrolled
                                        </Chip>
                                    )}
                                </div>
                                
                                {/* Responsive title with clamp() for fluid typography */}
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                                    {course.title}
                                </h1>
                            </div>

                            {/* Responsive tabs: vertical mobile, horizontal desktop */}
                            <Tabs
                                selectedKey={selectedTab}
                                onSelectionChange={(key) => setSelectedTab(key as string)}
                                size="md"
                                color="primary"
                                variant="light"
                                className="mb-4 sm:mb-6"
                                classNames={{
                                    base: "w-full",
                                    tabList: "flex flex-col sm:flex-row sm:justify-start gap-0 bg-default-100 rounded-lg sm:rounded-xl p-1 w-full sm:w-auto",
                                    tab: "w-full sm:w-auto justify-start sm:justify-center px-4 sm:px-6 py-3 sm:py-2 text-sm sm:text-base font-medium",
                                    cursor: "bg-primary rounded-lg"
                                }}
                            >
                                <Tab 
                                    key="overview" 
                                    title={
                                        <div className="flex items-center gap-2">
                                            <span>📖</span>
                                            <span>Overview</span>
                                        </div>
                                    }
                                >
                                    <Card className="shadow-md mt-4">
                                        <CardBody className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                                            <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Description</h3>
                                            <div
                                                className="prose prose-sm sm:prose-base max-w-none text-default-600 overflow-x-hidden"
                                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(String(course.description || "")) }}
                                            />
                                        </CardBody>
                                    </Card>
                                </Tab>

                                <Tab 
                                    key="content" 
                                    title={
                                        <div className="flex items-center gap-2">
                                            <span>📚</span>
                                            <span>Content</span>
                                        </div>
                                    }
                                >
                                    <div className="mt-4">
                                        <CourseModules
                                            courseId={courseId}
                                            isEnrolled={isEnrolled}
                                            modulesFromApi={course.modules}
                                            hasAccess={hasAccess}
                                            canViewPreview={canViewPreview}
                                        />
                                    </div>
                                </Tab>

                                <Tab 
                                    key="instructor" 
                                    title={
                                        <div className="flex items-center gap-2">
                                            <span>👨‍🏫</span>
                                            <span>Instructor</span>
                                        </div>
                                    }
                                >
                                    <Card className="shadow-md mt-4">
                                        <CardBody className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                                            {/* Responsive instructor info */}
                                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                                {course.instructorId?.profileImage ? (
                                                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-3 border-primary shadow-lg flex-shrink-0 mx-auto sm:mx-0 overflow-hidden">
                                                        <img
                                                            src={course.instructorId.profileImage}
                                                            alt={course.instructorId.name || "Instructor"}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const img = e.currentTarget;
                                                                img.onerror = null;
                                                                img.style.display = 'none';
                                                                const parent = img.parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML = `<div class="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-3xl sm:text-4xl">${(course.instructorId?.name || "U")[0]?.toUpperCase()}</div>`;
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-lg flex-shrink-0 mx-auto sm:mx-0">
                                                        {(course.instructorId?.name || "U")[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1 text-center sm:text-left">
                                                    <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                                                        {course.instructorId?.name || "Unknown Instructor"}
                                                    </h3>
                                                    <p className="text-sm sm:text-base text-default-500 mb-2 sm:mb-4">
                                                        {course.instructorId?.role || "Instructor"}
                                                    </p>
                                                </div>
                                            </div>

                                            <Divider className="my-2" />

                                            {/* Contact Information */}
                                            <div className="space-y-3 sm:space-y-4">
                                                <h4 className="text-base sm:text-lg font-semibold">Contact Information</h4>
                                                <div className="space-y-2 sm:space-y-3">
                                                    {course.instructorId?.email && (
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-lg">📧</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs sm:text-sm text-default-500">Email</p>
                                                                <p className="font-medium text-sm sm:text-base break-all">{course.instructorId.email}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {course.instructorId?.phone && (
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-lg">📱</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs sm:text-sm text-default-500">Phone</p>
                                                                <p className="font-medium text-sm sm:text-base">{course.instructorId.phone}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {course.instructorId?.bio && (
                                                <>
                                                    <Divider className="my-2" />
                                                    <div className="space-y-2 sm:space-y-3">
                                                        <h4 className="text-base sm:text-lg font-semibold">About</h4>
                                                        <p className="text-sm sm:text-base text-default-600 leading-relaxed">
                                                            {course.instructorId.bio}
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {course.instructorId?.expertise && course.instructorId.expertise.length > 0 && (
                                                <>
                                                    <Divider className="my-2" />
                                                    <div className="space-y-2 sm:space-y-3">
                                                        <h4 className="text-base sm:text-lg font-semibold">Expertise</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {course.instructorId.expertise.map((skill: string, index: number) => (
                                                                <Chip 
                                                                    key={index} 
                                                                    color="primary" 
                                                                    variant="flat"
                                                                    className="text-xs sm:text-sm"
                                                                >
                                                                    {skill}
                                                                </Chip>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {(course.instructorId?.experience || course.instructorId?.education) && (
                                                <>
                                                    <Divider className="my-2" />
                                                    <div className="space-y-3 sm:space-y-4">
                                                        {course.instructorId?.experience && (
                                                            <div>
                                                                <h4 className="text-base sm:text-lg font-semibold mb-2">Experience</h4>
                                                                <p className="text-sm sm:text-base text-default-600">{course.instructorId.experience}</p>
                                                            </div>
                                                        )}
                                                        {course.instructorId?.education && (
                                                            <div>
                                                                <h4 className="text-base sm:text-lg font-semibold mb-2">Education</h4>
                                                                <p className="text-sm sm:text-base text-default-600">{course.instructorId.education}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </CardBody>
                                    </Card>
                                </Tab>

                                {isLoggedIn && (
                                    <Tab 
                                        key="assessments" 
                                        title={
                                            <div className="flex items-center gap-2">
                                                <span>📝</span>
                                                <span>Assessments</span>
                                            </div>
                                        }
                                    >
                                        <div className="mt-4">
                                            <UnifiedAssessmentView courseId={courseId} hasAccess={hasAccess} />
                                        </div>
                                    </Tab>
                                )}
                            </Tabs>
                        </div>

                        {/* Right Column: Enrollment Card - Sticky on desktop, normal on mobile */}
                        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
                            {/* Certificate Card - Show when course is fully completed */}
                            {isCourseCompleted && (
                                <Card className="border-2 border-success bg-gradient-to-br from-success-50 to-success-100 shadow-md">
                                    <CardHeader className="flex-col items-start gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <div className="flex items-center gap-2 w-full flex-wrap">
                                            <FaTrophy className="text-xl sm:text-2xl text-success flex-shrink-0" />
                                            <h3 className="font-bold text-base sm:text-lg">Congratulations! 🎉</h3>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-700">
                                            You've completed all course content!
                                        </p>
                                    </CardHeader>
                                    <CardBody className="pt-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                                        <Button
                                            color="success"
                                            size="lg"
                                            className="w-full text-sm sm:text-base"
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
                            
                            {/* Main enrollment card - Sticky on large screens, fixed position on mobile */}
                            <Card className="lg:sticky lg:top-24 shadow-md sm:shadow-lg p-3 sm:p-4 md:p-6">
                                <CardBody className="gap-3 sm:gap-4 md:gap-6">
                                    {/* Price section */}
                                    <div className="text-center">
                                        <p className="text-default-500 text-xs sm:text-sm mb-1">Price</p>
                                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            BDT {course.price}
                                        </p>
                                    </div>

                                    <Divider className="my-2" />

                                    {/* Instructor Information - Responsive layout */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <p className="font-semibold text-sm sm:text-base">Instructor:</p>
                                        <div className="flex flex-col sm:flex-row sm:gap-3 gap-2">
                                            <div className="flex justify-center sm:justify-start">
                                                {course.instructorId?.profileImage ? (
                                                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-primary flex-shrink-0 overflow-hidden">
                                                        <img
                                                            src={course.instructorId.profileImage}
                                                            alt={course.instructorId.name || "Instructor"}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const img = e.currentTarget;
                                                                img.onerror = null;
                                                                img.style.display = 'none';
                                                                const parent = img.parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML = `<div class="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg sm:text-2xl">${(course.instructorId?.name || course.instructorName || "U")[0]?.toUpperCase()}</div>`;
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg sm:text-2xl flex-shrink-0">
                                                        {(course.instructorId?.name || course.instructorName || "Unknown")[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center sm:text-left min-w-0">
                                                <p className="font-semibold text-sm sm:text-base truncate">
                                                    {course.instructorId?.name || course.instructorName || "Unknown Instructor"}
                                                </p>
                                                {course.instructorId?.email && (
                                                    <p className="text-xs sm:text-sm text-default-500 flex items-center gap-1 justify-center sm:justify-start truncate">
                                                        <span>📧</span>
                                                        <span className="truncate">{course.instructorId.email}</span>
                                                    </p>
                                                )}
                                                {course.instructorId?.phone && (
                                                    <p className="text-xs sm:text-sm text-default-500 flex items-center gap-1 justify-center sm:justify-start">
                                                        <span>📱</span>
                                                        {course.instructorId.phone}
                                                    </p>
                                                )}
                                                {course.instructorId?.bio && (
                                                    <p className="text-xs sm:text-sm text-default-600 mt-1 sm:mt-2 line-clamp-2">
                                                        {course.instructorId.bio}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Divider className="my-2" />

                                    {/* Course Features - Dynamic */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <p className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">
                                            Course Features:
                                        </p>
                                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                            {/* Duration */}
                                            {course?.duration && (
                                                <li className="flex items-center gap-2 text-default-600">
                                                    <span className="text-success font-bold flex-shrink-0">✓</span>
                                                    <span className="leading-snug">{course.duration} hours of content</span>
                                                </li>
                                            )}
                                            
                                            {/* Access Duration */}
                                            {course?.accessDuration && (
                                                <li className="flex items-center gap-2 text-default-600">
                                                    <span className="text-success font-bold flex-shrink-0">✓</span>
                                                    <span className="leading-snug">
                                                        {course.accessDuration === "lifetime" 
                                                            ? "♾️ Lifetime access" 
                                                            : `${course.accessDuration} month${course.accessDuration === "1" ? "" : "s"} access`}
                                                    </span>
                                                </li>
                                            )}
                                            
                                            {/* Certificate */}
                                            <li className="flex items-center gap-2 text-default-600">
                                                <span className="text-success font-bold flex-shrink-0">✓</span>
                                                <span className="leading-snug">Certificate of completion</span>
                                            </li>
                                            
                                            {/* Mobile Access */}
                                            <li className="flex items-center gap-2 text-default-600">
                                                <span className="text-success font-bold flex-shrink-0">✓</span>
                                                <span className="leading-snug">Access on mobile and TV</span>
                                            </li>
                                            
                                            {/* Course Type */}
                                            {course?.type && (
                                                <li className="flex items-center gap-2 text-default-600">
                                                    <span className="text-success font-bold flex-shrink-0">✓</span>
                                                    <span className="leading-snug">
                                                        {course.type === "live" ? "Live class sessions" : "Pre-recorded video lessons"}
                                                    </span>
                                                </li>
                                            )}
                                            
                                            {/* Modules Count */}
                                            {modules && modules.length > 0 && (
                                                <li className="flex items-center gap-2 text-default-600">
                                                    <span className="text-success font-bold flex-shrink-0">✓</span>
                                                    <span className="leading-snug">{modules.length} modules • {totalLessons} lessons</span>
                                                </li>
                                            )}
                                            
                                            {/* Language */}
                                            {course?.language && (
                                                <li className="flex items-center gap-2 text-default-600">
                                                    <span className="text-success font-bold flex-shrink-0">✓</span>
                                                    <span className="leading-snug">Taught in {course.language}</span>
                                                </li>
                                            )}
                                            
                                            {/* Assignments & Quizzes */}
                                            <li className="flex items-center gap-2 text-default-600">
                                                <span className="text-success font-bold flex-shrink-0">✓</span>
                                                <span className="leading-snug">Assignments & Quizzes</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <Divider className="my-2" />

                                    {/* Action Buttons - Full width and responsive */}
                                    <div className="flex flex-col gap-2 sm:gap-3">
                                        {/* Registration gating logic */}
                                        {isAwaitingApproval ? (
                                            <>
                                                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                                                    <p className="text-warning-700 text-sm text-center font-semibold">
                                                        Your purchase is pending admin approval. Please wait.
                                                    </p>
                                                </div>
                                                <Button
                                                    color="default"
                                                    size="md"
                                                    className="w-full font-semibold text-sm sm:text-base"
                                                    variant="flat"
                                                    isDisabled
                                                >
                                                    Awaiting Approval
                                                </Button>
                                            </>
                                        ) : hasAccess ? (
                                            <Button
                                                color="success"
                                                size="md"
                                                className="w-full font-semibold text-sm sm:text-base"
                                                variant="shadow"
                                                onPress={() => router.push(`/student/course/${courseId}/dashboard`)}
                                                startContent={<span>🎓</span>}
                                            >
                                                Start Learning
                                            </Button>
                                        ) : isFree ? (
                                            <>
                                                <div className="bg-success-50 border border-success-200 rounded-lg p-2 sm:p-3">
                                                    <p className="text-success-700 text-xs sm:text-sm text-center font-semibold">
                                                        ✨ This is a FREE course!
                                                    </p>
                                                </div>
                                                <Button
                                                    color="success"
                                                    size="md"
                                                    className="w-full font-semibold text-sm sm:text-base"
                                                    variant="shadow"
                                                    onPress={handleEnrollClick}
                                                    isDisabled={!isEnrollmentOpen(course)}
                                                >
                                                    {isEnrollmentOpen(course) ? "🎓 Enroll Now" : "Enrollment Closed"}
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <RegistrationInfo course={course} />
                                                <Button
                                                    color="primary"
                                                    size="md"
                                                    className="w-full font-semibold text-sm sm:text-base"
                                                    variant="shadow"
                                                    onPress={handleEnrollClick}
                                                    isDisabled={!isEnrollmentOpen(course)}
                                                >
                                                    {isEnrollmentOpen(course) ? "💳 Buy Now" : "Enrollment Closed"}
                                                </Button>
                                            </>
                                        )}

                                        <Button
                                            variant="bordered"
                                            className="w-full text-sm sm:text-base"
                                            onPress={() => router.back()}
                                        >
                                            ← Back to Courses
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
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
