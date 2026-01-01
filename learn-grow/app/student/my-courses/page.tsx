"use client";

import React from "react";
import { Card, CardBody, Button, Spinner, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useGetUserPurchasedCoursesQuery } from "@/redux/api/orderApi";
import { FaRocket, FaBook } from "react-icons/fa";

export default function MyCoursesPage() {
    const router = useRouter();
    const { data, isLoading } = useGetUserPurchasedCoursesQuery();
    const courses = data?.courses || [];

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
                    <h1 className="text-3xl font-bold mb-2">My Courses</h1>
                    <p className="text-blue-100">
                        Continue where you left off. Happy Learning!
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-6 -mt-8">
                <Card className="min-h-[400px]">
                    <CardBody className="p-8">
                        {courses.length === 0 ? (
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map((item: any) => (
                                    <Card
                                        key={item.course._id}
                                        isPressable
                                        onPress={() => router.push(`/courses/${item.course._id}`)}
                                        className="hover:scale-[1.02] transition-all border border-transparent hover:border-primary"
                                    >
                                        <div className="relative aspect-video">
                                            <img
                                                src={item.course.thumbnail || "/images/course-placeholder.jpg"}
                                                alt={item.course.title}
                                                className="object-cover w-full h-full"
                                            />
                                            <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                                        </div>
                                        <CardBody className="p-4">
                                            <Chip size="sm" color="success" variant="flat" className="mb-2">
                                                Enrolled
                                            </Chip>
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2">
                                                {item.course.title}
                                            </h3>
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="text-sm text-gray-500">
                                                    {item.course.instructor?.name || "Instructor"}
                                                </div>
                                                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                                    Continue <FaRocket />
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
