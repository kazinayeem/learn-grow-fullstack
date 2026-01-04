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
  FaEdit,
  FaShoppingCart,
  FaCheckDouble,
} from "react-icons/fa";
import { useGetUserByIdQuery } from "@/redux/api/userApi";
import { useGetStudentOrdersQuery } from "@/redux/api/orderApi";

export default function AdminStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data, isLoading, error } = useGetUserByIdQuery(studentId);
  const student = data?.data;

  // Fetch student's orders
  const { data: ordersData, isLoading: ordersLoading } = useGetStudentOrdersQuery({
    studentId,
    page: 1,
    limit: 10,
  });

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

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-5xl">
        <Card>
          <CardBody className="p-12 text-center">
            <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Student not found</h3>
            <p className="text-gray-600 mb-6">
              The student you're looking for doesn't exist.
            </p>
            <Button color="primary" onPress={() => router.push("/admin/students")}>
              Back to Students
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button
          startContent={<FaArrowLeft />}
          variant="light"
          onPress={() => router.push("/admin/students")}
        >
          Back to Students
        </Button>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            startContent={<FaEdit />}
            onPress={() => router.push(`/admin/students/${studentId}/edit`)}
          >
            Edit
          </Button>
        </div>
      </div>

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
              <h3 className="font-semibold text-lg">Enrolled Courses</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="text-center py-12">
                <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No enrolled courses yet</p>
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
              </div>
            </CardBody>
          </Card>

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
              ) : ordersData?.data && ordersData.data.length > 0 ? (
                <div className="space-y-3">
                  {ordersData.data.map((order: any) => (
                    <div
                      key={order._id}
                      className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                          <FaShoppingCart className="text-blue-600 text-lg" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {order.planType === "single" ? `Course Purchase` : `${order.planType.charAt(0).toUpperCase() + order.planType.slice(1)} Plan`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Transaction ID: {order.transactionId.slice(0, 12)}...
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
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
        </div>
      </div>
    </div>
  );
}
