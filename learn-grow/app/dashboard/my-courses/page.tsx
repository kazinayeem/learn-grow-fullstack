"use client";

import React, { useState } from "react";
import { Card, CardBody, CardFooter, Button, Progress, Tabs, Tab, Input, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { FaSearch, FaBook, FaClock, FaCheckCircle } from "react-icons/fa";

export default function MyCoursesPage() {
    const router = useRouter();
    const enrolledCourses = useSelector((state: RootState) => state.enrollment.enrolledCourses);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("all");

    // Filter courses
    const filteredCourses = enrolledCourses.filter((course: any) => {
        const matchesSearch = course.courseName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filter === "all" ||
            (filter === "inprogress" && course.progress < 100) ||
            (filter === "completed" && course.progress === 100);

        return matchesSearch && matchesFilter;
    });

    const stats = {
        all: enrolledCourses.length,
        inprogress: enrolledCourses.filter((c: any) => c.progress < 100).length,
        completed: enrolledCourses.filter((c: any) => c.progress === 100).length,
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Courses</h1>
                <p className="text-gray-600">Manage and continue your enrolled courses</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FaBook className="text-2xl text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Courses</p>
                            <p className="text-2xl font-bold">{stats.all}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <FaClock className="text-2xl text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold">{stats.inprogress}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <FaCheckCircle className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
                <Input
                    placeholder="Search your courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<FaSearch className="text-gray-400" />}
                    size="lg"
                />

                <Tabs
                    selectedKey={filter}
                    onSelectionChange={(key) => setFilter(key as string)}
                    color="primary"
                    size="lg"
                >
                    <Tab key="all" title={`All (${stats.all})`} />
                    <Tab key="inprogress" title={`In Progress (${stats.inprogress})`} />
                    <Tab key="completed" title={`Completed (${stats.completed})`} />
                </Tabs>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
                <Card>
                    <CardBody className="text-center py-12">
                        <p className="text-gray-500 mb-4">
                            {searchQuery
                                ? "No courses found matching your search"
                                : "You haven't enrolled in any courses yet"}
                        </p>
                        {!searchQuery && (
                            <Button
                                color="primary"
                                size="lg"
                                onPress={() => router.push("/courses")}
                            >
                                Browse Available Courses
                            </Button>
                        )}
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course: any) => (
                        <Card
                            key={course.courseId}
                            className="hover:shadow-xl transition-shadow"
                        >
                            <CardBody className="p-6">
                                {/* Course Status Badge */}
                                <div className="flex justify-between items-start mb-3">
                                    <Chip
                                        color={course.progress === 100 ? "success" : "warning"}
                                        size="sm"
                                        variant="flat"
                                    >
                                        {course.progress === 100 ? "Completed" : "In Progress"}
                                    </Chip>
                                    {course.progress === 100 && (
                                        <FaCheckCircle className="text-green-500 text-xl" />
                                    )}
                                </div>

                                {/* Course Title */}
                                <h3 className="font-bold text-xl mb-2 line-clamp-2">
                                    {course.courseName || `Course ${course.courseId}`}
                                </h3>

                                {/* Enrollment Date */}
                                <p className="text-sm text-gray-500 mb-4">
                                    Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Progress</span>
                                        <span className="font-semibold text-primary">
                                            {course.progress || 0}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={course.progress || 0}
                                        color={course.progress === 100 ? "success" : "primary"}
                                        size="sm"
                                        className="mb-2"
                                    />
                                    <p className="text-xs text-gray-500">
                                        {course.progress === 100
                                            ? "Course completed! 🎉"
                                            : `${100 - (course.progress || 0)}% remaining`}
                                    </p>
                                </div>
                            </CardBody>

                            <CardFooter className="p-6 pt-0 flex gap-2">
                                <Button
                                    color="primary"
                                    className="flex-1"
                                    onPress={() => router.push(`/courses/${course.courseId}`)}
                                >
                                    {course.progress === 100 ? "Review" : "Continue"}
                                </Button>
                                {course.progress === 100 && (
                                    <Button
                                        color="success"
                                        variant="bordered"
                                        onPress={() => router.push(`/dashboard/certificates`)}
                                    >
                                        Certificate
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
