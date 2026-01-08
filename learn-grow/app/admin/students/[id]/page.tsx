"use client";

import React, { useState } from "react";
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
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
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
  FaPlus,
  FaCrown,
  FaBox,
} from "react-icons/fa";
import { useGetUserByIdQuery } from "@/redux/api/userApi";
import { useGetStudentOrdersQuery } from "@/redux/api/orderApi";
import axios from "axios";
import { API_CONFIG } from "@/config/apiConfig";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

export default function AdminStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [extensionMonths, setExtensionMonths] = useState(3);
  const [extensionDays, setExtensionDays] = useState(10);
  const [extensionType, setExtensionType] = useState<"monthly" | "daily">("monthly");
  const [selectedOrderIdForDays, setSelectedOrderIdForDays] = useState<string | null>(null);
  const [extending, setExtending] = useState(false);

  const { data, isLoading, error, refetch } = useGetUserByIdQuery(studentId);
  const student = data?.data;

  // Fetch student's orders
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useGetStudentOrdersQuery({
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

  // Find single-course orders that are approved
  const approvedSingleCourseOrders = orders.filter(
    (order: any) =>
      order.planType === "single" &&
      order.paymentStatus === "approved" &&
      order.isActive &&
      order.courseId &&
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

  // Handle extension
  const handleExtendSubscription = async () => {
    try {
      setExtending(true);
      const token = Cookies.get("accessToken");
      
      if (extensionType === "monthly" && activeQuarterlyOrder) {
        await axios.patch(
          `${API_CONFIG.BASE_URL}/orders/${activeQuarterlyOrder._id}/extend`,
          { months: extensionMonths },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Subscription extended by ${extensionMonths} month(s)`);
      } else if (extensionType === "daily" && selectedOrderIdForDays) {
        await axios.patch(
          `${API_CONFIG.BASE_URL}/orders/${selectedOrderIdForDays}/extend-days`,
          { days: extensionDays },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Access extended by ${extensionDays} day(s)`);
      }

      refetchOrders();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to extend subscription");
    } finally {
      setExtending(false);
    }
  };

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

          {/* Active Subscription Card */}
          {activeQuarterlyOrder && (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaCrown className="text-green-600 text-xl" />
                  <h3 className="font-bold text-green-900">Active Subscription</h3>
                </div>
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  startContent={<FaPlus />}
                  onPress={() => {
                    setExtensionType("monthly");
                    setSelectedOrderIdForDays(null);
                    onOpen();
                  }}
                >
                  Extend
                </Button>
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

          {/* Single-Course Subscriptions */}
          {approvedSingleCourseOrders.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-gray-800">Single-Course Access</h3>
              {approvedSingleCourseOrders.map((order: any) => (
                <Card key={order._id} className="border-l-4 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardBody className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{order.courseId?.title || "Course"}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Expires: {new Date(order.endDate).toLocaleDateString("en-GB")}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {calculateRemainingTime(order.endDate)} remaining
                        </p>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<FaPlus />}
                        onPress={() => {
                          setExtensionType("daily");
                          setSelectedOrderIdForDays(order._id);
                          onOpen();
                        }}
                      >
                        Extend
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
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
        </div>
      </div>

      {/* Extension Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {extensionType === "monthly" ? (
            <>
              <ModalHeader>Extend Quarterly Subscription</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Extend the student's quarterly subscription by adding more months to their current end date.
                  </p>
                  {activeQuarterlyOrder && (
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current End Date:</span>
                        <span className="font-semibold">
                          {new Date(activeQuarterlyOrder.endDate).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">New End Date:</span>
                        <span className="font-bold text-green-700">
                          {(() => {
                            const newDate = new Date(activeQuarterlyOrder.endDate);
                            newDate.setMonth(newDate.getMonth() + extensionMonths);
                            return newDate.toLocaleDateString("en-GB");
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                  <Input
                    type="number"
                    label="Months to Add"
                    placeholder="Enter number of months"
                    value={String(extensionMonths)}
                    onChange={(e) => setExtensionMonths(Number(e.target.value) || 1)}
                    min={1}
                    max={12}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  onPress={handleExtendSubscription}
                  isLoading={extending}
                >
                  Extend by {extensionMonths} Month{extensionMonths > 1 ? 's' : ''}
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>Extend Single-Course Access</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Extend the student's course access by adding more days.
                  </p>
                  {selectedOrderIdForDays && approvedSingleCourseOrders.find((o: any) => o._id === selectedOrderIdForDays) && (
                    <>
                      {(() => {
                        const selectedOrder = approvedSingleCourseOrders.find((o: any) => o._id === selectedOrderIdForDays);
                        return (
                          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                              {selectedOrder.courseId?.title || "Course"}
                            </p>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Current End Date:</span>
                              <span className="font-semibold">
                                {new Date(selectedOrder.endDate).toLocaleDateString("en-GB")}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-green-700">New End Date:</span>
                              <span className="font-bold text-green-700">
                                {(() => {
                                  const newDate = new Date(selectedOrder.endDate);
                                  newDate.setDate(newDate.getDate() + extensionDays);
                                  return newDate.toLocaleDateString("en-GB");
                                })()}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Quick Options</label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={extensionDays === 10 ? "solid" : "bordered"}
                            color={extensionDays === 10 ? "primary" : "default"}
                            onPress={() => setExtensionDays(10)}
                          >
                            10 Days
                          </Button>
                          <Button
                            size="sm"
                            variant={extensionDays === 20 ? "solid" : "bordered"}
                            color={extensionDays === 20 ? "primary" : "default"}
                            onPress={() => setExtensionDays(20)}
                          >
                            20 Days
                          </Button>
                        </div>
                      </div>
                      <Input
                        type="number"
                        label="Days to Add"
                        placeholder="Enter number of days"
                        value={String(extensionDays)}
                        onChange={(e) => setExtensionDays(Number(e.target.value) || 1)}
                        min={1}
                        max={365}
                      />
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="success"
                  onPress={handleExtendSubscription}
                  isLoading={extending}
                >
                  Extend by {extensionDays} Day{extensionDays > 1 ? 's' : ''}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
