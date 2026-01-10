"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { API_CONFIG } from "@/config/apiConfig";
import Image from "next/image";
import Link from "next/link";
import { 
  Check,
  Lock,
  Shield,
  CreditCard,
  Smartphone,
  Banknote,
  ChevronRight
} from "lucide-react";
import { useCreateOrderMutation } from "@/redux/api/orderApi";

interface CourseData {
  _id: string;
  title: string;
  price: number;
  thumbnail?: string;
  category?: { name: string };
  level?: string;
}

interface PaymentMethod {
  _id: string;
  name: string;
  accountNumber: string;
  paymentNote: string;
  isActive?: boolean;
}

interface OrderData {
  _id: string;
  userId: string;
  courseId: string;
  totalAmount: number;
  paymentMethodId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
}

interface DeliveryAddress {
  name: string;
  phone: string;
  fullAddress: string;
  city: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const planType = (searchParams.get("plan") || "single") as "single" | "quarterly" | "kit" | "school" | "combo";
  const comboId = searchParams.get("comboId") || "";
  const [createOrder] = useCreateOrderMutation();

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [senderNumber, setSenderNumber] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    name: "",
    phone: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });
  const [existingSubscription, setExistingSubscription] = useState<any>(null);
  const [hasPurchasedCombo, setHasPurchasedCombo] = useState<boolean>(false);
  const [existingComboOrder, setExistingComboOrder] = useState<any>(null);

  // Pricing based on plan type
  const PLAN_PRICES = {
    single: courseData?.price || 3500,
    quarterly: 9999,
    kit: 4500,
    school: 0,
    combo: 0,
  };

  const planPrice = PLAN_PRICES[planType];

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
      router.push("/login?redirect=/checkout");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch course data (only for single course plan)
        if (planType === "single" && courseId) {
          const courseResponse = await axios.get(
            `${API_CONFIG.BASE_URL}/course/get-course/${courseId}`
          );
          setCourseData(courseResponse.data?.data || courseResponse.data);
        } else if (planType === "combo") {
          if (!comboId) {
            toast.error("Bundle is missing. Please reopen from the bundle page.");
            router.push("/bundle");
            return;
          }
          const comboResponse = await axios.get(
            `${API_CONFIG.BASE_URL}/combo/${comboId}`
          );
          const combo = comboResponse.data?.data || comboResponse.data;
          setCourseData({
            _id: combo._id,
            title: combo.name,
            price: combo.discountPrice || combo.price,
            thumbnail: combo.thumbnail,
          });
        } else if (planType !== "single") {
          // For non-single plans, create dummy course data
          setCourseData({
            _id: planType,
            title: planType === "quarterly" ? "ত্রৈমাসিক সাবস্ক্রিপশন - All Course Access" : planType === "kit" ? "Robotics Kit Only" : "School Partnership",
            price: PLAN_PRICES[planType],
            thumbnail: "/images/default-plan.jpg",
          });
        }

        // Fetch user profile
        const userResponse = await axios.get(
          `${API_CONFIG.BASE_URL}/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const user = userResponse.data?.data?.user;
        setUserData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
        });

        // Auto-populate delivery address with user data
        setDeliveryAddress((prev) => ({
          ...prev,
          name: user?.name || "",
          phone: user?.phone || "",
        }));

        // Check if user already has an active quarterly subscription
        if (planType === "quarterly") {
          try {
            const ordersResponse = await axios.get(
              `${API_CONFIG.BASE_URL}/orders/my`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const userOrders = ordersResponse.data?.orders || ordersResponse.data?.data || [];
            
            // Find active quarterly subscription
            const now = new Date();
            const activeSubscription = userOrders.find((order: any) => 
              order.planType === "quarterly" && 
              order.paymentStatus === "approved" &&
              order.isActive === true &&
              new Date(order.endDate) > now
            );

            if (activeSubscription) {
              setExistingSubscription(activeSubscription);
            }
          } catch (error) {
          }
        }

        // Precheck: Has user already purchased this combo?
        if (planType === "combo" && comboId) {
          try {
            const purchasesResponse = await axios.get(
              `${API_CONFIG.BASE_URL}/combo/my/purchases`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const purchases = purchasesResponse.data?.data || purchasesResponse.data?.orders || [];
            const existing = purchases.find((p: any) => p?.comboId?._id === comboId && p.paymentStatus === "approved" && p.isActive === true);
            if (existing) {
              setHasPurchasedCombo(true);
              setExistingComboOrder(existing);
            }
          } catch (error) {
          }
        }

        // Fetch payment methods
        const paymentResponse = await axios.get(
          `${API_CONFIG.BASE_URL}/payment-methods`
        );
        const methods = (paymentResponse.data?.data || paymentResponse.data || []).filter(
          (m: PaymentMethod) => m.isActive !== false
        );
        setPaymentMethods(methods);
        if (methods[0]?._id) {
          setSelectedPaymentMethod(methods[0]._id);
        }
      } catch (error) {
        toast.error("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, comboId, planType, router]);

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    // Validate delivery address for kit and quarterly plans
    if ((planType === "kit" || planType === "quarterly") && 
        (!deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.fullAddress || !deliveryAddress.city)) {
      toast.error("Please fill in delivery address");
      return;
    }

    if (!userData) {
      toast.error("Missing user data");
      return;
    }

    if (planType === "single" && !courseData) {
      toast.error("Course data not found");
      return;
    }

    const effectiveComboId = planType === "combo" ? (comboId || (courseData?._id?.length === 24 ? courseData._id : "")) : "";

    if (planType === "combo" && !effectiveComboId) {
      toast.error("Bundle ID missing. Please reopen from the bundle page.");
      return;
    }

    try {
      setSubmitting(true);

      // Validate payment details
      if (!senderNumber.trim()) {
        toast.error("Please enter the account number/mobile you sent payment from");
        setSubmitting(false);
        return;
      }

      if (!transactionId.trim()) {
        toast.error("Please enter your transaction ID");
        setSubmitting(false);
        return;
      }

      // Create order
      const orderPayload: any = {
        planType,
        paymentMethodId: selectedPaymentMethod,
        transactionId: transactionId.trim(),
        senderNumber: senderNumber.trim(),
        price: planType === "combo" ? (courseData?.price || 0) : planPrice,
      };

      // Add courseId only for single course plan
      if (planType === "single" && courseData) {
        orderPayload.courseId = courseData._id;
      }

      // Add comboId for combo plan
      if (planType === "combo") {
        orderPayload.comboId = effectiveComboId;
      }

      // Add delivery address for kit and quarterly plans
      if (planType === "kit" || planType === "quarterly") {
        orderPayload.deliveryAddress = deliveryAddress;
      }

      const res = await createOrder(orderPayload).unwrap();
      const order = (res as any)?.order || (res as any)?.data || res;
      if (order?._id) {
        // Redirect to payment processing page
        router.push(`/payment-processing?orderId=${order._id}`);
      } else {
        toast.error("Failed to create order");
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      const msg = error?.data?.message || error?.message || "Failed to create order";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
          <p className="text-slate-600 font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if ((planType === "single" && !courseData) || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">{planType === "single" ? "Course data not found" : "User data not found"}</p>
          <Link
            href="/courses"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <Link href="/courses" className="hover:text-blue-600 transition">
              Courses
            </Link>
            <ChevronRight size={16} />
            <span className="text-slate-900 font-medium">Checkout</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Complete Your Purchase <span className="text-2xl md:text-3xl">/ আপনার অর্ডার সম্পন্ন করুন</span>
          </h1>
          <p className="text-slate-600 mt-2">Secure checkout • Fast payment processing / সুরক্ষিত চেকআউট • দ্রুত পেমেন্ট প্রসেসিং</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Extension Notice */}
            {existingSubscription && planType === "quarterly" && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white rounded-full p-3 flex-shrink-0">
                    <Check size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-2">
                      🎉 Subscription Extension / সাবস্ক্রিপশন এক্সটেনশন
                    </h3>
                    <p className="text-sm text-green-800 mb-3">
                      You already have an active quarterly subscription! This purchase will extend your subscription by 3 more months.
                    </p>
                    <p className="text-sm text-green-800 mb-3">
                      আপনার ইতিমধ্যে একটি সক্রিয় ত্রৈমাসিক সাবস্ক্রিপশন আছে! এই ক্রয়টি আপনার সাবস্ক্রিপশন আরও ৩ মাস বৃদ্ধি করবে।
                    </p>
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Time Remaining / বাকি সময়:</span>
                        <span className="font-semibold text-blue-700">
                          {(() => {
                            const now = new Date();
                            const endDate = new Date(existingSubscription.endDate);
                            const diffTime = endDate.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const diffMonths = Math.floor(diffDays / 30);
                            const remainingDays = diffDays % 30;
                            
                            if (diffMonths > 0) {
                              return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ${remainingDays > 0 ? `${remainingDays} days` : ''}`;
                            }
                            return `${diffDays} days`;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Current End Date / বর্তমান শেষ তারিখ:</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(existingSubscription.endDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-green-200">
                        <span className="text-green-700 font-medium">New End Date (+ 3 months) / নতুন শেষ তারিখ:</span>
                        <span className="font-bold text-green-700">
                          {(() => {
                            const newEndDate = new Date(existingSubscription.endDate);
                            newEndDate.setMonth(newEndDate.getMonth() + 3);
                            return newEndDate.toLocaleDateString('en-GB');
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Total Time After Extension / মোট সময়:</span>
                        <span className="font-bold text-green-700">
                          {(() => {
                            const now = new Date();
                            const newEndDate = new Date(existingSubscription.endDate);
                            newEndDate.setMonth(newEndDate.getMonth() + 3);
                            const diffTime = newEndDate.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const diffMonths = Math.floor(diffDays / 30);
                            const remainingDays = diffDays % 30;
                            
                            if (diffMonths > 0) {
                              return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ${remainingDays > 0 ? `${remainingDays} days` : ''}`;
                            }
                            return `${diffDays} days`;
                          })()}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <p className="text-xs text-slate-600">
                          ✓ Your subscription will be automatically extended after payment approval
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Summary Card */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary / অর্ডার সারাংশ</h2>

                  {/* Combo precheck notice */}
                  {planType === "combo" && hasPurchasedCombo && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-900 font-semibold">
                        You already purchased this bundle. Please go to My Courses.
                      </p>
                      <div className="mt-3">
                        <Link href="/student/courses" className="inline-block px-4 py-2 bg-green-600 text-white rounded-md text-sm">
                          Go to My Courses
                        </Link>
                      </div>
                    </div>
                  )}

              {/* Course Item */}
              <div className="flex gap-4 pb-6 border-b border-slate-200">
                <div className="relative w-20 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                  {courseData?.thumbnail ? (
                    <Image
                      src={courseData.thumbnail}
                      alt={courseData?.title || "Course"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        img.src = "/logo.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
                      <span className="text-white text-2xl">📚</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm md:text-base line-clamp-2">
                    {courseData?.title}
                  </h3>
                  {courseData?.category && (
                    <p className="text-sm text-slate-600 mt-1">{courseData.category.name}</p>
                  )}
                  {courseData?.level && (
                    <p className="text-xs text-slate-500 mt-1 capitalize">
                      Level: {courseData.level}
                    </p>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">৳{(courseData?.price || planPrice).toLocaleString()}</p>
                  <p className="text-xs text-slate-600 mt-1">Qty: 1</p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 text-sm mt-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal / সাবটোটাল</span>
                  <span>৳{(courseData?.price || planPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax / ট্যাক্স (0%)</span>
                  <span>৳0</span>
                </div>
                
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg text-slate-900">
                    <span>Total Amount / মোট টাকা</span>
                    <span className="text-blue-600">৳{(courseData?.price || planPrice).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Billing Information / বিলিং তথ্য</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name / পুরো নাম
                  </label>
                  <input
                    type="text"
                    value={userData.name}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address / ইমেইল ঠিকানা
                  </label>
                  <input
                    type="email"
                    value={userData.email}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number / ফোন নম্বর
                  </label>
                  <input
                    type="tel"
                    value={userData.phone}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 cursor-not-allowed"
                  />
                </div>

                <p className="text-xs text-slate-500 mt-4">
                  Information from your profile. To change, please update your profile settings. / আপনার প্রোফাইল থেকে তথ্য। পরিবর্তন করতে প্রোফাইল আপডেট করুন।
                </p>
              </div>
            </div>

            {/* Delivery Address Card (for kit and quarterly plans) */}
            {(planType === "kit" || planType === "quarterly") && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Delivery Address / ডেলিভারি ঠিকানা</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Recipient Name / প্রাপকের নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.name || ""}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, name: e.target.value })}
                      placeholder="Enter recipient name / প্রাপকের নাম লিখুন"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number / ফোন নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={deliveryAddress.phone || ""}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                      placeholder="01XXXXXXXXX / ০১XXXXXXXXX"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Address / সম্পূর্ণ ঠিকানা <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={deliveryAddress.fullAddress || ""}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, fullAddress: e.target.value })}
                      placeholder="House/Flat, Road, Area / বাসা/ফ্ল্যাট, রোড, এলাকা"
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        City / District / শহর / জেলা <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.city || ""}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                        placeholder="e.g., Dhaka / যেমন: ঢাকা"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Postal Code / পোস্টাল কোড
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress.postalCode || ""}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                        placeholder="e.g., 1230 / যেমন: ১২৩০"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex gap-2">
                      <span className="text-blue-600 text-lg">📦</span>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {planType === "quarterly" ? "Kit Delivery Included" : "Kit Delivery"}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Your robotics kit will be delivered to this address within 3-5 business days.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Payment Method / পেমেন্ট পদ্ধতি</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Payment Method / পেমেন্ট পদ্ধতি নির্বাচন করুন
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition"
                >
                  <option value="">Choose a payment method / একটি পদ্ধতি নির্বাচন করুন</option>
                  {paymentMethods.map((method) => (
                    <option key={method._id} value={method._id}>
                      {method.name} {method.accountNumber ? `- ${method.accountNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show selected payment method details */}
              {selectedPaymentMethod && paymentMethods.find(m => m._id === selectedPaymentMethod) && (
                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    {paymentMethods.find(m => m._id === selectedPaymentMethod)?.name.toLowerCase().includes("rocket") && (
                      <CreditCard size={20} className="text-blue-600" />
                    )}
                    {paymentMethods.find(m => m._id === selectedPaymentMethod)?.name.toLowerCase().includes("bkash") && (
                      <Smartphone size={20} className="text-pink-600" />
                    )}
                    {paymentMethods.find(m => m._id === selectedPaymentMethod)?.name.toLowerCase().includes("bank") && (
                      <Banknote size={20} className="text-green-600" />
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {paymentMethods.find(m => m._id === selectedPaymentMethod)?.name}
                      </h3>
                      {paymentMethods.find(m => m._id === selectedPaymentMethod)?.accountNumber && (
                        <p className="text-sm text-slate-600">
                          Account: {paymentMethods.find(m => m._id === selectedPaymentMethod)?.accountNumber}
                        </p>
                      )}
                    </div>
                    <Check size={20} className="text-blue-600 ml-auto flex-shrink-0" />
                  </div>
                </div>
              )}

              {/* Show detailed payment note when method selected */}
              {selectedPaymentMethod && paymentMethods.find(m => m._id === selectedPaymentMethod)?.paymentNote && (
                <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full p-2 flex-shrink-0">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 mb-2 text-base">Payment Instructions / পেমেন্ট নির্দেশনা</h3>
                      <div className="text-sm text-slate-700 space-y-2 whitespace-pre-line">
                        {paymentMethods.find(m => m._id === selectedPaymentMethod)?.paymentNote}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details Card */}
            {selectedPaymentMethod && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Payment Details / পেমেন্ট বিস্তারিত</h2>
                <p className="text-sm text-slate-600 mb-6">
                  Enter the payment details from your transaction / আপনার লেনদেনের তথ্য দিন
                </p>

                <div className="space-y-4">
                  {/* Sender Number/Account Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Account/Mobile Number / অ্যাকাউন্ট/মোবাইল নম্বর *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 01700000000 / যেমন: ০১৭০০০০০০০০"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Which account/mobile did you send the payment from? / কোন নম্বর থেকে টাকা পাঠিয়েছেন?
                    </p>
                  </div>

                  {/* Transaction ID Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Transaction ID / ট্রানজেকশন আইডি *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., TXN123456789 / যেমন: TXN123456789"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Enter the transaction/reference ID from your payment / পেমেন্ট এর ট্রানজেকশন আইডি দিন
                    </p>
                  </div>
                </div>

                {/* Security Note */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                  <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Secure Payment / সুরক্ষিত পেমেন্ট</p>
                    <p className="text-xs text-blue-800">
                      Your payment information is encrypted and secure. We verify all transactions before processing. / আপনার পেমেন্ট তথ্য নিরাপদ এবং এনক্রিপ্টেড। আমরা সব লেনদেন যাচাই করি।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-blue-600 rounded"
                />
                <span className="text-sm text-slate-700">
                  I agree to the{" "}
                  <a href="/terms-of-use" className="text-blue-600 hover:underline">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy-policy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  {" / আমি শর্তাবলী এবং গোপনীয়তা নীতি মেনে নিচ্ছি"}
                </span>
              </label>
            </div>
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-6">
            {/* Price Summary Sticky */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
                <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex justify-between text-slate-700">
                    <span className="text-sm">Subtotal / সাবটোটাল</span>
                    <span className="font-semibold">৳{planPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-sm">Discount / ছাড়</span>
                    <span className="font-semibold text-green-600">৳0</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-700 font-medium">Total / মোট</span>
                    <span className="text-3xl font-bold text-blue-600">৳{planPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={hasPurchasedCombo || submitting || !agreeTerms || !selectedPaymentMethod || !senderNumber.trim() || !transactionId.trim()}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white text-lg transition flex items-center justify-center gap-2 ${
                    hasPurchasedCombo || submitting || !agreeTerms || !selectedPaymentMethod || !senderNumber.trim() || !transactionId.trim()
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing... / প্রসেস হচ্ছে...
                    </>
                  ) : (
                    <>
                      {hasPurchasedCombo ? "Already Purchased" : "Place Order / অর্ডার করুন"}
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-6">
                <h3 className="font-semibold text-slate-900 text-sm mb-4">Secure Checkout / সুরক্ষিত চেকআউট</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Lock size={18} className="text-green-600" />
                    </div>
                    <span className="text-sm text-slate-700">
                      SSL encrypted connection / SSL এনক্রিপ্টেড কনেকশন
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Shield size={18} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-slate-700">
                      Your payment is secure / আপনার পেমেন্ট নিরাপদ
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Check size={18} className="text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700">
                      PCI DSS compliant / PCI DSS অনুমোদিত
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    🔒 This is a secure page. Your information is encrypted. / এটি একটি নিরাপদ পেজ। আপনার তথ্য এনক্রিপ্টেড।
                  </p>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mt-6">
                <p className="text-sm font-medium text-blue-900 mb-2">Need Help? / সাহায্য লাগবে?</p>
                <p className="text-xs text-blue-800 mb-3">
                  Contact our support team if you have any questions / কোনো প্রশ্ন থাকলে আমাদের সাপোর্ট টিমে যোগাযোগ করুন
                </p>
                <a
                  href="/help"
                  className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  Get Support / সাপোর্ট পান →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
