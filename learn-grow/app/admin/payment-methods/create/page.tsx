"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Button,
  Switch,
  Chip,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCreatePaymentMethodMutation } from "@/redux/api/paymentApi";
import { FaArrowLeft, FaCreditCard, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import toast from "react-hot-toast";

export default function CreatePaymentMethodPage() {
  const router = useRouter();
  const [createPaymentMethod, { isLoading }] = useCreatePaymentMethodMutation();

  const [formData, setFormData] = useState({
    name: "bKash",
    customName: "",
    accountNumber: "",
    paymentNote: "",
    isActive: true,
  });

  const [showCustomName, setShowCustomName] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountNumber || !formData.paymentNote) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (showCustomName && !formData.customName) {
      toast.error("Please enter a custom payment name");
      return;
    }

    const submitData = {
      ...formData,
      name: showCustomName ? formData.customName : formData.name,
    };

    try {
      await createPaymentMethod(submitData).unwrap();
      toast.success("Payment method created successfully");
      router.push("/admin/payment-methods");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create payment method");
    }
  };

  const getPaymentIcon = (name: string) => {
    if (!name) return "💵";
    const lowerName = name.toLowerCase();
    if (lowerName.includes("bkash")) return "💳";
    if (lowerName.includes("nagad")) return "💰";
    if (lowerName.includes("rocket")) return "🚀";
    if (lowerName.includes("bank")) return "🏦";
    return "💵";
  };

  const currentName = showCustomName ? (formData.customName || "Custom Payment") : formData.name;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push("/admin/payment-methods")}
          className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
          size="lg"
        >
          Back to Payment Methods
        </Button>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
            <FaCreditCard className="text-3xl sm:text-4xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Add Payment Method
            </h1>
            <p className="text-sm sm:text-base text-white/90 mt-1">
              Create a new payment option for users
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="shadow-2xl border-2 border-gray-100">
        <CardBody className="p-6 sm:p-8 lg:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaCreditCard className="text-violet-500" />
                Payment Name
                <span className="text-red-500">*</span>
              </label>
              <Select
                placeholder="Select payment method"
                selectedKeys={[showCustomName ? "Other" : formData.name]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected === "Other") {
                    setShowCustomName(true);
                  } else {
                    setShowCustomName(false);
                    setFormData({ ...formData, name: selected, customName: "" });
                  }
                }}
                isRequired
                variant="bordered"
                size="lg"
                classNames={{
                  trigger: "min-h-[48px] border-2 border-gray-200 hover:border-violet-400 focus:border-violet-500 transition-all duration-300",
                }}
                description="Choose the payment gateway or bank"
              >
                <SelectItem key="bKash">💳 bKash</SelectItem>
                <SelectItem key="Nagad">💰 Nagad</SelectItem>
                <SelectItem key="Rocket">🚀 Rocket</SelectItem>
                <SelectItem key="Bank Transfer">🏦 Bank Transfer</SelectItem>
                <SelectItem key="Other">💵 Other (Custom)</SelectItem>
              </Select>
            </div>

            {/* Custom Name */}
            {showCustomName && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Custom Payment Name
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter bank name or payment method"
                  value={formData.customName}
                  onValueChange={(val) => setFormData({ ...formData, customName: val })}
                  isRequired
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-sm sm:text-base",
                    inputWrapper: "min-h-[48px] border-2 border-gray-200 hover:border-violet-400 focus-within:border-violet-500 transition-all duration-300",
                  }}
                  description="Enter the name of the payment method (e.g., Dutch Bangla Bank, City Bank)"
                />
              </div>
            )}

            {/* Account Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Account Number
                <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="01XXXXXXXXX or Bank Account Number"
                value={formData.accountNumber}
                onValueChange={(val) => setFormData({ ...formData, accountNumber: val })}
                isRequired
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-sm sm:text-base font-mono",
                  inputWrapper: "min-h-[48px] border-2 border-gray-200 hover:border-violet-400 focus-within:border-violet-500 transition-all duration-300",
                }}
                description="Mobile wallet number or bank account number"
              />
            </div>

            {/* Payment Note */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaInfoCircle className="text-violet-500" />
                Payment Instructions
                <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Send Money / Cash Out / NPSB / Bank Transfer"
                value={formData.paymentNote}
                onValueChange={(val) => setFormData({ ...formData, paymentNote: val })}
                isRequired
                variant="bordered"
                size="lg"
                minRows={4}
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "border-2 border-gray-200 hover:border-violet-400 focus-within:border-violet-500 transition-all duration-300",
                }}
                description="Instructions for users on how to complete the payment"
              />
            </div>

            {/* Active Status */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 sm:p-6 border-2 border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                    <FaCheckCircle className="text-green-500" />
                    Active Status
                  </p>
                  <p className="text-sm text-gray-600">
                    Only active payment methods will be shown to users
                  </p>
                </div>
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(val) => setFormData({ ...formData, isActive: val })}
                  size="lg"
                  color="success"
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-green-500",
                  }}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border-2 border-dashed border-violet-300 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-violet-50 to-purple-50">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-violet-900">
                <span className="text-2xl">👁️</span>
                Live Preview
              </h3>
              <Card className="shadow-lg border-2 border-violet-200">
                <CardBody className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getPaymentIcon(currentName)}</span>
                      <span className="font-bold text-lg sm:text-xl text-gray-900">
                        {currentName}
                      </span>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={formData.isActive ? "success" : "default"}
                      startContent={formData.isActive ? <FaCheckCircle /> : undefined}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </Chip>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Account Number:</p>
                    <code className="bg-white px-3 py-2 rounded-lg text-sm font-mono border border-gray-300 block">
                      {formData.accountNumber || "Not provided"}
                    </code>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                      <FaInfoCircle />
                      Instructions:
                    </p>
                    <p className="text-sm text-gray-700">
                      {formData.paymentNote || "No instructions provided"}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button
                color="primary"
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="flex-1 min-h-[48px] font-bold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                startContent={!isLoading && <FaCheckCircle />}
              >
                Create Payment Method
              </Button>
              <Button
                variant="bordered"
                size="lg"
                onPress={() => router.push("/admin/payment-methods")}
                isDisabled={isLoading}
                className="flex-1 sm:flex-initial min-h-[48px] font-semibold border-2 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
