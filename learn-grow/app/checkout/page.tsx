"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Button,
  Spinner,
  Divider,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

type PlanType = "single" | "quarterly" | "kit";

type PaymentMethod = {
  _id: string;
  name: string;
  accountNumber: string;
  paymentNote: string;
  isActive?: boolean;
};

type FormData = {
  fullName: string;
  phone: string;
  fullAddress: string;
  city: string;
  postalCode: string;
  paymentMethodId: string;
  senderNumber: string;
  transactionId: string;
};

type CourseData = {
  _id?: string;
  title?: string;
  price?: number;
  description?: string;
  img?: string;
  thumbnail?: string;
  level?: string;
  category?: { name?: string };
};

const PLAN_DETAILS: Record<PlanType, { title: string; price: number; requiresDelivery: boolean }> = {
  single: {
    title: "একক কোর্স | Single Course",
    price: 3500,
    requiresDelivery: false,
  },
  quarterly: {
    title: "ত্রৈমাসিক সাবস্ক্রিপশন | Quarterly + Kit",
    price: 9999,
    requiresDelivery: true,
  },
  kit: {
    title: "রোবোটিক্স কিট | Robotics Kit",
    price: 4500,
    requiresDelivery: true,
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = (searchParams.get("plan") as PlanType) || "single";
  const plan: PlanType = planParam === "quarterly" || planParam === "kit" ? planParam : "single";
  const courseId = searchParams.get("courseId") || "";

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    fullAddress: "",
    city: "",
    postalCode: "",
    paymentMethodId: "",
    senderNumber: "",
    transactionId: "",
  });

  const getAuthToken = () => {
    const cookieToken = Cookies.get("accessToken");
    if (cookieToken) return cookieToken;

    // Only access localStorage in browser
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  const getUserRole = () => {
    const roleFromCookie = Cookies.get("userRole");
    if (roleFromCookie) return roleFromCookie;

    // Only access localStorage in browser
    if (typeof window !== "undefined") {
      const roleFromStorage = localStorage.getItem("userRole");
      if (roleFromStorage) return roleFromStorage;
      try {
        const user = localStorage.getItem("user");
        if (user) {
          return (JSON.parse(user).role as string) || "";
        }
      } catch {
        // ignore parse errors and treat as missing role
      }
    }
    return "";
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/login?redirect=/checkout");
      return;
    }

    const role = getUserRole();
    if (role && role !== "student") {
      toast.error("Only students can make purchases");
      router.push("/unauthorized");
      return;
    }

    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/payment-methods");
        const methods = response.data?.data || response.data || [];
        const active = Array.isArray(methods)
          ? methods.filter((m: PaymentMethod) => m.isActive !== false)
          : [];

        console.log("Fetched payment methods:", active);
        setPaymentMethods(active);

        if (active[0]?._id) {
          console.log("Setting default payment method ID:", active[0]._id);
          setFormData((prev) => ({
            ...prev,
            paymentMethodId: prev.paymentMethodId || active[0]._id,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        toast.error("পেমেন্ট পদ্ধতি লোড করতে ব্যর্থ");
      } finally {
        setLoading(false);
      }
    };

    const fetchCourseData = async () => {
      if (!courseId || plan !== "single") return;

      try {
        const token = getAuthToken();
        const response = await axios.get(
          `http://localhost:5000/api/course/get-course/${courseId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        const course = response.data?.data || response.data;
        if (course) {
          setCourseData(course);
        }
      } catch (error: any) {
        console.error("Failed to fetch course:", error);
        if (error.response?.status === 404) {
          toast.error("কোর্স পাওয়া যায়নি | Course not found");
        } else {
          toast.error("কোর্সের তথ্য লোড করতে ব্যর্থ | Failed to load course");
        }
      }
    };

    fetchPaymentMethods();
    fetchCourseData();
  }, [router, plan, courseId]);

  const planDetails =
    plan === "single" && courseData
      ? {
        title: courseData.title || "একক কোর্স",
        price: courseData.price || PLAN_DETAILS.single.price,
        requiresDelivery: false,
      }
      : PLAN_DETAILS[plan];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (planDetails.requiresDelivery) {
      if (
        !formData.fullName ||
        !formData.phone ||
        !formData.fullAddress ||
        !formData.city ||
        !formData.postalCode
      ) {
        toast.error("Please fill all delivery details");
        return false;
      }
    }

    if (!formData.paymentMethodId || !formData.senderNumber || !formData.transactionId) {
      toast.error("Please fill all payment details");
      return false;
    }

    // Validate payment method ID is a valid MongoDB ObjectId (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(formData.paymentMethodId)) {
      toast.error("Invalid payment method selected. Please select a valid payment method.");
      console.error("Invalid paymentMethodId:", formData.paymentMethodId);
      return false;
    }

    if (formData.senderNumber.length < 10) {
      toast.error("Invalid sender number");
      return false;
    }

    if (formData.transactionId.trim().length < 3) {
      toast.error("Invalid transaction ID");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form data:", formData);
    console.log("Plan:", plan);
    console.log("Course ID:", courseId);
    console.log("Plan details:", planDetails);

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        planType: plan,
        paymentMethodId: formData.paymentMethodId,
        senderNumber: formData.senderNumber,
        transactionId: formData.transactionId,
        price: planDetails.price,
      };

      console.log("=== PREPARING PAYLOAD ===");
      console.log("Initial payload:", payload);

      if (plan === "single" && courseId) {
        payload.courseId = courseId;
        console.log("Added courseId to payload:", courseId);
      }

      if (planDetails.requiresDelivery) {
        payload.deliveryAddress = {
          name: formData.fullName,
          phone: formData.phone,
          fullAddress: formData.fullAddress,
          city: formData.city,
          postalCode: formData.postalCode,
        };
        console.log("Added delivery address to payload");
      }

      const token = getAuthToken();
      if (!token) {
        console.error("No auth token found");
        toast.error("Please login to continue");
        router.push("/login?redirect=/checkout");
        return;
      }

      console.log("=== SENDING API REQUEST ===");
      console.log("URL: http://localhost:5000/api/orders");
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("Token:", token.substring(0, 20) + "...");

      const response = await axios.post("http://localhost:5000/api/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("=== API RESPONSE ===");
      console.log("Response:", response.data);

      if (response.data?.success) {
        toast.success(response.data.message || "Order placed successfully!");

        setFormData({
          fullName: "",
          phone: "",
          fullAddress: "",
          city: "",
          postalCode: "",
          paymentMethodId: paymentMethods[0]?._id || "",
          senderNumber: "",
          transactionId: "",
        });

        setTimeout(() => {
          router.push("/student/orders");
        }, 1500);
      } else {
        console.error("API returned success: false");
        toast.error(response.data?.message || "Failed to create order");
      }
    } catch (error: any) {
      console.error("=== ORDER SUBMISSION ERROR ===");
      console.error("Error object:", error);

      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        toast.error(error.response.data?.message || "Failed to place order");
        if (error.response.status === 401) {
          router.push("/login");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("Cannot connect to server. Please check your internet connection.");
      } else {
        console.error("Error message:", error.message);
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
      console.log("=== FORM SUBMISSION ENDED ===");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  const selectedPayment = paymentMethods.find((m) => m._id === formData.paymentMethodId);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="light" onPress={() => router.back()} className="mb-4">
            ← পিছনে যান
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            অর্ডার সম্পন্ন করুন | Complete Order
          </h1>
          <p className="text-gray-600">
            {planDetails.title} - ৳{planDetails.price.toLocaleString()}
          </p>
        </div>

        {plan === "single" && courseData && (
          <Card className="mb-6">
            <CardBody className="flex flex-row gap-4 p-4">
              {courseData.img || courseData.thumbnail ? (
                <img
                  src={courseData.img || courseData.thumbnail}
                  alt={courseData.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                  {courseData.title?.[0] || "C"}
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{courseData.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {courseData.description?.replace(/<[^>]*>/g, "") || ""}
                </p>
                <div className="flex gap-2">
                  {courseData.level && (
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      {courseData.level}
                    </span>
                  )}
                  {courseData.category?.name && (
                    <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded">
                      {courseData.category.name}
                    </span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-col items-start px-6 py-4">
                <h2 className="text-2xl font-bold">অর্ডার বিস্তারিত</h2>
              </CardHeader>

              <Divider />

              <CardBody className="gap-6 p-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-center">
                  <p className="text-white text-sm mb-2">Total Amount | মোট টাকা</p>
                  <p className="text-white text-4xl md:text-5xl font-bold">
                    {planDetails.price.toLocaleString()} BDT
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {planDetails.requiresDelivery && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        ডেলিভারি ঠিকানা | Delivery Address
                      </h3>

                      <Input
                        label="সম্পূর্ণ নাম | Full Name"
                        placeholder="আপনার নাম"
                        value={formData.fullName}
                        onValueChange={(value) => handleInputChange("fullName", value)}
                        required
                        variant="bordered"
                      />

                      <Input
                        label="ফোন নম্বর | Phone Number"
                        placeholder="০১৭ XXXXXXXXX"
                        value={formData.phone}
                        onValueChange={(value) => handleInputChange("phone", value)}
                        required
                        variant="bordered"
                      />

                      <Input
                        label="সম্পূর্ণ ঠিকানা | Full Address"
                        placeholder="গলি, রাস্তা, বাড়ি নম্বর"
                        value={formData.fullAddress}
                        onValueChange={(value) => handleInputChange("fullAddress", value)}
                        required
                        variant="bordered"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="শহর | City"
                          placeholder="ঢাকা"
                          value={formData.city}
                          onValueChange={(value) => handleInputChange("city", value)}
                          required
                          variant="bordered"
                        />

                        <Input
                          label="পোস্টাল কোড | Postal Code"
                          placeholder="1234"
                          value={formData.postalCode}
                          onValueChange={(value) => handleInputChange("postalCode", value)}
                          required
                          variant="bordered"
                        />
                      </div>

                      <Divider className="my-4" />
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      পেমেন্ট পদ্ধতি নির্বাচন করুন | Select Payment Method
                    </h3>

                    {paymentMethods.length === 0 && (
                      <Card className="bg-red-50 border border-red-200">
                        <CardBody className="p-4 text-center">
                          <p className="text-red-800 font-semibold">
                            কোনো পেমেন্ট পদ্ধতি পাওয়া যায়নি
                          </p>
                          <p className="text-sm text-red-700 mt-2">
                            দয়া করে অ্যাডমিনের সাথে যোগাযোগ করুন
                          </p>
                        </CardBody>
                      </Card>
                    )}

                    {paymentMethods.length > 0 && (
                      <Select
                        label="পেমেন্ট পদ্ধতি | Payment Method"
                        placeholder="একটি পদ্ধতি বেছে নিন"
                        selectedKeys={formData.paymentMethodId ? new Set([formData.paymentMethodId]) : new Set()}
                        onSelectionChange={(keys) => {
                          const id = Array.from(keys)[0] as string;
                          console.log("Selected payment method ID:", id);
                          if (id) {
                            setFormData((prev) => ({
                              ...prev,
                              paymentMethodId: id,
                            }));
                          }
                        }}
                        variant="bordered"
                        isRequired
                      >
                        {paymentMethods.map((method) => (
                          <SelectItem key={method._id} textValue={method.name}>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">{method.name}</span>
                              <span className="text-sm text-gray-600">{method.accountNumber}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    )}

                    {selectedPayment && (
                      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                        <CardBody className="p-4 space-y-1">
                          <p className="font-semibold text-gray-900 mb-2">
                            📱 পেমেন্ট নির্দেশনা | Payment Instructions
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {selectedPayment.paymentNote}
                          </p>
                        </CardBody>
                      </Card>
                    )}

                    <Input
                      label="পাঠানোর নম্বর | Sender Number"
                      placeholder="আপনার ফোন নম্বর"
                      value={formData.senderNumber}
                      onValueChange={(value) => handleInputChange("senderNumber", value)}
                      required
                      variant="bordered"
                      description="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                    />

                    <Input
                      label="লেনদেন আইডি | Transaction ID"
                      placeholder="আপনার লেনদেন রেফারেন্স নম্বর"
                      value={formData.transactionId}
                      onValueChange={(value) => handleInputChange("transactionId", value)}
                      required
                      variant="bordered"
                      description="মোবাইল ব্যাংকিং/ট্রান্সফার আইডি"
                    />
                  </div>

                  <Card className="bg-orange-50 border border-orange-200">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-orange-600 text-xl">🔒</div>
                        <div>
                          <p className="font-semibold text-orange-900 text-sm">
                            সুরক্ষিত পেমেন্ট | Secure Payment
                          </p>
                          <p className="text-xs text-orange-800 mt-1">
                            আপনার পেমেন্ট তথ্য সম্পূর্ণ সুরক্ষিত এবং এনক্রিপ্টেড। প্রশাসক যাচাই করার পরে অ্যাক্সেস পাবেন।
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-6 text-lg font-semibold h-14 rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)",
                    }}
                  >
                    {submitting
                      ? "প্রসেসিং..."
                      : `Pay ${planDetails.price.toLocaleString()} BDT | পেমেন্ট করুন`}
                  </button>
                </form>
              </CardBody>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader className="flex flex-col items-start px-6 py-4">
                <h3 className="text-lg font-bold">অর্ডার সারসংক্ষেপ</h3>
              </CardHeader>

              <Divider />

              <CardBody className="gap-4 p-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{planDetails.title}</h4>
                  {plan === "single" && (
                    <p className="text-sm text-gray-600">একটি কোর্সের জন্য ৩ মাসের অ্যাক্সেস</p>
                  )}
                  {plan === "quarterly" && (
                    <p className="text-sm text-gray-600">
                      সমস্ত কোর্সের জন্য ৩ মাসের অ্যাক্সেস + রোবোটিক্স কিট
                    </p>
                  )}
                  {plan === "kit" && (
                    <p className="text-sm text-gray-600">শুধুমাত্র রোবোটিক্স কিট ডেলিভারি</p>
                  )}
                </div>

                <Divider />

                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>মূল্য</span>
                    <span>৳{planDetails.price.toLocaleString()}</span>
                  </div>
                  {plan === "quarterly" && (
                    <div className="flex justify-between text-gray-700">
                      <span>রোবোটিক্স কিট</span>
                      <span className="text-green-600">অন্তর্ভুক্ত</span>
                    </div>
                  )}
                </div>

                <Divider />

                <div className="flex justify-between font-bold text-lg">
                  <span>মোট</span>
                  <span className="text-primary">৳{planDetails.price.toLocaleString()}</span>
                </div>

                <Card className="bg-amber-50 border border-amber-200 mt-4">
                  <CardBody className="p-4">
                    <p className="text-sm text-amber-900 font-semibold">
                      ⏳ প্রশাসক অনুমোদনের জন্য অপেক্ষা করছে
                    </p>
                    <p className="text-xs text-amber-800 mt-2">
                      আপনার অর্ডার জমা দেওয়ার পরে, প্রশাসক এটি পর্যালোচনা করবেন এবং অনুমোদন করবেন।
                    </p>
                  </CardBody>
                </Card>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
