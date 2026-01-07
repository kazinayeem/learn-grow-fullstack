"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, Progress, Chip, Spinner, Button, Pagination, Select, SelectItem } from "@nextui-org/react";
import {
  FaUsers,
  FaGraduationCap,
  FaChartLine,
} from "react-icons/fa";
import { useGetInstructorCoursesQuery } from "@/redux/api/courseApi";
import { useGetInstructorStatsQuery } from "@/redux/api/userApi";

interface CourseAnalytics {
  courseId: string;
  title: string;
  students: number;
  revenue: number;
  rating: number;
}

export default function InstructorAnalyticsPage() {
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");
  const limit = parseInt(pageSize, 10);

  // Load instructor ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setInstructorId(user._id || user.id || null);
      }
      setIsHydrated(true);
    }
  }, []);

  // Reset page when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  // Fetch instructor courses with pagination
  const { data: coursesResp, isLoading } = useGetInstructorCoursesQuery(
    { instructorId: instructorId || "", page, limit },
    {
      skip: !instructorId,
    }
  );

  const { data: statsResp } = useGetInstructorStatsQuery(undefined, {
    skip: !instructorId,
  });

  const courses = Array.isArray(coursesResp?.data) ? coursesResp!.data : [];
  const totalCourses = coursesResp?.pagination?.total || 0;
  const totalPages = Math.ceil(totalCourses / limit);
  const stats = statsResp?.data || {};

  // Use stats from API for accurate totals across all courses
  const totalStudents = stats.totalStudents || 0;
  const totalRevenue = stats.totalRevenue || 0;
  
  // Calculate average rating from current page courses
  let avgRating = "0.0";
  if (courses.length > 0) {
    const coursesWithRating = courses.filter((c: any) => (c.rating || 0) > 0);
    if (coursesWithRating.length > 0) {
      avgRating = (coursesWithRating.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / coursesWithRating.length).toFixed(1);
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics & Performance 📊</h1>
        <p className="text-gray-600">Track your teaching performance and student engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Courses */}
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Courses</p>
                <p className="text-3xl font-bold mt-1">{totalCourses}</p>
                <p className="text-xs opacity-75 mt-1">courses created</p>
              </div>
              <FaGraduationCap className="text-4xl opacity-50" />
            </div>
          </CardBody>
        </Card>

        {/* Total Students (Current Page) */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Students</p>
                <p className="text-3xl font-bold mt-1">{stats.totalStudents || totalStudents}</p>
                <p className="text-xs opacity-75 mt-1">across all courses</p>
              </div>
              <FaUsers className="text-4xl opacity-50" />
            </div>
          </CardBody>
        </Card>

        {/* Average Rating */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Average Rating</p>
                <p className="text-3xl font-bold mt-1">{avgRating} ⭐</p>
                <p className="text-xs opacity-75 mt-1">course ratings</p>
              </div>
              <FaChartLine className="text-4xl opacity-50" />
            </div>
          </CardBody>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600">
          <CardBody className="text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">৳{(totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs opacity-75 mt-1">from courses</p>
              </div>
              <FaChartLine className="text-4xl opacity-50" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Course List with Pagination */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold">Course Performance</h2>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Courses per page:</label>
            <Select
              selectedKeys={[pageSize]}
              onChange={(e) => setPageSize(e.target.value)}
              className="max-w-xs"
              size="sm"
              variant="bordered"
            >
              <SelectItem key="10" value="10">10</SelectItem>
              <SelectItem key="20" value="20">20</SelectItem>
              <SelectItem key="50" value="50">50</SelectItem>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <CardBody className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </CardBody>
          </Card>
        ) : courses.length > 0 ? (
          <>
            <div className="space-y-4">
              {courses.map((course: any) => (
                <Card key={course._id} className="hover:shadow-lg transition-shadow">
                  <CardBody className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Course Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>👥 {course.enrolled || 0} students</span>
                          <span>💰 ৳{((course.price || 0) * (course.enrolled || 0)).toLocaleString()}</span>
                          <span>⭐ {course.rating || 0}</span>
                          <span className={`px-2 py-1 rounded ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {course.isPublished ? '✅ Published' : '⏸️ Draft'}
                          </span>
                        </div>
                      </div>

                      {/* Revenue Display */}
                      <div className="flex items-center gap-4">
                        <Chip
                          color={
                            (course.enrolled || 0) > 50
                              ? "success"
                              : (course.enrolled || 0) > 20
                                ? "warning"
                                : "default"
                          }
                          variant="flat"
                          size="lg"
                        >
                          {(course.enrolled || 0) > 50
                            ? "Popular"
                            : (course.enrolled || 0) > 20
                              ? "Growing"
                              : "New"}
                        </Chip>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                  showControls
                  color="primary"
                  size="lg"
                />
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardBody className="p-6 text-center text-gray-500">
              <p className="mb-2">No courses found. Create a course to see analytics.</p>
              <p className="text-xs text-gray-400">Once you create courses, analytics will appear here.</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

