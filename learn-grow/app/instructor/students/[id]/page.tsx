"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Skeleton,
  Divider,
  Progress,
} from "@nextui-org/react";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaBook,
  FaCheckCircle,
  FaClock,
  FaTrophy,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useGetInstructorStudentByIdQuery } from "@/redux/api/userApi";
import RequireAuth from "@/components/Auth/RequireAuth";

function InstructorStudentDetailContent() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  // Use instructor-specific endpoint to get student details
  const { data, isLoading, error } = useGetInstructorStudentByIdQuery(studentId, {
    // Only query if we have a valid ID
    skip: !studentId,
  });
  
  const student = data?.data;
  const errorMessage = error && typeof error === 'object' && 'status' in error 
    ? `Error ${error.status}: ${(error as any).data?.message || 'Failed to load'}`
    : error ? 'Failed to load student data' : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-12 w-48 mb-8 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-lg" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardBody className="p-12 text-center">
            <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Student not found</h3>
            <p className="text-gray-600 mb-6">
              {errorMessage || "The student you're looking for doesn't exist."}
            </p>
            <Button color="primary" onPress={() => router.push("/instructor/students")}>
              Back to Students
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <Button
        startContent={<FaArrowLeft />}
        variant="light"
        onPress={() => router.push("/instructor/students")}
        className="mb-6"
      >
        Back to Students
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardBody className="p-6">
              <div className="text-center">
                <Avatar
                  src={student.profileImage}
                  name={student.name}
                  className="w-32 h-32 mx-auto mb-4"
                  fallback={<FaUser className="text-4xl" />}
                />
                <h2 className="text-2xl font-bold mb-2">{student.name}</h2>
                <Chip
                  color={student.isApproved === false ? "danger" : "success"}
                  variant="flat"
                  className="mb-4"
                >
                  {student.isApproved === false ? "Not Approved" : "Active"}
                </Chip>
                <p className="text-sm text-gray-500">Student ID: {student._id.slice(-8)}</p>
              </div>
            </CardBody>
          </Card>

          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg">Contact Information</h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-gray-400 text-xl mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium break-all">{student.email}</p>
                </div>
              </div>

              {student.phone && (
                <div className="flex items-start gap-3">
                  <FaPhone className="text-gray-400 text-xl mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="text-sm font-medium">{student.phone}</p>
                  </div>
                </div>
              )}

              {student.institution && (
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-gray-400 text-xl mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Institution</p>
                    <p className="text-sm font-medium">{student.institution}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <FaCalendar className="text-gray-400 text-xl mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Joined</p>
                  <p className="text-sm font-medium">
                    {new Date(student.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Activity & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-blue-500">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FaBook className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Enrolled Courses</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-green-500">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FaCheckCircle className="text-xl text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-l-4 border-orange-500">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <FaClock className="text-xl text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Course Progress */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg">Course Progress</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="text-center py-12">
                <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No enrolled courses yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Course enrollments will appear here
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg">Recent Activity</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="text-center py-12">
                <FaClock className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500 mt-2">
                  Student activity will be tracked here
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg">Achievements</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="text-center py-12">
                <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No achievements yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Badges and certificates will appear here
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function InstructorStudentDetailPage() {
  return (
    <RequireAuth allowedRoles={["instructor"]}>
      <InstructorStudentDetailContent />
    </RequireAuth>
  );
}
