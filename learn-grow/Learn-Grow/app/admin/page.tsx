"use client";

import React from "react";
import { Card, CardBody, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
    FaUsers,
    FaBook,
    FaChartLine,
    FaMoneyBillWave,
    FaCog,
    FaShieldAlt,
    FaBriefcase,
} from "react-icons/fa";

export default function AdminDashboard() {
    const router = useRouter();

    const stats = {
        totalUsers: 1250,
        totalStudents: 980,
        totalInstructors: 45,
        totalCourses: 125,
        activeEnrollments: 3420,
        totalRevenue: 2450000,
        thisMonthRevenue: 340000,
        pendingApprovals: 12,
    };

    const quickActions = [
        {
            title: "Manage Users",
            description: "Add, edit, or remove users",
            icon: <FaUsers className="text-3xl" />,
            color: "from-blue-500 to-blue-600",
            href: "/admin/users",
        },
        {
            title: "Manage Courses",
            description: "Approve and manage courses",
            icon: <FaBook className="text-3xl" />,
            color: "from-green-500 to-green-600",
            href: "/admin/courses",
        },
        {
            title: "Analytics",
            description: "View platform analytics",
            icon: <FaChartLine className="text-3xl" />,
            color: "from-purple-500 to-purple-600",
            href: "/admin/analytics",
        },
        {
            title: "Settings",
            description: "Configure platform settings",
            icon: <FaCog className="text-3xl" />,
            color: "from-orange-500 to-orange-600",
            href: "/admin/settings",
        },
        {
            title: "Site Content",
            description: "Manage pages, blog & team",
            icon: <FaShieldAlt className="text-3xl" />,
            color: "from-pink-500 to-pink-600",
            href: "/admin/content",
        },
        {
            title: "Manage Jobs",
            description: "Post and manage job openings",
            icon: <FaBriefcase className="text-3xl" />,
            color: "from-teal-500 to-teal-600",
            href: "/admin/jobs",
        },
    ];

    const recentActivity = [
        { type: "user", message: "15 new students registered today", time: "2 hours ago" },
        { type: "course", message: "3 new courses submitted for approval", time: "4 hours ago" },
        { type: "revenue", message: "Revenue increased by 12% this week", time: "1 day ago" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard 🛡️</h1>
                <p className="text-gray-600">Manage and oversee the entire platform</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Users</p>
                                <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                            </div>
                            <FaUsers className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600">
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

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Active Enrollments</p>
                                <p className="text-3xl font-bold mt-1">{stats.activeEnrollments}</p>
                            </div>
                            <FaChartLine className="text-4xl opacity-50" />
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
                    <CardBody className="text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Total Revenue</p>
                                <p className="text-3xl font-bold mt-1">{(stats.totalRevenue / 1000).toFixed(0)}K BDT</p>
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

            {/* Platform Overview */}
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
                                            {activity.type === "user" && <FaUsers className="text-primary text-xl" />}
                                            {activity.type === "course" && <FaBook className="text-green-600 text-xl" />}
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

                {/* System Status */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">System Status</h2>
                    <Card>
                        <CardBody className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">Server Status</span>
                                        <span className="text-green-600 text-sm">●  Online</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">Database</span>
                                        <span className="text-green-600 text-sm">●  Healthy</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">Payment Gateway</span>
                                        <span className="text-green-600 text-sm">●  Active</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="font-semibold mb-3">Pending Actions</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Course Approvals</span>
                                            <span className="font-semibold text-orange-600">{stats.pendingApprovals}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Support Tickets</span>
                                            <span className="font-semibold text-orange-600">8</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    color="primary"
                                    className="w-full mt-4"
                                    startContent={<FaShieldAlt />}
                                >
                                    View All Alerts
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
