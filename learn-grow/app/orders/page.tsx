"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Clock, XCircle, ArrowRight, Package } from "lucide-react";
import { API_CONFIG } from "@/config/apiConfig";

interface Order {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    thumbnail?: string;
    price: number;
  } | string;
  userId: string;
  totalAmount: number;
  status: "pending" | "paid" | "confirmed" | "delivered" | "cancelled";
  paymentMethodId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  createdAt: string;
  updatedAt: string;
}

function OrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    const cookieToken = Cookies.get("accessToken");
    if (cookieToken) return cookieToken;
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login?redirect=/orders");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/orders/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const ordersData = response.data?.data || response.data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        setError(error.response?.data?.message || "Failed to load orders");
        toast.error("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
      case "confirmed":
      case "delivered":
        return <CheckCircle size={20} className="text-green-600" />;
      case "pending":
        return <Clock size={20} className="text-amber-600" />;
      case "cancelled":
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-slate-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "confirmed":
        return "Confirmed";
      case "delivered":
        return "Delivered";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "confirmed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCourseName = (course: any) => {
    if (typeof course === "object" && course?.title) {
      return course.title;
    }
    return "Course";
  };

  const getCoursePrice = (course: any) => {
    if (typeof course === "object" && course?.price) {
      return course.price;
    }
    return 0;
  };

  const getCourseThumbnail = (course: any) => {
    if (typeof course === "object" && course?.thumbnail) {
      return course.thumbnail;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Your Orders
          </h1>
          <p className="text-slate-600">
            {orders.length === 0 ? "No orders yet" : `You have ${orders.length} order(s)`}
          </p>
        </div>

        {/* Empty State */}
        {orders.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Orders Yet</h2>
            <p className="text-slate-600 mb-6">
              You haven't placed any orders. Start exploring our courses!
            </p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Browse Courses →
            </Link>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Orders Grid */}
        {orders.length > 0 && (
          <div className="space-y-4 md:space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Course Info */}
                    <div className="lg:col-span-2">
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                          {getCourseThumbnail(order.courseId) ? (
                            <Image
                              src={getCourseThumbnail(order.courseId)}
                              alt={getCourseName(order.courseId)}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-white text-2xl">
                              📚
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg mb-1">
                            {getCourseName(order.courseId)}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">
                            Order ID: {order._id.substring(0, 12)}...
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">
                        Amount
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        ৳{order.totalAmount?.toLocaleString() || "0"}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">
                        Status
                      </p>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </div>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    {order.status === "pending" && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                        <Clock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-amber-900">Awaiting Approval</p>
                          <p className="text-amber-800 text-xs mt-1">
                            Your order is pending admin approval. You'll receive an email once it's confirmed.
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === "paid" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
                        <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-green-900">Payment Confirmed</p>
                          <p className="text-green-800 text-xs mt-1">
                            Your payment has been successfully processed. Course access will be granted shortly.
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === "confirmed" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
                        <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-green-900">Order Confirmed</p>
                          <p className="text-green-800 text-xs mt-1">
                            Your order has been confirmed. You can now access the course materials.
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === "delivered" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                        <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900">Delivered</p>
                          <p className="text-blue-800 text-xs mt-1">
                            You have received and can access all course materials.
                          </p>
                        </div>
                      </div>
                    )}

                    {order.status === "cancelled" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                        <XCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-red-900">Cancelled</p>
                          <p className="text-red-800 text-xs mt-1">
                            This order has been cancelled. Please contact support for more information.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3">
                    {(order.status === "confirmed" || order.status === "delivered") && (
                      <Link
                        href={`/courses/${typeof order.courseId === "string" ? order.courseId : order.courseId?._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition"
                      >
                        Access Course
                        <ArrowRight size={16} />
                      </Link>
                    )}

                    <Link
                      href={`/help`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition"
                    >
                      Need Help?
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {orders.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              Explore More Courses
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading orders...</p>
          </div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
