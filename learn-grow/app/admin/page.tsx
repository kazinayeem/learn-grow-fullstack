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
  const { data: statsData, isLoading: statsLoading } = useGetAdminDashboardStatsQuery(undefined);
  const { data: countData } = useGetCoursesCountQuery({});
  const { data: ticketStatsData } = useGetTicketStatsQuery(undefined);

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
      icon: <FaTicketAlt className="text-2xl sm:text-3xl" />,
      iconBg: "bg-red-500",
      badge: stats.openTickets,
      href: "/admin/tickets",
    },
    {
      title: "Students",
      description: "Manage students",
      icon: <FaUserGraduate className="text-2xl sm:text-3xl" />,
      iconBg: "bg-blue-500",
      href: "/admin/students",
    },
    {
      title: "Instructors",
      description: "Review and approve instructors",
      icon: <FaChalkboardTeacher className="text-2xl sm:text-3xl" />,
      iconBg: "bg-yellow-500",
      href: "/admin/instructors",
    },
    {
      title: "Courses",
      description: "Approve and manage courses",
      icon: <FaBook className="text-2xl sm:text-3xl" />,
      iconBg: "bg-green-500",
      href: "/admin/courses",
    },
    {
      title: "Live Classes",
      description: "Manage live classes",
      icon: <FaVideo className="text-2xl sm:text-3xl" />,
      iconBg: "bg-blue-500",
      href: "/admin/live-classes",
    },
    {
      title: "Analytics",
      description: "View platform analytics",
      icon: <FaChartLine className="text-2xl sm:text-3xl" />,
      iconBg: "bg-purple-500",
      href: "/admin/analytics",
    },
    {
      title: "Team Management",
      description: "Manage team members and roles",
      icon: <FaUsers className="text-2xl sm:text-3xl" />,
      iconBg: "bg-indigo-500",
      href: "/admin/team-management",
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage and oversee the entire platform
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
        {/* Total Users Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
          <CardBody className="text-white p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 font-medium mb-1 sm:mb-2 truncate">
                  Total Users
                </p>
                <Skeleton isLoaded={!statsLoading} className="rounded-lg bg-white/20">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {stats.totalUsers}
                  </p>
                </Skeleton>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full ml-2 flex-shrink-0">
                <FaUsers className="text-xl sm:text-2xl lg:text-3xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Total Courses Card */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
          <CardBody className="text-white p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 font-medium mb-1 sm:mb-2 truncate">
                  Total Courses
                </p>
                <Skeleton isLoaded={!statsLoading} className="rounded-lg bg-white/20">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {stats.totalCourses}
                  </p>
                </Skeleton>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full ml-2 flex-shrink-0">
                <FaBook className="text-xl sm:text-2xl lg:text-3xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Instructors Card */}
        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
          <CardBody className="text-white p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 font-medium mb-1 sm:mb-2 truncate">
                  Instructors
                </p>
                <Skeleton isLoaded={!statsLoading} className="rounded-lg bg-white/20">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {stats.totalInstructors}
                  </p>
                </Skeleton>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full ml-2 flex-shrink-0">
                <FaChalkboardTeacher className="text-xl sm:text-2xl lg:text-3xl" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Open Tickets Card */}
        <Card className="bg-gradient-to-br from-red-500 to-rose-600 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
          <CardBody className="text-white p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm opacity-90 font-medium mb-1 sm:mb-2 truncate">
                  Open Tickets
                </p>
                <Skeleton isLoaded={!statsLoading} className="rounded-lg bg-white/20">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {stats.openTickets}
                  </p>
                </Skeleton>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full ml-2 flex-shrink-0">
                <FaTicketAlt className="text-xl sm:text-2xl lg:text-3xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-5 lg:mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              isPressable
              onPress={() => router.push(action.href)}
              className="bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:scale-105 cursor-pointer group"
            >
              <CardBody className="p-4 sm:p-5 lg:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`${action.iconBg} text-white p-3 sm:p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold mb-1 flex items-center gap-2 flex-wrap">
                      <span className="truncate">{action.title}</span>
                      {action.badge !== undefined && action.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0 min-h-[20px] flex items-center">
                          {action.badge}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
        {/* Recent Activity */}
        <Card className="shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <CardBody className="p-4 sm:p-5 lg:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-5">
              Recent Activity
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="bg-blue-500 text-white p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                      <Icon className="text-base sm:text-lg lg:text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                        {activity.message}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* System Status */}
        <Card className="shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <CardBody className="p-4 sm:p-5 lg:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-5">
              System Status
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-300">
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  Server Status
                </span>
                <span className="flex items-center gap-2 text-green-600 font-semibold text-sm sm:text-base">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-300">
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  Database
                </span>
                <span className="flex items-center gap-2 text-green-600 font-semibold text-sm sm:text-base">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-300">
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  Payment Gateway
                </span>
                <span className="flex items-center gap-2 text-green-600 font-semibold text-sm sm:text-base">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4">
                Pending Actions
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 sm:p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                    Course Approvals
                  </span>
                  <span className="text-orange-600 font-bold text-sm sm:text-base">
                    3
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                    Payment Requests
                  </span>
                  <span className="text-gray-600 font-bold text-sm sm:text-base">
                    0
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <span className="text-xs sm:text-sm text-gray-700 font-medium">
                    Support Tickets
                  </span>
                  <span className="text-red-600 font-bold text-sm sm:text-base">
                    {stats.openTickets}
                  </span>
                </div>
              </div>
              <Button
                color="primary"
                variant="shadow"
                className="w-full mt-4 sm:mt-5 font-semibold text-sm sm:text-base min-h-[44px] hover:scale-105 transition-transform"
                startContent={<FaClock className="text-base sm:text-lg" />}
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
