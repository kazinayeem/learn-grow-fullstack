"use client";

import React from "react";
import { Card, CardBody, Progress, Chip } from "@nextui-org/react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { FaTrophy, FaClock, FaFire, FaChartLine } from "react-icons/fa";

export default function ProgressPage() {
    const enrolledCourses = useSelector((state: RootState) => state.enrollment.enrolledCourses);

    // Calculate overall statistics
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter((c: any) => c.progress === 100).length;
    const averageProgress = totalCourses > 0
        ? Math.round(enrolledCourses.reduce((sum: number, c: any) => sum + (c.progress || 0), 0) / totalCourses)
        : 0;

    // Mock data for demonstration
    const stats = {
        totalHours: 24,
        streak: 5,
        certificates: completedCourses,
        achievements: completedCourses * 2,
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Learning Progress</h1>
                <p className="text-gray-600">Track your learning journey and achievements</p>
            </div>

            {/* Overall Progress */}
            <Card className="mb-8 bg-gradient-to-r from-primary-500 to-purple-500">
                <CardBody className="p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-2">Overall Progress</h2>
                            <p className="text-white/90">Keep up the great work!</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-6xl font-bold mb-2">{averageProgress}%</div>
                            <Progress
                                value={averageProgress}
                                className="w-64"
                                classNames={{
                                    indicator: "bg-white",
                                }}
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FaClock className="text-3xl text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Hours Learned</p>
                                <p className="text-3xl font-bold">{stats.totalHours}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <FaFire className="text-3xl text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Day Streak</p>
                                <p className="text-3xl font-bold">{stats.streak}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaTrophy className="text-3xl text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Certificates</p>
                                <p className="text-3xl font-bold">{stats.certificates}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FaChartLine className="text-3xl text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Achievements</p>
                                <p className="text-3xl font-bold">{stats.achievements}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Course Progress Details */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Course Progress Breakdown</h2>
                <div className="space-y-4">
                    {enrolledCourses.length === 0 ? (
                        <Card>
                            <CardBody className="text-center py-12">
                                <p className="text-gray-500">No enrolled courses yet</p>
                            </CardBody>
                        </Card>
                    ) : (
                        enrolledCourses.map((course: any) => (
                            <Card key={course.courseId}>
                                <CardBody className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg">
                                                    {course.courseName || `Course ${course.courseId}`}
                                                </h3>
                                                <Chip
                                                    color={course.progress === 100 ? "success" : "warning"}
                                                    size="sm"
                                                    variant="flat"
                                                >
                                                    {course.progress === 100 ? "Completed" : "In Progress"}
                                                </Chip>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex-1 max-w-md">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-bold text-primary">
                                                    {course.progress || 0}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={course.progress || 0}
                                                color={course.progress === 100 ? "success" : "primary"}
                                                size="lg"
                                                className="mb-2"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Started</span>
                                                <span>
                                                    {course.progress === 100 ? "Completed!" : `${100 - (course.progress || 0)}% to go`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Achievements Section (Mock) */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Recent Achievements 🏆</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {completedCourses > 0 ? (
                        <>
                            <Card className="bg-gradient-to-br from-yellow-100 to-yellow-200">
                                <CardBody className="p-6 text-center">
                                    <div className="text-4xl mb-2">🌟</div>
                                    <h3 className="font-bold mb-1">First Course Complete</h3>
                                    <p className="text-sm text-gray-600">Completed your first course!</p>
                                </CardBody>
                            </Card>
                            {completedCourses >= 3 && (
                                <Card className="bg-gradient-to-br from-blue-100 to-blue-200">
                                    <CardBody className="p-6 text-center">
                                        <div className="text-4xl mb-2">🚀</div>
                                        <h3 className="font-bold mb-1">Fast Learner</h3>
                                        <p className="text-sm text-gray-600">Completed 3 courses!</p>
                                    </CardBody>
                                </Card>
                            )}
                            {stats.streak >= 5 && (
                                <Card className="bg-gradient-to-br from-orange-100 to-orange-200">
                                    <CardBody className="p-6 text-center">
                                        <div className="text-4xl mb-2">🔥</div>
                                        <h3 className="font-bold mb-1">On Fire!</h3>
                                        <p className="text-sm text-gray-600">5-day learning streak!</p>
                                    </CardBody>
                                </Card>
                            )}
                        </>
                    ) : (
                        <Card className="col-span-3">
                            <CardBody className="text-center py-8">
                                <p className="text-gray-500">Complete courses to unlock achievements!</p>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
