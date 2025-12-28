"use client";

import React from "react";
import { Card, CardBody, Chip, Button, Divider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useGetMyOrdersQuery } from "@/redux/api/orderApi";
import { FaBoxOpen, FaClock, FaCheckCircle, FaTimes } from "react-icons/fa";

const PLAN_NAMES = {
  single: "Single Course",
  quarterly: "Quarterly Subscription",
  kit: "Robotics Kit",
  school: "School Partnership",
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
  const { data, isLoading } = useGetMyOrdersQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading your orders...</p>
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Button color="primary" onPress={() => router.push("/pricing")}>
          Buy New Plan
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardBody className="p-12 text-center">
            <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders. Start learning today!
            </p>
            <Button color="primary" size="lg" onPress={() => router.push("/pricing")}>
              View Pricing Plans
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = STATUS_ICONS[order.paymentStatus];
            const isActive = order.isActive && order.endDate && new Date(order.endDate) > new Date();

            return (
              <Card key={order._id} className="border-2">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{PLAN_NAMES[order.planType]}</h3>
                      {order.courseId && (
                        <p className="text-gray-600">{order.courseId.title}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Order ID: <code>{order._id.slice(-8)}</code>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">৳{order.price.toLocaleString()}</p>
                      <Chip
                        color={STATUS_COLORS[order.paymentStatus] as any}
                        variant="flat"
                        className="mt-2"
                        startContent={<StatusIcon />}
                      >
                        {order.paymentStatus.toUpperCase()}
                      </Chip>
                    </div>
                  </div>

                  <Divider className="my-4" />

                  {/* Payment Details */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-semibold">{order.paymentMethodId?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-semibold">
                        <code className="bg-gray-100 px-2 py-1 rounded">{order.transactionId}</code>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {order.startDate && (
                      <div>
                        <p className="text-sm text-gray-600">Access Until</p>
                        <p className="font-semibold">
                          {new Date(order.endDate!).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <>
                      <Divider className="my-4" />
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-semibold">{order.deliveryAddress.name}</p>
                          <p className="text-sm">{order.deliveryAddress.phone}</p>
                          <p className="text-sm">{order.deliveryAddress.fullAddress}</p>
                          <p className="text-sm">
                            {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Status Messages */}
                  <div className="mt-4">
                    {order.paymentStatus === "pending" && (
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="text-yellow-800">
                          ⏳ Your payment is under review. You will receive access once the admin approves your order.
                        </p>
                      </div>
                    )}

                    {order.paymentStatus === "approved" && isActive && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="text-green-800">
                          ✅ Your order is approved! You have full access until{" "}
                          <strong>{new Date(order.endDate!).toLocaleDateString()}</strong>
                        </p>
                        <Button
                          color="success"
                          className="mt-3"
                          onPress={() => {
                            if (order.planType === "quarterly") {
                              router.push("/courses");
                            } else if (order.planType === "single" && order.courseId) {
                              router.push(`/courses/${order.courseId._id}`);
                            }
                          }}
                        >
                          Start Learning
                        </Button>
                      </div>
                    )}

                    {order.paymentStatus === "approved" && !isActive && order.endDate && (
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <p className="text-gray-800">
                          ⏰ Your subscription expired on{" "}
                          <strong>{new Date(order.endDate).toLocaleDateString()}</strong>
                        </p>
                        <Button
                          color="primary"
                          className="mt-3"
                          onPress={() => router.push("/pricing")}
                        >
                          Renew Subscription
                        </Button>
                      </div>
                    )}

                    {order.paymentStatus === "rejected" && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p className="text-red-800">
                          ❌ Your order was rejected. Please contact support or try again with correct payment details.
                        </p>
                        {order.paymentNote && (
                          <p className="text-sm text-red-700 mt-2">
                            <strong>Reason:</strong> {order.paymentNote}
                          </p>
                        )}
                      </div>
                    )}

                    {order.planType === "kit" && order.paymentStatus === "approved" && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-2">
                        <p className="text-blue-800">
                          📦 Your Robotics Kit will be delivered to the address provided within 5-7 business days.
                        </p>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
