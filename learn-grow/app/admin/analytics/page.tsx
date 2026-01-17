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
  Tabs,
  Tab,
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
  FaChartPie
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
  AreaChart, // Added for modern feel
  Area,      // Added for modern feel
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658", "#ff6b9d"];

export default function AnalyticsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "90days">("30days");
  const { data: analyticsData, isLoading, error, refetch } = useGetAnalyticsQuery(dateRange);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading analytics..." color="primary" />
      </div>
    );
  }

  if (error || !analyticsData?.data) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <Card className="border border-red-100 shadow-md">
          <CardBody className="text-center py-10">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChartLine size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Analytics Unavailable</h3>
            <p className="text-gray-500 mt-2">Failed to load analytics data. Please try again later.</p>
            <Button color="primary" variant="flat" onPress={() => router.push("/admin")} className="mt-4 max-w-xs mx-auto">
              Back to Dashboard
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const analytics = analyticsData.data;

  // Destructure existing data with safe defaults
  const {
    overview = {},
    revenue: backendRevenue = {},
    growth = {},
    trends = { revenue: [], enrollments: [] },
    topCourses: apiTopCourses = [],
    distributions = { categories: [], planTypes: [], orderStatus: [] },
    recentActivity = { orders: [], enrollments: [] },
  } = analytics || {};

  // Map the API response correctly
  // distributions.categories = category distribution data (for pie chart)
  const categoryDistributionData = distributions.categories || [];
  
  // topCourses = actual top courses list (from the topCourses field)
  const actualCourses = topCourses || [];
  
  // The API returns plan type data in recentActivity.orders, not actual order objects
  const actualOrders = recentActivity.enrollments || [];
  
  // The API returns aggregated plan types in recentActivity.orders
  const planTypeAggregated = recentActivity.orders || [];

  // --- EXISTING LOGIC PRESERVED ---

  // Calculate actual revenue from approved orders
  const calculateRevenue = () => {
    const approvedOrders = actualOrders?.filter((o: any) => o.paymentStatus === "approved") || [];
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
    const approvedOrders = actualOrders?.filter((o: any) => o.paymentStatus === "approved") || [];

    // Plan type name mapping
    const getPlanName = (planId: string) => {
      const names: Record<string, string> = {
        'single': 'Single Course',
        'quarterly': 'Quarterly Plan',
        'kit': 'Kit Only',
        'school': 'School Plan',
        'combo': 'Course Bundle'
      };
      return names[planId] || planId.charAt(0).toUpperCase() + planId.slice(1);
    };

    // Use the aggregated plan type data from API
    return (planTypeAggregated || []).map((plan: any) => {
      const planRevenue = approvedOrders
        .filter((o: any) => o.planType === plan._id)
        .reduce((sum: number, order: any) => sum + (order.price || 0), 0);

      return {
        name: getPlanName(plan._id),
        value: plan.count || 0,
        revenue: plan.revenue || planRevenue || 0
      };
    });
  };

  const planTypeData = calculatePlanTypeRevenue();

  // Format revenue trend data
  const revenueTrendData = (trends?.revenue || []).map((item: any) => {
    const trendOrders = actualOrders?.filter((o: any) => {
      try {
        if (!o?.createdAt) return false;
        const orderDate = new Date(o.createdAt);
        if (isNaN(orderDate.getTime())) return false;
        const dateStr = orderDate.toISOString().split('T')[0];
        return dateStr === item._id && o.paymentStatus === "approved";
      } catch (e) {
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
        revenue: trendRevenue || item.revenue || 0,
        orders: item.orders || item.count || 0,
      };
    } catch (e) {
      return {
        date: item._id,
        revenue: trendRevenue || item.revenue || 0,
        orders: item.orders || item.count || 0,
      };
    }
  });

  // Format enrollment trend data
  const enrollmentTrendData = (trends?.enrollments || []).map((item: any) => {
    try {
      // Handle null _id or aggregate data
      if (!item._id) {
        return {
          date: "Total",
          enrollments: item.totalEnrollments || item.count || 0,
        };
      }
      const date = new Date(item._id);
      return {
        date: isNaN(date.getTime()) ? item._id : date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        enrollments: item.count || item.totalEnrollments || 0,
      };
    } catch (e) {
      return {
        date: item._id || "Unknown",
        enrollments: item.count || item.totalEnrollments || 0,
      };
    }
  });

  // Format category distribution - API returns category data with names properly
  const categoryData = (categoryDistributionData || [])
    .filter((item: any) => {
      // Only include items with count > 0 AND valid name
      const hasCount = item.count && item.count > 0;
      const hasName = item.categoryName || item.name || item._id;
      return hasCount && hasName;
    })
    .map((item: any) => {
      // Extract category name from various possible fields
      let categoryName = "Uncategorized";
      if (item.categoryName && item.categoryName.trim()) {
        categoryName = item.categoryName;
      } else if (item.name && item.name.trim()) {
        categoryName = item.name;
      } else if (item._id && typeof item._id === 'string') {
        categoryName = item._id;
      }
      return {
        name: categoryName,
        value: item.count || 0,
      };
    });

  // Use actualCourses for top courses (from distributions.categories)
  const topCourses = actualCourses || [];

  // --- END EXISTING LOGIC ---

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* 1. Header with Gradient and Date Filter */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white opacity-5"></div>

        <div className="relative z-10">
          <Button
            variant="light"
            startContent={<FaArrowLeft />}
            onPress={() => router.push("/admin")}
            className="mb-4 text-white/90 hover:bg-white/20 min-h-[44px]"
            size="lg"
          >
            Back to Dashboard
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md shadow-inner">
                <FaChartPie className="text-3xl sm:text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-blue-100 mt-1 max-w-md">Overview of your platform's performance</p>
              </div>
            </div>

            {/* Styled Date Filter */}
            <div className="bg-white/10 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm flex gap-1">
              {(["7days", "30days", "90days"] as const).map((range) => (
                <Button
                  key={range}
                  size="sm"
                  className={`font-semibold ${dateRange === range ? "bg-white text-indigo-700 shadow-md" : "text-white hover:bg-white/10 bg-transparent"}`}
                  onPress={() => { setDateRange(range); refetch(); }}
                >
                  {range === "7days" ? "7 Days" : range === "30days" ? "30 Days" : "90 Days"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Overview Stats Grid - All 8 Metrics Preserved */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Users" value={overview.totalUsers || 0} icon={<FaUsers />} color="primary" trend={parseFloat(growth.userGrowth || "0")} />
        <StatsCard title="Students" value={overview.totalStudents || 0} icon={<FaGraduationCap />} color="success" />
        <StatsCard title="Instructors" value={overview.totalInstructors || 0} icon={<FaChalkboardTeacher />} color="secondary" />
        <StatsCard title="Total Courses" value={overview.totalCourses || 0} icon={<FaBook />} color="warning" />
        <StatsCard title="Published" value={overview.publishedCourses || 0} icon={<FaCheckCircle />} color="info" />
        <StatsCard title="Total Orders" value={overview.totalOrders || 0} icon={<FaShoppingCart />} color="danger" />
        <StatsCard title="Enrollments" value={overview.totalEnrollments || 0} icon={<FaTrophy />} color="success" />
        <StatsCard title="Completion Rate" value={`${overview.completionRate || 0}%`} icon={<FaChartLine />} color="primary" />
      </div>

      {/* 3. Revenue & User Growth Large Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Card */}
        <Card className="border border-success-100 shadow-lg group hover:shadow-xl transition-all">
          <CardHeader className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-success-100">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-lg shadow-emerald-200">
                <FaDollarSign size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Revenue Overview</h3>
                <p className="text-sm text-gray-500">Financial performance details</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="text-gray-600 font-medium">Total Lifetime</span>
                <span className="text-3xl font-extrabold text-emerald-600">৳{revenue.total.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">This Month</p>
                  <p className="text-lg font-bold text-gray-800">৳{revenue.currentMonth.toLocaleString()}</p>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Last Month</p>
                  <p className="text-lg font-bold text-gray-600">৳{revenue.lastMonth.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-gray-600 text-sm">Monthly Growth</span>
                <div className="flex items-center gap-2">
                  {parseFloat(revenue.growth) >= 0 ? (
                    <Chip size="sm" color="success" variant="flat" startContent={<FaArrowUp size={10} />}>{revenue.growth}%</Chip>
                  ) : (
                    <Chip size="sm" color="danger" variant="flat" startContent={<FaArrowDown size={10} />}>{revenue.growth}%</Chip>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* User Growth Card */}
        <Card className="border border-blue-100 shadow-lg group hover:shadow-xl transition-all">
          <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-200">
                <FaChartLine size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">User Growth</h3>
                <p className="text-sm text-gray-500">New registration metrics</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="text-gray-600 font-medium">New This Month</span>
                <span className="text-3xl font-extrabold text-blue-600">{growth.newUsersThisMonth || 0}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Last Month</p>
                  <p className="text-lg font-bold text-gray-600">{growth.newUsersLastMonth || 0}</p>
                </div>
                <div className="p-3 border border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Active (7d)</p>
                  <p className="text-lg font-bold text-gray-800">{overview.activeUsers || 0}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-gray-600 text-sm">Growth Rate</span>
                <div className="flex items-center gap-2">
                  {parseFloat(growth.userGrowth || "0") >= 0 ? (
                    <Chip size="sm" color="success" variant="flat" startContent={<FaArrowUp size={10} />}>{growth.userGrowth || "0"}%</Chip>
                  ) : (
                    <Chip size="sm" color="danger" variant="flat" startContent={<FaArrowDown size={10} />}>{growth.userGrowth || "0"}%</Chip>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 4. Charts Section - All 4 Data Points Preserved */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend - Area Chart */}
        <Card className="shadow-lg border border-gray-100">
          <CardHeader className="px-6 pt-6 pb-0">
            <h3 className="text-lg font-bold text-gray-800">Revenue Trend</h3>
          </CardHeader>
          <CardBody className="px-6 py-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '10px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (৳)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Enrollment Trend - Bar Chart */}
        <Card className="shadow-lg border border-gray-100">
          <CardHeader className="px-6 pt-6 pb-0">
            <h3 className="text-lg font-bold text-gray-800">Enrollment Trend</h3>
          </CardHeader>
          <CardBody className="px-6 py-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '10px' }} />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#10b981" radius={[4, 4, 0, 0]} name="Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Category Distribution - Pie Chart */}
        <Card className="shadow-lg border border-gray-100">
          <CardHeader className="px-6 pt-6 pb-0">
            <h3 className="text-lg font-bold text-gray-800">Course Categories</h3>
          </CardHeader>
          <CardBody className="px-6 py-4">
            <div className="h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              {categoryData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  No category data
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Plan Type Distribution - Progress Bars */}
        <Card className="shadow-lg border border-gray-100">
          <CardHeader className="px-6 pt-6 pb-0 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Subscription Plans</h3>
          </CardHeader>
          <CardBody className="px-6 py-6 overflow-y-auto">
            {planTypeData && planTypeData.length > 0 ? (
              <div className="space-y-6">
                {planTypeData.map((plan: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">{plan.name}</span>
                      <span className="font-bold text-gray-900">৳{plan.revenue.toLocaleString()}</span>
                    </div>
                    <Progress
                      value={revenue.total > 0 ? ((plan.revenue || 0) / revenue.total) * 100 : 0}
                      color={index === 0 ? "primary" : index === 1 ? "secondary" : "warning"}
                      size="md"
                      className="mb-1"
                      classNames={{ indicator: "bg-gradient-to-r from-blue-500 to-indigo-600" }}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{plan.value} orders</span>
                      <span>{revenue.total > 0 ? (((plan.revenue || 0) / revenue.total) * 100).toFixed(1) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No plan data available</div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* 5. Top Courses & Recent Activity - Tables Preserved */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="lg:col-span-2 shadow-lg border border-gray-100">
          <CardHeader className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FaTrophy className="text-amber-500 text-xl" />
              <h3 className="text-xl font-bold text-gray-800">Top Performing Courses</h3>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table aria-label="Top courses table" shadow="none" classNames={{ th: "bg-gray-50 text-gray-600" }}>
              <TableHeader>
                <TableColumn>RANK</TableColumn>
                <TableColumn>COURSE</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>STUDENTS</TableColumn>
                <TableColumn>REVENUE</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No course data available">
                {topCourses.map((course: any, index: number) => (
                  <TableRow key={course._id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <Chip size="sm" variant="flat" color={index < 3 ? "warning" : "default"}>#{index + 1}</Chip>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-800">{course.title || course.name || "Untitled Course"}</TableCell>
                    <TableCell>{course.categoryId?.name || course.category || "General"}</TableCell>
                    <TableCell className="font-bold">{course.enrollmentCount || 0}</TableCell>
                    <TableCell className="text-success font-bold">৳{((course.price || 0) * (course.enrollmentCount || 0)).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="shadow-lg border border-gray-100">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FaShoppingCart className="text-primary text-xl" />
              <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
            </div>
          </CardHeader>
          <CardBody className="px-6 py-4">
            {actualOrders && actualOrders.length > 0 ? (
              <div className="space-y-4">
                {actualOrders.slice(0, 5).map((order: any) => (
                  <div key={order._id} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{order.userId?.name || "Customer"}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{order.courseId?.title || order.planType || "Course Access"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">৳{(order.price || 0).toLocaleString()}</p>
                      <Chip size="sm" variant="dot" color={order.paymentStatus === 'approved' ? "success" : "warning"}>
                        {order.paymentStatus || 'pending'}
                      </Chip>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-6 text-gray-400">No orders yet</div>}
          </CardBody>
        </Card>

        {/* Recent Enrollments */}
        <Card className="shadow-lg border border-gray-100">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FaGraduationCap className="text-success text-xl" />
              <h3 className="text-xl font-bold text-gray-800">Recent Enrollments</h3>
            </div>
          </CardHeader>
          <CardBody className="px-6 py-4">
            {recentActivity?.enrollments && recentActivity.enrollments.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.enrollments.slice(0, 5).map((enrollment: any) => (
                  <div key={enrollment._id} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-success-50 text-success flex items-center justify-center text-xs font-bold">
                        {(enrollment.userId?.name?.[0] || "S").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{enrollment.userId?.name || "Student"}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{enrollment.courseId?.title}</p>
                      </div>
                    </div>
                    <Chip size="sm" variant="flat" color={enrollment.status === 'completed' ? "success" : "primary"}>
                      {enrollment.status || "active"}
                    </Chip>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-6 text-gray-400">No enrollments yet</div>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// Stats Card Component for simpler code
function StatsCard({ title, value, icon, color, trend }: { title: string, value: string | number, icon: React.ReactNode, color: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "default", trend?: number }) {

  const colorClasses = {
    primary: "bg-blue-50 text-blue-600",
    secondary: "bg-purple-50 text-purple-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-orange-50 text-orange-600",
    danger: "bg-red-50 text-red-600",
    info: "bg-cyan-50 text-cyan-600",
    default: "bg-gray-50 text-gray-600"
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-200">
      <CardBody className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.default}`}>
            <div className="text-xl">{icon}</div>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {trend >= 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <h4 className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">{title}</h4>
          <p className="text-2xl font-extrabold text-gray-800">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}
