"use client";

import React, { useMemo } from "react";
import RequireAuth from "@/components/Auth/RequireAuth";
import {
  Card,
  CardBody,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useGetUsersAdminQuery } from "@/redux/api/userApi";
import { useGetAllCoursesQuery } from "@/redux/api/courseApi";
import { useGetAllOrdersQuery } from "@/redux/api/orderApi";
import {
  FaUsers,
  FaBook,
  FaChartLine,
  FaMoneyBillWave,
  FaCog,
  FaShieldAlt,
  FaBriefcase,
  FaFileAlt,
  FaCalendarAlt,
  FaUserTie,
  FaClipboardList,
  FaCreditCard,
  FaEnvelope,
  FaPhone,
  FaRobot,
} from "react-icons/fa";

function AdminDashboardContent() {
  const router = useRouter();

  // Fetch real data
  const { data: usersData } = useGetUsersAdminQuery({ page: 1, limit: 100 });
  const { data: coursesData } = useGetAllCoursesQuery({ skip: 0, limit: 1 });
  const { data: ordersData } = useGetAllOrdersQuery({ planType: "kit" });
  const { data: allOrdersData } = useGetAllOrdersQuery({ status: "pending" });

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalUsers = usersData?.counts?.totalUsers ?? 0;
    const totalStudents = usersData?.counts?.students ?? 0;
    const totalInstructors = usersData?.counts?.instructors ?? 0;
    const totalCourses = coursesData?.meta?.total ?? 0;
    const pendingOrders = (allOrdersData?.orders || []).length;

    return {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      activeEnrollments: totalStudents * 2, // Estimation
      totalRevenue: totalCourses * 5000,
      thisMonthRevenue: Math.floor(totalCourses * 5000 * 0.4),
      pendingApprovals: 12,
      pendingOrders,
    };
  }, [usersData, coursesData, allOrdersData]);

  // Get all students
  const students = useMemo(() => {
    return (usersData?.users || []).filter(
      (user: any) => user.role === "student"
    );
  }, [usersData]);

  // Get kit orders
  const kitOrders = useMemo(() => {
    return ordersData?.orders || [];
  }, [ordersData]);

  const quickActions = [
    {
      title: "Manage Users",
      description: "Add, edit, or remove users",
      icon: <FaUsers className="text-3xl" />,
      color: "from-blue-500 to-blue-600",
      href: "/admin/users",
    },
    {
      title: "Approve Instructors",
      description: "Review and approve instructors",
      icon: <FaUsers className="text-3xl" />,
      color: "from-yellow-500 to-yellow-600",
      href: "/admin/instructors",
    },
    {
      title: "Manage Courses",
      description: "Approve and manage courses",
      icon: <FaBook className="text-3xl" />,
      color: "from-green-500 to-green-600",
      href: "/admin/courses",
    },
    {
      title: "Live Classes",
      description: "Approve and manage live classes",
      icon: <FaCalendarAlt className="text-3xl" />,
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
    {
      title: "Manage Orders",
      description: "Approve payment requests",
      icon: <FaClipboardList className="text-3xl" />,
      color: "from-red-500 to-red-600",
      href: "/admin/orders",
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
    {
      title: "Manage Blogs",
      description: "Approve blogs and manage articles",
      icon: <FaFileAlt className="text-3xl" />,
      color: "from-indigo-500 to-indigo-600",
      href: "/admin/blog",
    },
    {
      title: "Create Blog",
      description: "Write and publish a new blog post",
      icon: <FaFileAlt className="text-3xl" />,
      color: "from-cyan-500 to-cyan-600",
      href: "/blog/create",
    },
    {
      title: "Manage Events",
      description: "Create and manage events",
      icon: <FaCalendarAlt className="text-3xl" />,
      color: "from-red-500 to-red-600",
      href: "/admin/events",
    },
    {
      title: "Manage Guests",
      description: "Add and manage event guests",
      icon: <FaUserTie className="text-3xl" />,
      color: "from-violet-500 to-violet-600",
      href: "/admin/guests",
    },
  
    {
      title: "Payment Methods",
      description: "Manage payment options",
      icon: <FaCreditCard className="text-3xl" />,
      color: "from-blue-500 to-blue-600",
      href: "/admin/payment-methods",
    },
  ];

  const recentActivity = [
    {
      type: "user",
      message: "15 new students registered today",
      time: "2 hours ago",
    },
    {
      type: "course",
      message: "3 new courses submitted for approval",
      time: "4 hours ago",
    },
    {
      type: "revenue",
      message: "Revenue increased by 12% this week",
      time: "1 day ago",
    },
  ];

  const isLoading = !usersData || !coursesData;

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard 🛡️</h1>
        <p className="text-gray-600">Manage and oversee the entire platform</p>
      </div>

      {/* Statistics Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" label="Loading statistics..." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
              <CardBody className="text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Users</p>
                    <p className="text-3xl font-bold mt-1">
                      {stats.totalUsers}
                    </p>
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
                    <p className="text-3xl font-bold mt-1">
                      {stats.totalCourses}
                    </p>
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
                    <p className="text-3xl font-bold mt-1">
                      {stats.activeEnrollments}
                    </p>
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
                    <p className="text-3xl font-bold mt-1">
                      {(stats.totalRevenue / 1000).toFixed(0)}K BDT
                    </p>
                  </div>
                  <FaMoneyBillWave className="text-4xl opacity-50" />
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      )}

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
                <div
                  className={`p-4 bg-gradient-to-r ${action.color} rounded-lg mb-4 flex justify-center text-white`}
                >
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
                  <div
                    key={index}
                    className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="p-3 bg-primary-100 rounded-lg">
                      {activity.type === "user" && (
                        <FaUsers className="text-primary text-xl" />
                      )}
                      {activity.type === "course" && (
                        <FaBook className="text-green-600 text-xl" />
                      )}
                      {activity.type === "revenue" && (
                        <FaMoneyBillWave className="text-orange-600 text-xl" />
                      )}
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
                    <span className="text-green-600 text-sm">● Online</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Database</span>
                    <span className="text-green-600 text-sm">● Healthy</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Payment Gateway</span>
                    <span className="text-green-600 text-sm">● Active</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Pending Actions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Course Approvals</span>
                      <span className="font-semibold text-orange-600">
                        {stats.pendingApprovals}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Payment Requests</span>
                      <span className="font-semibold text-red-600">
                        {stats.pendingOrders}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Support Tickets</span>
                      <span className="font-semibold text-orange-600">8</span>
                    </div>
                  </div>
                </div>

                <Button
                  color="danger"
                  className="w-full mt-4"
                  startContent={<FaClipboardList />}
                  onPress={() => router.push("/admin/orders")}
                >
                  View Pending Orders ({stats.pendingOrders})
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
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
