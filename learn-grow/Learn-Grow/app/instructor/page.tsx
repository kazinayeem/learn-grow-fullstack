"use client";

import React from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
    FaBook,
    FaUsers,
    FaChartLine,
    FaMoneyBillWave,
    FaUpload,
    FaVideo,
} from "react-icons/fa";

export default function InstructorDashboard() {
    const router = useRouter();

    // Mock data - replace with real data from API
    const stats = {
        totalCourses: 5,
        totalStudents: 127,
        activeCourses: 3,
        totalEarnings: 45000,
        thisMonthEarnings: 12000,
        completionRate: 78,
    };

    const quickActions = [
        {
            title: "My Courses",
            description: "Manage your courses",
            icon: <FaBook className="text-3xl" />,
            color: "from-blue-500 to-blue-600",
            href: "/instructor/courses",
        },
        {
            title: "Students",
            description: "View enrolled students",
            icon: <FaUsers className="text-3xl" />,
            color: "from-green-500 to-green-600",
            href: "/instructor/students",
        },
        {
            title: "Analytics",
            description: "View performance metrics",
            icon: <FaChartLine className="text-3xl" />,
            color: "from-purple-500 to-purple-600",
            href: "/instructor/analytics",
        },
        {
            title: "Live Classes",
            description: "Schedule and manage sessions",
            icon: <FaVideo className="text-3xl" />,
            color: "from-red-500 to-red-600",
            href: "/instructor/live-classes",
        },
    ];

    const recentActivity = [
        {
            type: "enrollment",
            message: "5 new students enrolled in 'Web Development Bootcamp'",
            time: "2 hours ago",
        },
        {
            type: "completion",
            message: "3 students completed 'Python for Beginners'",
            time: "5 hours ago",
        },
        {
            type: "revenue",
            message: "Earned 3,500 BDT from course sales",
            time: "1 day ago",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Instructor Dashboard 👨‍🏫</h1>
                <p className="text-gray-600">Manage your courses and track your performance</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Courses</p>
                                <p className="text-3xl font-bold mt-1">{stats.totalCourses}</p>
                            </div>
                            <FaBook className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Students</p>
                                <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
                            </div>
                            <FaUsers className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Completion Rate</p>
                                <p className="text-3xl font-bold mt-1">{stats.completionRate}%</p>
                            </div>
                            <FaChartLine className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">This Month</p>
                                <p className="text-3xl font-bold mt-1">{stats.thisMonthEarnings.toLocaleString()} BDT</p>
                            </div>
                            <FaMoneyBillWave className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Card
                            key={action.title}
                            isPressable
                            onPress={() => router.push(action.href)}
                            className="hover:scale-105 transition-transform"
                        >
                            <CardBody className="p-6">
                                <div className={`p-4 bg-gradient-to-r ${action.color} rounded-lg mb-4 flex justify-center text-white`}>
                                    {action.icon}
                                </div>
                                <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                                <p className="text-sm text-gray-600">{action.description}</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                    <Card>
                        <CardBody className="p-6">
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                                        <div className="p-3 bg-primary-100 rounded-lg">
                                            {activity.type === "enrollment" && <FaUsers className="text-primary text-xl" />}
                                            {activity.type === "completion" && <FaChartLine className="text-green-600 text-xl" />}
                                            {activity.type === "revenue" && <FaMoneyBillWave className="text-orange-600 text-xl" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{activity.message}</p>
                                            <p className="text-sm text-gray-500">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Earnings Summary */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Earnings</h2>
                    <Card>
                        <CardBody className="p-6">
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-600 mb-2">Total Earnings</p>
                                <p className="text-4xl font-bold text-green-600">
                                    {stats.totalEarnings.toLocaleString()} BDT
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-sm text-gray-600">This Month</span>
                                    <span className="font-semibold">{stats.thisMonthEarnings.toLocaleString()} BDT</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-sm text-gray-600">Last Month</span>
                                    <span className="font-semibold">10,500 BDT</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-sm text-gray-600">Pending</span>
                                    <span className="font-semibold text-orange-600">2,000 BDT</span>
                                </div>
                            </div>
                            <Button
                                color="primary"
                                className="w-full mt-6"
                                onPress={() => router.push("/instructor/earnings")}
                            >
                                View Detailed Report
                            </Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
