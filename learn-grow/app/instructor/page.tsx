"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/Auth/RequireAuth";
import {
    FaBook,
    FaUsers,
    FaChartLine,
    FaMoneyBillWave,
    FaUpload,
    FaVideo,
    FaExclamationTriangle,
    FaClipboard,
    FaFileAlt,
} from "react-icons/fa";
import { useGetInstructorCoursesQuery } from "@/redux/api/courseApi";
import { useGetInstructorStatsQuery } from "@/redux/api/userApi";

function InstructorDashboardContent() {
    const router = useRouter();
    const [isApproved, setIsApproved] = useState<boolean | null>(null);
    const [userName, setUserName] = useState<string>("");
    const [instructorId, setInstructorId] = useState<string | null>(null);

    useEffect(() => {
        // Check if instructor is approved
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserName(user.name || "Instructor");
            setInstructorId(user._id || user.id || null);
            setIsApproved(user.isApproved !== undefined ? user.isApproved : true);
        }
    }, []);

    const { data: instructorCoursesResp } = useGetInstructorCoursesQuery(instructorId as string, {
        skip: !instructorId,
    });

    const { data: statsResp } = useGetInstructorStatsQuery(undefined, {
        skip: !instructorId,
    });

    const courses = Array.isArray(instructorCoursesResp?.data) ? instructorCoursesResp!.data : [];

    const stats = useMemo(() => {
        // Use API stats if available, otherwise calculate from courses
        if (statsResp?.success && statsResp?.data) {
            const { studentEngagement, completionRate, totalRevenue, thisMonthRevenue, totalStudents, totalCourses } = statsResp.data;
            return {
                totalCourses,
                totalStudents,
                activeCourses: courses.filter((c: any) => c.isPublished).length,
                totalEarnings: totalRevenue,
                thisMonthEarnings: thisMonthRevenue,
                completionRate,
                avgRating: "0.0",
                studentEngagement,
            };
        }

        // Fallback: calculate from courses
        const totalCourses = courses.length;
        const totalStudents = courses.reduce((sum: number, c: any) => sum + (c.studentsEnrolled || c.enrolled || 0), 0);
        const totalEarnings = courses.reduce((sum: number, c: any) => sum + (c.revenue || 0), 0);
        const thisMonthEarnings = courses.reduce((sum: number, c: any) => sum + (c.revenueThisMonth || 0), 0);
        const ratedCourses = courses.filter((c) => c.rating);
        const completionRate = courses.length ? Math.round((courses.reduce((sum, c: any) => sum + (c.completionRate || 0), 0) / courses.length) || 0) : 0;

        return {
            totalCourses,
            totalStudents,
            activeCourses: courses.filter((c: any) => c.isPublished).length,
            totalEarnings,
            thisMonthEarnings,
            completionRate,
            avgRating: ratedCourses.length
                ? (ratedCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedCourses.length).toFixed(1)
                : "0.0",
            studentEngagement: completionRate,
        };
    }, [courses, statsResp]);

    const quickActions = [
        {
            title: "My Courses",
            description: "Manage your courses",
            icon: <FaBook className="text-3xl" />,
            color: "from-blue-500 to-blue-600",
            href: "/instructor/courses",
        },
        {
            title: "Quizzes",
            description: "Create and manage quizzes",
            icon: <FaClipboard className="text-3xl" />,
            color: "from-indigo-500 to-indigo-600",
            href: "/instructor/quizzes",
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
        {
            title: "My Blogs",
            description: "Create and manage blog posts",
            icon: <FaFileAlt className="text-3xl" />,
            color: "from-orange-500 to-orange-600",
            href: "/instructor/blogs",
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
            {/* Approval Status Warning */}
            {isApproved === false && (
                <Card className="mb-6 bg-yellow-50 border-2 border-yellow-400">
                    <CardBody className="p-6">
                        <div className="flex items-start gap-4">
                            <FaExclamationTriangle className="text-yellow-600 text-3xl flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-yellow-800 mb-2">
                                    Account Pending Approval ⏳
                                </h3>
                                <p className="text-yellow-700 mb-3">
                                    Your instructor account is currently under review by our administrators. 
                                    You will not be able to create courses until your account is approved.
                                </p>
                                <p className="text-sm text-yellow-600">
                                    This usually takes 24-48 hours. We will notify you once your account is approved.
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Welcome back, {userName}! 👋
                        </h1>
                        <p className="text-gray-600">Here's your teaching overview</p>
                    </div>
                    {isApproved !== null && (
                        <Chip 
                            color={isApproved ? "success" : "warning"} 
                            variant="flat"
                            size="lg"
                        >
                            {isApproved ? "✅ Approved" : "⏳ Pending Approval"}
                        </Chip>
                    )}
                </div>
            </div>

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

export default function InstructorDashboard() {
    return (
        <RequireAuth allowedRoles={["instructor"]}>
            <InstructorDashboardContent />
        </RequireAuth>
    );
}
