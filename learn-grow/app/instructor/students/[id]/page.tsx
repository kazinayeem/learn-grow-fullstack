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
  FaCrown,
  FaBox,
  FaCheckDouble,
} from "react-icons/fa";
import { useGetInstructorStudentByIdQuery } from "@/redux/api/userApi";
import { useGetStudentOrdersQuery } from "@/redux/api/orderApi";
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

  // Fetch student's orders
  const { data: ordersData, isLoading: ordersLoading } = useGetStudentOrdersQuery({
    studentId,
    page: 1,
    limit: 10,
  });

  const orders = ordersData?.data || [];

  // Find active quarterly subscription
  const activeQuarterlyOrder = orders.find(
    (order: any) =>
      order.planType === "quarterly" &&
      order.paymentStatus === "approved" &&
      order.isActive &&
      new Date(order.endDate) > new Date()
  );

  // Calculate remaining time
  const calculateRemainingTime = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;

    if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ${remainingDays > 0 ? `${remainingDays} days` : ''}`;
    }
    return `${diffDays} days`;
  };
  
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

  if (!student || error) {
    return (
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-5xl">
        <Button
          startContent={<FaArrowLeft />}
          variant="light"
          onPress={() => router.push("/instructor/students")}
          className="mb-6"
        >
          Back to Students
        </Button>
        <Card>
          <CardBody className="p-12 text-center">
            <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Student Not Found</h3>
            <p className="text-gray-600 mb-4">
              {errorMessage || "Unable to load student information"}
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
                <p className="text-sm text-gray-500 mb-2">Student ID: {student._id.slice(-8)}</p>
                <Chip size="sm" variant="bordered">
                  {student.role}
                </Chip>
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

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg">Account Info</h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Verified</span>
                <Chip size="sm" color={student.isVerified ? "success" : "warning"} variant="flat">
                  {student.isVerified ? "Yes" : "No"}
                </Chip>
              </div>
              {student.googleId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Google Account</span>
                  <Chip size="sm" color="primary" variant="flat">
                    Connected
                  </Chip>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium">
                  {new Date(student.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Active Subscription Card */}
          {activeQuarterlyOrder && (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaCrown className="text-green-600 text-xl" />
                  <h3 className="font-bold text-green-900">Active Subscription</h3>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Plan Type</span>
                  <Chip size="sm" color="success" variant="solid">
                    Quarterly - Full Access
                  </Chip>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Time Remaining</span>
                  <span className="text-sm font-bold text-green-700">
                    {calculateRemainingTime(activeQuarterlyOrder.endDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">End Date</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(activeQuarterlyOrder.endDate).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Started</span>
                  <span className="text-sm text-gray-600">
                    {new Date(activeQuarterlyOrder.startDate).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </CardBody>
            </Card>
          )}
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

          {/* Orders/Purchases */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-lg">Purchase History</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <div
                      key={order._id}
                      className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-3 rounded-lg flex-shrink-0 ${
                          order.planType === "quarterly" 
                            ? "bg-green-100" 
                            : order.planType === "kit" 
                            ? "bg-amber-100" 
                            : "bg-blue-100"
                        }`}>
                          {order.planType === "quarterly" ? (
                            <FaCrown className="text-green-600 text-lg" />
                          ) : order.planType === "kit" ? (
                            <FaBox className="text-amber-600 text-lg" />
                          ) : (
                            <FaBook className="text-blue-600 text-lg" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {order.planType === "quarterly" 
                              ? "Quarterly Subscription - Full Access" 
                              : order.planType === "kit" 
                              ? "Robotics Kit Only" 
                              : order.courseId?.title || "Course Purchase"}
                          </p>
                          {order.planType === "single" && order.courseId && (
                            <p className="text-xs text-blue-600 mt-1">
                              Course: {order.courseId.title}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Transaction ID: {order.transactionId.slice(0, 12)}...
                          </p>
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span>Purchased: {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}</span>
                            {order.endDate && order.paymentStatus === "approved" && (
                              <span className="text-green-600">
                                Valid Until: {new Date(order.endDate).toLocaleDateString("en-GB")}
                              </span>
                            )}
                          </div>
                          {order.deliveryAddress && (
                            <p className="text-xs text-gray-500 mt-1">
                              📦 Delivery: {order.deliveryAddress.city}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">৳{order.price}</p>
                          <Chip
                            size="sm"
                            color={
                              order.paymentStatus === "approved"
                                ? "success"
                                : order.paymentStatus === "rejected"
                                ? "danger"
                                : "warning"
                            }
                            variant="flat"
                            className="mt-2"
                          >
                            {order.paymentStatus === "approved" ? (
                              <div className="flex items-center gap-1">
                                <FaCheckDouble className="text-xs" />
                                <span>Approved</span>
                              </div>
                            ) : order.paymentStatus === "rejected" ? (
                              "Rejected"
                            ) : (
                              "Pending"
                            )}
                          </Chip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No purchases yet</p>
                </div>
              )}
            </CardBody>
          </Card>

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
