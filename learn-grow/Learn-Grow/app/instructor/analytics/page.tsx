"use client";

import React from "react";
import { Card, CardBody, Progress, Chip } from "@nextui-org/react";
import { FaUsers, FaGraduationCap, FaClock, FaChartLine } from "react-icons/fa";

export default function InstructorAnalyticsPage() {
    // Mock data - replace with real API data
    const analytics = {
        totalStudents: 127,
        activeStudents: 95,
        completionRate: 78,
        avgProgress: 65,
        totalCourses: 5,
        avgRating: 4.7,
    };

    const coursePerformance = [
        {
            id: "1",
            title: "Web Development Bootcamp",
            students: 45,
            completionRate: 82,
            avgProgress: 72,
            revenue: 90000,
        },
        {
            id: "2",
            title: "Python for Beginners",
            students: 32,
            completionRate: 91,
            avgProgress: 85,
            revenue: 48000,
        },
        {
            id: "3",
            title: "React Advanced Concepts",
            students: 18,
            completionRate: 65,
            avgProgress: 58,
            revenue: 45000,
        },
        {
            id: "4",
            title: "Data Science Fundamentals",
            students: 22,
            completionRate: 73,
            avgProgress: 68,
            revenue: 44000,
        },
        {
            id: "5",
            title: "UI/UX Design Basics",
            students: 10,
            completionRate: 80,
            avgProgress: 75,
            revenue: 15000,
        },
    ];

    const monthlyTrend = [
        { month: "Jul", students: 15, revenue: 30000 },
        { month: "Aug", students: 22, revenue: 44000 },
        { month: "Sep", students: 18, revenue: 36000 },
        { month: "Oct", students: 28, revenue: 56000 },
        { month: "Nov", students: 24, revenue: 48000 },
        { month: "Dec", students: 20, revenue: 40000 },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Analytics & Performance 📊</h1>
                <p className="text-gray-600">Track your teaching performance and student engagement</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Students</p>
                                <p className="text-3xl font-bold mt-1">{analytics.totalStudents}</p>
                            </div>
                            <FaUsers className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Completion Rate</p>
                                <p className="text-3xl font-bold mt-1">{analytics.completionRate}%</p>
                            </div>
                            <FaGraduationCap className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Avg. Progress</p>
                                <p className="text-3xl font-bold mt-1">{analytics.avgProgress}%</p>
                            </div>
                            <FaClock className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Avg. Rating</p>
                                <p className="text-3xl font-bold mt-1">{analytics.avgRating} ⭐</p>
                            </div>
                            <FaChartLine className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Course Performance */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Course Performance</h2>
                <div className="space-y-4">
                    {coursePerformance.map((course) => (
                        <Card key={course.id}>
                            <CardBody className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Course Info */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span>👥 {course.students} students</span>
                                            <span>✅ {course.completionRate}% completion</span>
                                            <span>💰 {course.revenue.toLocaleString()} BDT</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="flex-1 max-w-md">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Avg. Student Progress</span>
                                            <span className="font-semibold text-primary">{course.avgProgress}%</span>
                                        </div>
                                        <Progress
                                            value={course.avgProgress}
                                            color={course.avgProgress > 75 ? "success" : course.avgProgress > 50 ? "warning" : "danger"}
                                            size="lg"
                                        />
                                    </div>

                                    {/* Performance Badge */}
                                    <Chip
                                        color={course.completionRate > 80 ? "success" : course.completionRate > 60 ? "warning" : "danger"}
                                        variant="flat"
                                        size="lg"
                                    >
                                        {course.completionRate > 80 ? "Excellent" : course.completionRate > 60 ? "Good" : "Needs Improvement"}
                                    </Chip>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Monthly Trends */}
            <div>
                <h2 className="text-2xl font-bold mb-4">6-Month Trend</h2>
                <Card>
                    <CardBody className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            {monthlyTrend.map((month) => (
                                <div key={month.month} className="text-center">
                                    <div className="bg-primary-100 rounded-lg p-4 mb-2">
                                        <p className="text-2xl font-bold text-primary">{month.students}</p>
                                        <p className="text-xs text-gray-600">Students</p>
                                    </div>
                                    <div className="bg-green-100 rounded-lg p-2 mb-2">
                                        <p className="text-sm font-semibold text-green-600">
                                            {(month.revenue / 1000).toFixed(0)}K
                                        </p>
                                        <p className="text-xs text-gray-600">BDT</p>
                                    </div>
                                    <p className="font-semibold text-sm">{month.month}</p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Insights */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Key Insights 💡</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50">
                        <CardBody className="p-6">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">📈</span>
                                <div>
                                    <p className="font-semibold mb-1">Growing Enrollment</p>
                                    <p className="text-sm text-gray-600">
                                        +15% student enrollment this month compared to last month
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-green-50">
                        <CardBody className="p-6">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">✅</span>
                                <div>
                                    <p className="font-semibold mb-1">High Completion</p>
                                    <p className="text-sm text-gray-600">
                                        Python course has 91% completion rate - excellent engagement!
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-orange-50">
                        <CardBody className="p-6">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">⚠️</span>
                                <div>
                                    <p className="font-semibold mb-1">Needs Attention</p>
                                    <p className="text-sm text-gray-600">
                                        React course completion rate below average - consider adding more support
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
