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
  Skeleton,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useGetAdminDashboardStatsQuery, useGetUsersAdminQuery } from "@/redux/api/userApi";
import { useGetCoursesCountQuery } from "@/redux/api/courseApi";
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

  // Fetch lightweight dashboard stats (single optimized query)
  const { data: statsData, isLoading: statsLoading } = useGetAdminDashboardStatsQuery();
  
  // Fetch users for table display
  const { data: usersData } = useGetUsersAdminQuery({ page: 1, limit: 10 });
  const { data: countData } = useGetCoursesCountQuery({});

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalUsers = statsData?.data?.totalUsers ?? 0;
    const totalStudents = statsData?.data?.students ?? 0;
    const totalInstructors = statsData?.data?.instructors ?? 0;
    const totalCourses = countData?.data?.total ?? 0;
    const totalRevenue = statsData?.data?.totalRevenue ?? 0;
    const thisMonthRevenue = statsData?.data?.thisMonthRevenue ?? 0;

    // Format revenue in BDT
    const formatRevenue = (amount: number) => {
      if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K BDT`;
      }
      return `${amount} BDT`;
    };

    return {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      activeEnrollments: totalStudents,
      totalRevenue: formatRevenue(totalRevenue),
      thisMonthRevenue: formatRevenue(thisMonthRevenue),
      pendingApprovals: totalInstructors,
      pendingOrders: 0,
    };
  }, [statsData, countData]);

  // Get recent users for table
  const recentUsers = useMemo(() => {
    return (usersData?.data || []).slice(0, 5);
  }, [usersData]);

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
      message: `Total ${stats.totalStudents} students registered`,
      time: "Real-time data",
    },
    {
      type: "course",
      message: `${stats.totalCourses} courses available on platform`,
      time: "Real-time data",
    },
    {
      type: "revenue",
      message: `${stats.totalInstructors} instructors enrolled`,
      time: "Real-time data",
    },
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
              <div className="flex-1">
                <p className="text-sm opacity-90">Total Users</p>
                <Skeleton isLoaded={!statsLoading} className="mt-2 rounded-lg">
                  <p className="text-3xl font-bold mt-1">
                    {stats.totalUsers}
                  </p>
                </Skeleton>
              </div>
              <FaUsers className="text-4xl opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm opacity-90">Total Courses</p>
                <Skeleton isLoaded={!statsLoading} className="mt-2 rounded-lg">
                  <p className="text-3xl font-bold mt-1">
                    {stats.totalCourses}
                  </p>
                </Skeleton>
              </div>
              <FaBook className="text-4xl opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm opacity-90">Active Enrollments</p>
                <Skeleton isLoaded={!statsLoading} className="mt-2 rounded-lg">
                  <p className="text-3xl font-bold mt-1">
                    {stats.activeEnrollments}
                  </p>
                </Skeleton>
              </div>
              <FaChartLine className="text-4xl opacity-50" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm opacity-90">Total Revenue</p>
                <Skeleton isLoaded={!statsLoading} className="mt-2 rounded-lg">
                  <p className="text-3xl font-bold mt-1">
                    {stats.totalRevenue}
                  </p>
                </Skeleton>
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

      {/* Recent Users Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recent Users</h2>
        <Card>
          <CardBody className="p-6">
            {recentUsers.length > 0 ? (
              <Table aria-label="Recent users table" className="z-0">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>EMAIL</TableColumn>
                  <TableColumn>PHONE</TableColumn>
                  <TableColumn>ROLE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user: any) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          className="capitalize"
                          color={
                            user.role === "admin"
                              ? "danger"
                              : user.role === "instructor"
                              ? "warning"
                              : user.role === "guardian"
                              ? "secondary"
                              : "success"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {user.role}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          className="capitalize"
                          color={user.isVerified ? "success" : "warning"}
                          size="sm"
                          variant="flat"
                        >
                          {user.isVerified ? "Verified" : "Pending"}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500">No users found</p>
            )}
          </CardBody>
        </Card>
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
