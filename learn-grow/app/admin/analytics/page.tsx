"use client";

import React, { useState } from "react";
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
  Skeleton,
  Button,
  Input,
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
  FaArrowLeft,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "90days">("30days");
  const { data: analyticsData, isLoading, error, refetch } = useGetAnalyticsQuery({
    dateRange: dateRange,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 rounded-lg mb-2" />
          <Skeleton className="h-6 w-96 rounded-lg" />
        </div>

        {/* Filter Buttons Skeleton */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-lg" />
          ))}
        </div>

        {/* Overview Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 rounded-lg mb-2" />
                    <Skeleton className="h-6 w-16 rounded-lg" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Revenue & Growth Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-0 pt-6 px-6">
                <Skeleton className="h-6 w-48 rounded-lg" />
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <div className="space-y-4 mt-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-6 w-full rounded-lg" />
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-0 pt-6 px-6">
                <Skeleton className="h-6 w-56 rounded-lg" />
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <Skeleton className="h-80 w-full rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Top Courses Table Skeleton */}
        <Card className="mb-8">
          <CardHeader className="pb-0 pt-6 px-6">
            <Skeleton className="h-6 w-48 rounded-lg" />
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-4 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Recent Activity Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-0 pt-6 px-6">
                <Skeleton className="h-6 w-48 rounded-lg" />
              </CardHeader>
              <CardBody className="px-6 pb-6">
                <div className="space-y-3 mt-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
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
    revenue: backendRevenue,
    growth,
    trends,
    topCourses,
    distributions,
    recentActivity,
  } = analytics;

  // Calculate actual revenue from approved orders (fix for backend showing ৳0)
  const calculateRevenue = () => {
    const approvedOrders = recentActivity?.orders?.filter((o: any) => o.paymentStatus === "approved") || [];
    const total = approvedOrders.reduce((sum: number, order: any) => sum + (order.price || 0), 0);
    
    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const currentMonthRevenue = approvedOrders
      .filter((o: any) => {
        try {
          if (!o?.createdAt) return false;
          const orderDate = new Date(o.createdAt);
          if (isNaN(orderDate.getTime())) return false;
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        } catch (e) {
          return false;
        }
      })
      .reduce((sum: number, order: any) => sum + (order.price || 0), 0);
    
    const lastMonthRevenue = approvedOrders
      .filter((o: any) => {
        try {
          if (!o?.createdAt) return false;
          const orderDate = new Date(o.createdAt);
          if (isNaN(orderDate.getTime())) return false;
          return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
        } catch (e) {
          return false;
        }
      })
      .reduce((sum: number, order: any) => sum + (order.price || 0), 0);
    
    const avgOrderValue = approvedOrders.length > 0 ? total / approvedOrders.length : 0;
    const growthRate = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2) : "0";
    
    return {
      total: total || backendRevenue?.total || 0,
      currentMonth: currentMonthRevenue || backendRevenue?.currentMonth || 0,
      lastMonth: lastMonthRevenue || backendRevenue?.lastMonth || 0,
      averageOrderValue: avgOrderValue || backendRevenue?.averageOrderValue || 0,
      growth: growthRate || backendRevenue?.growth || "0"
    };
  };

  const revenue = calculateRevenue();

  // Calculate plan type revenue from actual orders
  const calculatePlanTypeRevenue = () => {
    const approvedOrders = recentActivity?.orders?.filter((o: any) => o.paymentStatus === "approved") || [];
    
    // Plan type name mapping
    const getPlanName = (planId: string) => {
      const names: Record<string, string> = {
        'single': 'Single Course',
        'quarterly': 'Quarterly Plan',
        'kit': 'Kit Only',
        'school': 'School Plan'
      };
      return names[planId] || planId;
    };
    
    return distributions.planTypes.map((plan: any) => {
      const planRevenue = approvedOrders
        .filter((o: any) => o.planType === plan._id)
        .reduce((sum: number, order: any) => sum + (order.price || 0), 0);
      
      return {
        name: getPlanName(plan._id),
        value: plan.count || 0,
        revenue: planRevenue || plan.revenue || 0
      };
    });
  };

  const planTypeData = calculatePlanTypeRevenue();

  // Format revenue trend data with actual calculations
  const revenueTrendData = trends.revenue.map((item: any) => {
    const trendOrders = recentActivity?.orders?.filter((o: any) => {
      try {
        // Validate date before parsing
        if (!o?.createdAt) return false;
        const orderDate = new Date(o.createdAt);
        // Check if date is valid
        if (isNaN(orderDate.getTime())) return false;
        const dateStr = orderDate.toISOString().split('T')[0];
        return dateStr === item._id && o.paymentStatus === "approved";
      } catch (e) {
        console.warn("Invalid date in order:", o);
        return false;
      }
    }) || [];
    
    const trendRevenue = trendOrders.reduce((sum: number, order: any) => sum + (order.price || 0), 0);
    
    try {
      const date = new Date(item._id);
      return {
        date: isNaN(date.getTime()) ? item._id : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: trendRevenue || item.revenue,
        orders: item.orders,
      };
    } catch (e) {
      return {
        date: item._id,
        revenue: trendRevenue || item.revenue,
        orders: item.orders,
      };
    }
  });

  // Format enrollment trend data
  const enrollmentTrendData = trends.enrollments.map((item: any) => {
    try {
      const date = new Date(item._id);
      return {
        date: isNaN(date.getTime()) ? item._id : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        enrollments: item.count,
      };
    } catch (e) {
      return {
        date: item._id,
        enrollments: item.count,
      };
    }
  });

  // Format category distribution - show proper names instead of IDs
  const categoryData = distributions.categories.map((item: any) => ({
    name: item.categoryName || item._id?.slice(0, 8) || "Other",
    value: item.count,
  }));

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8">
      {/* Header with Back Button */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          className="rounded-full"
          onPress={() => router.push("/admin")}
          title="Back to Admin Dashboard"
        >
          <FaArrowLeft className="text-xl" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive platform statistics and insights</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-8 flex gap-2">
        <Button
          size="sm"
          color={dateRange === "7days" ? "primary" : "default"}
          variant={dateRange === "7days" ? "solid" : "flat"}
          onPress={() => {
            setDateRange("7days");
            refetch();
          }}
        >
          Last 7 Days
        </Button>
        <Button
          size="sm"
          color={dateRange === "30days" ? "primary" : "default"}
          variant={dateRange === "30days" ? "solid" : "flat"}
          onPress={() => {
            setDateRange("30days");
            refetch();
          }}
        >
          Last 30 Days
        </Button>
        <Button
          size="sm"
          color={dateRange === "90days" ? "primary" : "default"}
          variant={dateRange === "90days" ? "solid" : "flat"}
          onPress={() => {
            setDateRange("90days");
            refetch();
          }}
        >
          Last 90 Days
        </Button>
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
                <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-6 w-16 rounded-lg" /> : overview.totalUsers}</p>
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
                <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-6 w-16 rounded-lg" /> : overview.totalStudents}</p>
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
                <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-6 w-16 rounded-lg" /> : overview.totalInstructors}</p>
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
                <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-6 w-16 rounded-lg" /> : overview.totalCourses}</p>
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
                <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-6 w-16 rounded-lg" /> : overview.publishedCourses}</p>
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
                <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-6 w-16 rounded-lg" /> : overview.totalOrders}</p>
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
                <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-6 w-16 rounded-lg" /> : overview.totalEnrollments}</p>
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
                <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-6 w-16 rounded-lg" /> : `${overview.completionRate}%`}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Revenue & Growth Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-2 border-success-200 shadow-lg">
          <CardHeader className="pb-0 pt-6 px-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-3">
              <div className="bg-success-500 p-3 rounded-full">
                <FaDollarSign className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Revenue Overview</h3>
                <p className="text-sm text-gray-600">Financial performance metrics</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center p-3 bg-success-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Revenue:</span>
                <span className="text-3xl font-bold text-success-600">৳{revenue.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-700 font-medium">This Month:</span>
                <span className="text-xl font-bold text-gray-900">৳{revenue.currentMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-700 font-medium">Last Month:</span>
                <span className="text-xl font-semibold text-gray-700">৳{revenue.lastMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-700 font-medium">Avg Order Value:</span>
                <span className="text-xl font-semibold text-gray-700">৳{Math.round(revenue.averageOrderValue).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                <span className="text-gray-700 font-semibold">Monthly Growth:</span>
                <div className="flex items-center gap-2">
                  {parseFloat(revenue.growth) >= 0 ? (
                    <FaArrowUp className="text-success text-xl" />
                  ) : (
                    <FaArrowDown className="text-danger text-xl" />
                  )}
                  <span className={`text-2xl font-bold ${parseFloat(revenue.growth) >= 0 ? "text-success-600" : "text-danger-600"}`}>
                    {Math.abs(parseFloat(revenue.growth))}%
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-2 border-primary-200 shadow-lg">
          <CardHeader className="pb-0 pt-6 px-6 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500 p-3 rounded-full">
                <FaChartLine className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">User Growth</h3>
                <p className="text-sm text-gray-600">New user registrations</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                <span className="text-gray-700 font-medium">New Users This Month:</span>
                <span className="text-3xl font-bold text-primary-600">{growth.newUsersThisMonth}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-700 font-medium">New Users Last Month:</span>
                <span className="text-xl font-semibold text-gray-700">{growth.newUsersLastMonth}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-700 font-medium">Active Users (7 days):</span>
                <span className="text-xl font-semibold text-gray-700">{overview.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                <span className="text-gray-700 font-semibold">User Growth Rate:</span>
                <div className="flex items-center gap-2">
                  {parseFloat(growth.userGrowth) >= 0 ? (
                    <FaArrowUp className="text-success text-xl" />
                  ) : (
                    <FaArrowDown className="text-danger text-xl" />
                  )}
                  <span className={`text-2xl font-bold ${parseFloat(growth.userGrowth) >= 0 ? "text-success-600" : "text-danger-600"}`}>
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
            {categoryData && categoryData.length > 0 ? (
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
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No categories available</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Plan Type Distribution */}
        <Card className="shadow-lg">
          <CardHeader className="pb-0 pt-6 px-6 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-2">
              <FaDollarSign className="text-2xl text-purple-600" />
              <h3 className="text-xl font-bold">Subscription Plans</h3>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            {planTypeData && planTypeData.length > 0 ? (
              <div className="space-y-4 mt-4">
                {planTypeData.map((plan: any, index: number) => (
                  <div key={index} className="space-y-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Chip 
                          size="sm" 
                          color={index === 0 ? "primary" : index === 1 ? "success" : "warning"}
                          variant="flat"
                        >
                          #{index + 1}
                        </Chip>
                        <span className="font-bold text-gray-800">{plan.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 font-medium">{plan.value || 0} orders</div>
                        <div className="text-success-600 font-bold text-lg">৳{(plan.revenue || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <Progress
                      value={revenue.total > 0 ? ((plan.revenue || 0) / revenue.total) * 100 : 0}
                      color={index === 0 ? "primary" : index === 1 ? "success" : "warning"}
                      size="md"
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-600 text-right mt-1">
                      {revenue.total > 0 ? (((plan.revenue || 0) / revenue.total) * 100).toFixed(1) : 0}% of total revenue
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No subscription data available</p>
              </div>
            )}
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
            {topCourses && topCourses.length > 0 ? (
              <Table aria-label="Top courses table">
                <TableHeader>
                  <TableColumn className="text-xs">COURSE</TableColumn>
                  <TableColumn className="text-xs">CATEGORY</TableColumn>
                  <TableColumn className="text-xs">ENROLLMENTS</TableColumn>
                  <TableColumn className="text-xs">RATING</TableColumn>
                  <TableColumn className="text-xs">PRICE</TableColumn>
                </TableHeader>
                <TableBody>
                  {topCourses.map((course: any, index: number) => (
                    <TableRow key={course._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Chip size="sm" color="primary" variant="flat">
                            #{index + 1}
                          </Chip>
                          <span className="font-semibold text-sm">{course.title || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{course.categoryId?.name || course.category || "Uncategorized"}</TableCell>
                      <TableCell className="text-sm font-semibold">{course.enrollmentCount || course.studentsEnrolled || 0}</TableCell>
                      <TableCell>
                        <Chip size="sm" color="warning" variant="flat">
                          ⭐ {course.rating ? course.rating.toFixed(1) : "N/A"}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-sm font-semibold">৳{course.price || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No course data available</p>
              </div>
            )}
          </CardBody>
        </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-2xl text-primary" />
              <h3 className="text-xl font-bold">Recent Orders</h3>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            {recentActivity?.orders && recentActivity.orders.length > 0 ? (
              <div className="space-y-3 mt-4">
                {recentActivity.orders.slice(0, 5).map((order: any) => (
                  <div key={order._id} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {order.userId?.name || order.userName || "Unknown Customer"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {order.courseId?.title || (order.planType ? `${order.planType.charAt(0).toUpperCase() + order.planType.slice(1)} Plan` : "All Courses Access")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success text-lg">৳{(order.price || 0).toLocaleString()}</p>
                      <Chip
                        size="sm"
                        color={order.paymentStatus === "approved" ? "success" : order.paymentStatus === "pending" ? "warning" : "danger"}
                        variant="flat"
                        className="mt-1"
                      >
                        {order.paymentStatus || "pending"}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent orders</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader className="pb-0 pt-6 px-6">
            <div className="flex items-center gap-2">
              <FaGraduationCap className="text-2xl text-success" />
              <h3 className="text-xl font-bold">Recent Enrollments</h3>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6">
            {recentActivity?.enrollments && recentActivity.enrollments.length > 0 ? (
              <div className="space-y-3 mt-4">
                {recentActivity.enrollments.slice(0, 5).map((enrollment: any) => (
                  <div key={enrollment._id} className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {enrollment.userId?.name || enrollment.userName || "Unknown Student"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {enrollment.courseId?.title || "N/A"}
                      </p>
                    </div>
                    <Chip
                      size="sm"
                      color={enrollment.status === "completed" ? "success" : enrollment.status === "active" ? "primary" : "default"}
                      variant="flat"
                    >
                      {enrollment.status || "active"}
                    </Chip>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent enrollments</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
