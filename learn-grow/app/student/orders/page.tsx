"use client";

import React from "react";
import { Card, CardBody, Chip, Button, Divider, Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";
import { FaBoxOpen, FaClock, FaCheckCircle, FaTimes, FaShoppingBag, FaCalendarAlt } from "react-icons/fa";

const PLAN_NAMES = {
  single: "Single Course",
  quarterly: "All Access",
  kit: "Robotics Kit",
  school: "School Plan",
  combo: "Course Bundle",
};

const PLAN_ICONS = {
  single: "📚",
  quarterly: "🎓",
  kit: "🤖",
  school: "🏫",
  combo: "🧩",
};

const STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const STATUS_ICONS = {
  pending: FaClock,
  approved: FaCheckCircle,
  rejected: FaTimes,
};

export default function StudentOrdersPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const { data, isLoading, refetch } = useGetMyOrdersQuery({ page, limit: 6 });

  // Force refetch when page changes
  React.useEffect(() => {
    refetch();
  }, [page, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading orders..." />
      </div>
    );
  }

  const orders = data?.orders || [];
  const pagination = data?.pagination || { total: orders.length, page: 1, limit: 6, totalPages: 1 };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-600 mt-1">
              {pagination.total} order{pagination.total !== 1 ? 's' : ''} found
            </p>
          </div>
          <Button
            color="primary"
            size="sm"
            onPress={() => router.push("/courses")}
            startContent={<FaShoppingBag />}
          >
            Browse Courses
          </Button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardBody className="p-10 text-center">
              <FaBoxOpen className="text-5xl text-gray-300 mx-auto mb-3" />
              <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
              <p className="text-gray-600 text-sm mb-5">
                Start your learning journey today!
              </p>
              <Button color="primary" onPress={() => router.push("/courses")}>
                Browse Courses
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = STATUS_ICONS[order.paymentStatus];
              const isActive = order.isActive && order.endDate && new Date(order.endDate) > new Date();

              return (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardBody className="p-5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{PLAN_ICONS[order.planType]}</div>
                        <div>
                          <h3 className="font-bold text-lg">{PLAN_NAMES[order.planType]}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">৳{order.price.toLocaleString()}</p>
                        <Chip
                          size="sm"
                          color={STATUS_COLORS[order.paymentStatus] as any}
                          variant="flat"
                          startContent={<StatusIcon className="text-xs" />}
                        >
                          {order.paymentStatus}
                        </Chip>
                      </div>
                    </div>

                    {/* Course Info */}
                    {order.courseId && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <p className="text-xs text-blue-600 mb-1">Course</p>
                        <p className="font-semibold text-sm">{order.courseId.title}</p>
                      </div>
                    )}

                    {/* Combo Info */}
                    {order.comboId && (
                      <div className="bg-purple-50 p-3 rounded-lg mb-3">
                        <p className="text-xs text-purple-600 mb-1">Bundle</p>
                        <p className="font-semibold text-sm">{order.comboId.name}</p>
                      </div>
                    )}

                    {/* Access Period */}
                    {order.startDate && order.endDate && (
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <FaCalendarAlt className="text-xs" />
                          <span>
                            {new Date(order.startDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                            {" - "}
                            {new Date(order.endDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        {isActive && (
                          <Chip size="sm" color="success" variant="flat">
                            {Math.ceil((new Date(order.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                          </Chip>
                        )}
                      </div>
                    )}

                    {/* Delivery Address (Compact) */}
                    {order.deliveryAddress && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-xs text-gray-600 mb-1">📦 Delivery to:</p>
                        <p className="font-semibold text-sm">{order.deliveryAddress.name} • {order.deliveryAddress.phone}</p>
                        <p className="text-xs text-gray-600 mt-1">{order.deliveryAddress.city}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {order.paymentStatus === "approved" && isActive && (
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        className="w-full"
                        onPress={() => {
                          if (order.planType === "quarterly") {
                            router.push("/student");
                          } else if (order.planType === "single" && order.courseId) {
                            router.push(`/student/course/${order.courseId._id}/dashboard`);
                          } else if (order.planType === "combo") {
                            router.push("/student/my-courses");
                          }
                        }}
                      >
                        {order.planType === "quarterly" ? "Go to Dashboard" : order.planType === "combo" ? "View My Courses" : "Start Learning"}
                      </Button>
                    )}

                    {order.paymentStatus === "pending" && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
                        ⏳ Payment under review
                      </div>
                    )}

                    {order.paymentStatus === "rejected" && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800">
                        ❌ Order rejected
                        {order.paymentNote && <p className="text-xs mt-1">{order.paymentNote}</p>}
                      </div>
                    )}

                    {order.paymentStatus === "approved" && !isActive && order.endDate && (
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        className="w-full"
                        onPress={() => router.push("/courses")}
                      >
                        Renew Access
                      </Button>
                    )}
                  </CardBody>
                </Card>
              );
            })}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 flex-col">
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => setPage((prev) => Math.max(1, prev - 1))}
                  isDisabled={page <= 1}
                >
                  Previous
                </Button>
                <div className="text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  isDisabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}