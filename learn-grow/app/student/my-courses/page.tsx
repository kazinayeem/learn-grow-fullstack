"use client";

import React, { useState } from "react";
import { Card, CardBody, Button, Spinner, Chip, Pagination } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useGetUserPurchasedCoursesQuery } from "@/redux/api/orderApi";
import { FaRocket, FaBook, FaCrown } from "react-icons/fa";

export default function MyCoursesPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const { data, isLoading, refetch } = useGetUserPurchasedCoursesQuery(currentPage);
    const courses = data?.courses || [];
    const safeCourses = courses.filter((item: any) => item && item.course);
    const pagination = data?.pagination || { total: 0, page: 1, limit: 9, totalPages: 1 };
    const hasQuarterlyAccess = data?.hasQuarterlyAccess || false;

    // Refetch when page changes
    React.useEffect(() => {
        refetch();
    }, [currentPage, refetch]);

    // Debug logging
    React.useEffect(() => {
        if (data) {
            console.log("[MyCoursesPage] Data received:", {
                coursesCount: safeCourses.length,
                hasQuarterlyAccess,
                pagination,
                firstCourse: safeCourses[0]
            });
        }
    }, [data, courses, safeCourses, hasQuarterlyAccess, pagination]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading your courses..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">My Courses</h1>
                            <p className="text-blue-100">
                                Continue where you left off. Happy Learning!
                            </p>
                        </div>
                        {hasQuarterlyAccess && (
                            <Chip
                                startContent={<FaCrown className="text-lg" />}
                                className="bg-yellow-400 text-gray-900 font-bold text-base px-4"
                            >
                                Premium Access ✓
                            </Chip>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 -mt-8">
                <Card className="min-h-[400px]">
                    <CardBody className="p-8">
                        {safeCourses.length === 0 ? (
                            <div className="text-center py-12">
                                <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    No courses found
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    You haven't enrolled in any courses yet. Explore our catalog to start learning today!
                                </p>
                                <Button
                                    color="primary"
                                    size="lg"
                                    onPress={() => router.push("/courses")}
                                >
                                    Browse Courses
                                </Button>
                            </div>
                        ) : (
                            <div>
                                {hasQuarterlyAccess && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
                                        <p className="text-gray-800 font-semibold">
                                            🎓 You have access to all {pagination.total} published courses through your Premium subscription!
                                        </p>
                                        {safeCourses.length > 0 && safeCourses[0]?.accessUntil && (
                                            <p className="text-gray-600 text-sm mt-1">
                                                Your access expires on {new Date(safeCourses[0]?.accessUntil).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {safeCourses.map((item: any) => (
                                        <Card
                                            key={item.course._id}
                                            className="hover:scale-[1.02] transition-all border border-transparent hover:border-primary"
                                        >
                                            <div 
                                                className="relative aspect-video cursor-pointer"
                                                onClick={() => router.push(`/courses/${item.course._id}`)}
                                            >
                                                <img
                                                    src={item.course?.thumbnail || "/images/course-placeholder.jpg"}
                                                    alt={item.course?.title || "Course thumbnail"}
                                                    className="object-cover w-full h-full"
                                                />
                                                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                                                {item.accessType === "quarterly" && (
                                                    <div className="absolute top-3 right-3 z-10">
                                                        <Chip
                                                            startContent={<FaCrown className="text-xs" />}
                                                            size="sm"
                                                            className="bg-yellow-400 text-gray-900 font-bold"
                                                        >
                                                            All Access
                                                        </Chip>
                                                    </div>
                                                )}
                                            </div>
                                            <CardBody className="p-4">
                                                <Chip size="sm" color="success" variant="flat" className="mb-2 w-fit">
                                                    Enrolled
                                                </Chip>
                                                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                                                    {item.course.title}
                                                </h3>
                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                    <div>
                                                        {item.course.instructor?.name || "Instructor"}
                                                    </div>
                                                </div>
                                                <Button
                                                    color="primary"
                                                    variant="shadow"
                                                    className="w-full font-semibold"
                                                    onPress={() => router.push(`/student/course/${item.course._id}/dashboard`)}
                                                    startContent={<FaRocket />}
                                                >
                                                    Continue Learning
                                                </Button>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 mt-8 flex-col">
                                        <Pagination
                                            total={pagination.totalPages}
                                            initialPage={1}
                                            page={currentPage}
                                            onChange={(page) => setCurrentPage(page)}
                                            showControls
                                            color="primary"
                                            size="lg"
                                        />
                                        <p className="text-sm text-gray-500 mt-4">
                                            Showing {(currentPage - 1) * 9 + 1} - {Math.min(currentPage * 9, pagination.total)} of {pagination.total} courses
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
