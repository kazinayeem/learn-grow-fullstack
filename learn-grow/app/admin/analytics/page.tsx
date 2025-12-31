"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Chip,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useGetAnalyticsQuery } from "@/redux/api/analyticsApi";
import {
  FaUsers,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaBook,
  FaShoppingCart,
  FaDollarSign,
  FaChartLine,
  FaTrophy,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658", "#ff6b9d"];

export default function AnalyticsPage() {
  const { data: analyticsData, isLoading, error } = useGetAnalyticsQuery(undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8">
        <Card>
          <CardBody className="text-center py-10">
            <p className="text-danger">Failed to load analytics data</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const analytics = analyticsData?.data;

  if (!analytics) {
    return null;
  }

  const {
    overview,
    revenue,
    growth,
    trends,
    topCourses,
    distributions,
    recentActivity,
  } = analytics;

  // Format revenue trend data for charts
  const revenueTrendData = trends.revenue.map((item: any) => ({
    date: new Date(item._id).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: item.revenue,
    orders: item.orders,
  }));

  // Format enrollment trend data
  const enrollmentTrendData = trends.enrollments.map((item: any) => ({
    date: new Date(item._id).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    enrollments: item.count,
  }));

  // Format category distribution
  const categoryData = distributions.categories.map((item: any) => ({
    name: item._id || "Uncategorized",
    value: item.count,
  }));

  // Format plan type distribution
  const planTypeData = distributions.planTypes.map((item: any) => ({
    name: item._id === "single" ? "Single Course" : item._id === "quarterly" ? "All Access" : item._id,
    value: item.count,
    revenue: item.revenue,
  }));

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive platform statistics and insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
                <FaUsers />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{overview.totalUsers}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
                <FaGraduationCap />
              </div>
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold">{overview.totalStudents}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
                <FaChalkboardTeacher />
              </div>
              <div>
                <p className="text-sm text-gray-600">Instructors</p>
                <p className="text-2xl font-bold">{overview.totalInstructors}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
                <FaBook />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{overview.totalCourses}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
                <FaCheckCircle />
              </div>
              <div>
                <p className="text-sm text-gray-600">Published Courses</p>
                <p className="text-2xl font-bold">{overview.publishedCourses}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-pink-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
                <FaShoppingCart />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{overview.totalOrders}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-teal-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
                <FaTrophy />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enrollments</p>
                <p className="text-2xl font-bold">{overview.totalEnrollments}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500 w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl">
                <FaChartLine />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{overview.completionRate}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Revenue & Growth Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <div className="flex items-center gap-3">
              <FaDollarSign className="text-2xl text-success" />
              <div>
                <h3 className="text-xl font-bold">Revenue Overview</h3>
                <p className="text-sm text-gray-500">Financial performance metrics</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="text-2xl font-bold text-success">৳{revenue.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month:</span>
                <span className="text-xl font-semibold">৳{revenue.currentMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Month:</span>
                <span className="text-xl">৳{revenue.lastMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Order Value:</span>
                <span className="text-xl">৳{Math.round(revenue.averageOrderValue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">Monthly Growth:</span>
                <div className="flex items-center gap-2">
                  {parseFloat(revenue.growth) >= 0 ? (
                    <FaArrowUp className="text-success" />
                  ) : (
                    <FaArrowDown className="text-danger" />
                  )}
                  <span className={`text-xl font-bold ${parseFloat(revenue.growth) >= 0 ? "text-success" : "text-danger"}`}>
                    {Math.abs(parseFloat(revenue.growth))}%
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <div className="flex items-center gap-3">
              <FaChartLine className="text-2xl text-primary" />
              <div>
                <h3 className="text-xl font-bold">User Growth</h3>
                <p className="text-sm text-gray-500">New user registrations</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Users This Month:</span>
                <span className="text-2xl font-bold text-primary">{growth.newUsersThisMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Users Last Month:</span>
                <span className="text-xl">{growth.newUsersLastMonth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users (7 days):</span>
                <span className="text-xl">{overview.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">User Growth Rate:</span>
                <div className="flex items-center gap-2">
                  {parseFloat(growth.userGrowth) >= 0 ? (
                    <FaArrowUp className="text-success" />
                  ) : (
                    <FaArrowDown className="text-danger" />
                  )}
                  <span className={`text-xl font-bold ${parseFloat(growth.userGrowth) >= 0 ? "text-success" : "text-danger"}`}>
                    {Math.abs(parseFloat(growth.userGrowth))}%
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <h3 className="text-xl font-bold">Revenue Trend (Last 30 Days)</h3>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Enrollment Trend Chart */}
        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <h3 className="text-xl font-bold">Enrollment Trend (Last 30 Days)</h3>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <h3 className="text-xl font-bold">Course Categories</h3>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Plan Type Distribution */}
        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <h3 className="text-xl font-bold">Subscription Plans</h3>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-4 mt-4">
              {planTypeData.map((plan: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{plan.name}</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{plan.value} orders</div>
                      <div className="text-success font-semibold">৳{plan.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                  <Progress
                    value={(plan.revenue / revenue.total) * 100}
                    color={index === 0 ? "primary" : "secondary"}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top Performing Courses */}
      <Card className="mb-8">
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="flex items-center gap-3">
            <FaTrophy className="text-2xl text-warning" />
            <div>
              <h3 className="text-xl font-bold">Top Performing Courses</h3>
              <p className="text-sm text-gray-500">Most enrolled courses</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <Table aria-label="Top courses table">
            <TableHeader>
              <TableColumn>COURSE</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>ENROLLMENTS</TableColumn>
              <TableColumn>RATING</TableColumn>
              <TableColumn>PRICE</TableColumn>
            </TableHeader>
            <TableBody>
              {topCourses.map((course: any, index: number) => (
                <TableRow key={course._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" color="primary" variant="flat">
                        #{index + 1}
                      </Chip>
                      <span className="font-semibold">{course.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{course.category || "N/A"}</TableCell>
                  <TableCell>{course.enrollmentCount || course.studentsEnrolled || 0}</TableCell>
                  <TableCell>
                    <Chip size="sm" color="warning" variant="flat">
                      ⭐ {course.rating ? course.rating.toFixed(1) : "N/A"}
                    </Chip>
                  </TableCell>
                  <TableCell>৳{course.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <h3 className="text-xl font-bold">Recent Orders</h3>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-3 mt-4">
              {recentActivity.orders.slice(0, 5).map((order: any) => (
                <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{order.userId?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-600">{order.courseId?.title || order.planType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success">৳{order.amount}</p>
                    <Chip
                      size="sm"
                      color={order.paymentStatus === "approved" ? "success" : "warning"}
                      variant="flat"
                    >
                      {order.paymentStatus}
                    </Chip>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <h3 className="text-xl font-bold">Recent Enrollments</h3>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-3 mt-4">
              {recentActivity.enrollments.slice(0, 5).map((enrollment: any) => (
                <div key={enrollment._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{enrollment.userId?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-600">{enrollment.courseId?.title || "N/A"}</p>
                  </div>
                  <Chip
                    size="sm"
                    color={enrollment.status === "completed" ? "success" : "primary"}
                    variant="flat"
                  >
                    {enrollment.status || "active"}
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
