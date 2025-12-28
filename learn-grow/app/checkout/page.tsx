"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Button,
  Divider,
} from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateOrderMutation } from "@/redux/api/orderApi";
import { useGetAllPaymentMethodsQuery } from "@/redux/api/paymentApi";
import { useGetAllCoursesQuery } from "@/redux/api/courseApi";
import { useAppSelector } from "@/redux/hooks";
import toast from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";

const PLAN_PRICES = {
  single: 3500,
  quarterly: 9999,
  kit: 4500,
  school: 0,
};

const PLAN_NAMES = {
  single: "Single Course",
  quarterly: "Quarterly Subscription",
  kit: "Robotics Kit Only",
  school: "School Partnership",
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planType = searchParams.get("plan") as "single" | "quarterly" | "kit" | "school" | null;
  const courseIdParam = searchParams.get("courseId");

  const { user } = useAppSelector((state: any) => state.user);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: paymentMethodsData } = useGetAllPaymentMethodsQuery({ page: 1, limit: 100 });
  const { data: coursesData } = useGetAllCoursesQuery({ page: 1, limit: 100 });

  const [formData, setFormData] = useState({
    courseId: courseIdParam || "",
    paymentMethodId: "",
    transactionId: "",
    senderNumber: "",
    paymentNote: "",
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    name: "",
    phone: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    if (!user) {
      toast.error("Please login to place an order");
      router.push("/login?redirect=/pricing");
      return;
    }

    if (!planType) {
      toast.error("No plan selected");
      router.push("/pricing");
      return;
    }

    if (planType === "school") {
      toast.error("Please contact us for school partnership");
      router.push("/contact");
      return;
    }
  }, [user, planType, router]);

  const selectedPaymentMethod = paymentMethodsData?.paymentMethods?.find(
    (pm: any) => pm._id === formData.paymentMethodId
  );

  const needsDeliveryAddress = planType === "quarterly" || planType === "kit";
  const needsCourseSelection = planType === "single";
  const price = planType ? PLAN_PRICES[planType] : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!planType) {
      toast.error("Invalid plan selected");
      return;
    }

    if (needsCourseSelection && !formData.courseId) {
      toast.error("Please select a course");
      return;
    }

    if (!formData.paymentMethodId || !formData.transactionId || !formData.senderNumber) {
      toast.error("Please fill in all payment details");
      return;
    }

    if (needsDeliveryAddress) {
      if (
        !deliveryAddress.name ||
        !deliveryAddress.phone ||
        !deliveryAddress.fullAddress ||
        !deliveryAddress.city ||
        !deliveryAddress.postalCode
      ) {
        toast.error("Please fill in all delivery address fields");
        return;
      }
    }

    const payload: any = {
      planType,
      paymentMethodId: formData.paymentMethodId,
      transactionId: formData.transactionId,
      senderNumber: formData.senderNumber,
      paymentNote: formData.paymentNote,
      price,
    };

    if (needsCourseSelection) {
      payload.courseId = formData.courseId;
    }

    if (needsDeliveryAddress) {
      payload.deliveryAddress = deliveryAddress;
    }

    try {
      await createOrder(payload).unwrap();
      toast.success("Order placed successfully! Waiting for admin approval.");
      router.push("/student/orders");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to place order");
    }
  };

  if (!planType) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Order Details */}
          <Card>
            <CardBody className="p-6">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="text-xl font-semibold">{PLAN_NAMES[planType]}</p>
                </div>

                {needsCourseSelection && (
                  <Select
                    label="Select Course"
                    placeholder="Choose your course"
                    selectedKeys={formData.courseId ? [formData.courseId] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setFormData({ ...formData, courseId: selected });
                    }}
                    isRequired
                    variant="bordered"
                  >
                    {coursesData?.courses?.map((course: any) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                <Divider />

                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">Total</p>
                  <p className="text-3xl font-bold text-primary">৳{price.toLocaleString()}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <FaCheckCircle className="inline text-success mr-2" />
                    Payment will be manually verified by admin
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    <FaCheckCircle className="inline text-success mr-2" />
                    Access will be granted after approval
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Right: Payment & Delivery Form */}
          <Card>
            <CardBody className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold">Payment Details</h2>

                <Select
                  label="Payment Method"
                  placeholder="Select payment method"
                  selectedKeys={formData.paymentMethodId ? [formData.paymentMethodId] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFormData({ ...formData, paymentMethodId: selected });
                  }}
                  isRequired
                  variant="bordered"
                >
                  {paymentMethodsData?.paymentMethods
                    ?.filter((pm: any) => pm.isActive)
                    .map((pm: any) => (
                      <SelectItem key={pm._id} value={pm._id}>
                        {pm.name}
                      </SelectItem>
                    ))}
                </Select>

                {selectedPaymentMethod && (
                  <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                    <p className="font-semibold">{selectedPaymentMethod.name}</p>
                    <p className="text-sm">
                      Account: <code className="bg-white px-2 py-1 rounded">{selectedPaymentMethod.accountNumber}</code>
                    </p>
                    <p className="text-sm text-gray-600">{selectedPaymentMethod.paymentNote}</p>
                  </div>
                )}

                <Input
                  label="Your Phone/Account Number"
                  placeholder="01XXXXXXXXX"
                  value={formData.senderNumber}
                  onValueChange={(val) => setFormData({ ...formData, senderNumber: val })}
                  isRequired
                  variant="bordered"
                />

                <Input
                  label="Transaction ID"
                  placeholder="TXN123456789"
                  value={formData.transactionId}
                  onValueChange={(val) => setFormData({ ...formData, transactionId: val })}
                  isRequired
                  variant="bordered"
                />

                <Input
                  label="Note (Optional)"
                  placeholder="Any additional information"
                  value={formData.paymentNote}
                  onValueChange={(val) => setFormData({ ...formData, paymentNote: val })}
                  variant="bordered"
                />

                {needsDeliveryAddress && (
                  <>
                    <Divider />
                    <h3 className="text-xl font-bold">Delivery Address</h3>

                    <Input
                      label="Full Name"
                      placeholder="Your name"
                      value={deliveryAddress.name}
                      onValueChange={(val) => setDeliveryAddress({ ...deliveryAddress, name: val })}
                      isRequired
                      variant="bordered"
                    />

                    <Input
                      label="Phone Number"
                      placeholder="01XXXXXXXXX"
                      value={deliveryAddress.phone}
                      onValueChange={(val) => setDeliveryAddress({ ...deliveryAddress, phone: val })}
                      isRequired
                      variant="bordered"
                    />

                    <Input
                      label="Full Address"
                      placeholder="House, Road, Area"
                      value={deliveryAddress.fullAddress}
                      onValueChange={(val) => setDeliveryAddress({ ...deliveryAddress, fullAddress: val })}
                      isRequired
                      variant="bordered"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        placeholder="Dhaka"
                        value={deliveryAddress.city}
                        onValueChange={(val) => setDeliveryAddress({ ...deliveryAddress, city: val })}
                        isRequired
                        variant="bordered"
                      />

                      <Input
                        label="Postal Code"
                        placeholder="1200"
                        value={deliveryAddress.postalCode}
                        onValueChange={(val) => setDeliveryAddress({ ...deliveryAddress, postalCode: val })}
                        isRequired
                        variant="bordered"
                      />
                    </div>
                  </>
                )}

                <Button type="submit" color="primary" size="lg" className="w-full" isLoading={isLoading}>
                  Place Order
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
