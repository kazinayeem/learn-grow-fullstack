"use client";

import React, { useMemo } from "react";
import RequireAuth from "@/components/Auth/RequireAuth";
import {
  Card,
  CardBody,
  Button,
  Skeleton,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useGetAdminDashboardStatsQuery } from "@/redux/api/userApi";
import { useGetCoursesCountQuery } from "@/redux/api/courseApi";
import { useGetTicketStatsQuery } from "@/redux/features/ticketApi";
import {
  FaUsers,
  FaBook,
  FaChartLine,
  FaTicketAlt,
  FaChalkboardTeacher,
  FaVideo,
  FaUserGraduate,
  FaClock,
} from "react-icons/fa";

function AdminDashboardContent() {
  const router = useRouter();

  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading } = useGetAdminDashboardStatsQuery();
  const { data: countData } = useGetCoursesCountQuery({});
  const { data: ticketStatsData } = useGetTicketStatsQuery();

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalUsers = statsData?.data?.totalUsers ?? 0;
    const totalStudents = statsData?.data?.students ?? 0;
    const totalInstructors = statsData?.data?.instructors ?? 0;
    const totalCourses = countData?.data?.total ?? 0;
    const openTickets = ticketStatsData?.data?.open ?? 0;

    return {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      openTickets,
    };
  }, [statsData, countData, ticketStatsData]);

  const quickActions = [
    {
      title: "Support Tickets",
      description: "Manage support tickets",
      icon: <FaTicketAlt className="text-3xl" />,
      color: "from-red-500 to-rose-600",
      badge: stats.openTickets,
      href: "/admin/tickets",
    },
    {
      title: "Students",
      description: "Manage students",
      icon: <FaUserGraduate className="text-3xl" />,
      color: "from-blue-500 to-blue-600",
      href: "/admin/students",
    },
    {
      title: "Instructors",
      description: "Review and approve instructors",
      icon: <FaChalkboardTeacher className="text-3xl" />,
      color: "from-yellow-500 to-yellow-600",
      href: "/admin/instructors",
    },
    {
      title: "Courses",
      description: "Approve and manage courses",
      icon: <FaBook className="text-3xl" />,
      color: "from-green-500 to-green-600",
      href: "/admin/courses",
    },
    {
      title: "Live Classes",
      description: "Manage live classes",
      icon: <FaVideo className="text-3xl" />,
      color: "from-cyan-500 to-cyan-600",
      href: "/admin/live-classes",
    },
    {
      title: "Analytics",
      description: "View platform analytics",
      icon: <FaChartLine className="text-3xl" />,
      color: "from-purple-500 to-purple-600",
      href: "/admin/analytics",
    },
  ];

  const recentActivity = [
    {
      icon: FaUsers,
      message: `Total ${stats.totalStudents} students registered`,
      time: "Real-time data",
    },
    {
      icon: FaBook,
      message: `${stats.totalCourses} courses available on platform`,
      time: "Real-time data",
    },
    {
      icon: FaChalkboardTeacher,
      message: `${stats.totalInstructors} instructors enrolled`,
      time: "Real-time data",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage and oversee the entire platform</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm opacity-90 font-medium">Total Users</p>
                <Skeleton isLoaded={!statsLoading} className="mt-2 rounded-lg bg-white/20">
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                </Skeleton>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FaUsers className="text-3xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm opacity-90 font-medium">Total Courses</p>
                <Skeleton isLoaded={!statsLoading} className="mt-2 rounded-lg bg-white/20">
                  <p className="text-3xl font-bold mt-1">{stats.totalCourses}</p>
                </Skeleton>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FaBook className="text-3xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm opacity-90 font-medium">Instructors</p>
                <Skeleton isLoaded={!statsLoading} className="mt-2 rounded-lg bg-white/20">
                  <p className="text-3xl font-bold mt-1">{stats.totalInstructors}</p>
                </Skeleton>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FaChalkboardTeacher className="text-3xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-rose-600 border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm opacity-90 font-medium">Open Tickets</p>
                <Skeleton isLoaded={!statsLoading} className="mt-2 rounded-lg bg-white/20">
                  <p className="text-3xl font-bold mt-1">{stats.openTickets}</p>
                </Skeleton>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <FaTicketAlt className="text-3xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              isPressable
              onPress={() => router.push(action.href)}
              className="hover:shadow-lg transition-all border-2 border-transparent hover:border-primary-300"
            >
              <CardBody className="p-6">
                <div
                  className={`bg-gradient-to-br ${action.color} text-white p-4 rounded-lg mb-4 w-fit`}
                >
                  {action.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  {action.title}
                  {action.badge && action.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-md">
          <CardBody className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Icon className="text-xl text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* System Status */}
        <Card className="shadow-md">
          <CardBody className="p-6">
            <h2 className="text-xl font-bold mb-4">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Server Status</span>
                <span className="flex items-center gap-2 text-green-600 font-semibold">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Database</span>
                <span className="flex items-center gap-2 text-green-600 font-semibold">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Payment Gateway</span>
                <span className="flex items-center gap-2 text-green-600 font-semibold">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Active
                </span>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold mb-3">Pending Actions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Course Approvals</span>
                  <span className="text-orange-600 font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Requests</span>
                  <span className="text-orange-600 font-semibold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Support Tickets</span>
                  <span className="text-red-600 font-semibold">{stats.openTickets}</span>
                </div>
              </div>
              <Button
                color="primary"
                variant="flat"
                className="w-full mt-4"
                startContent={<FaClock />}
                onPress={() => router.push("/admin/orders")}
              >
                View Pending Orders (0)
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RequireAuth allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </RequireAuth>
  );
}
