"use client";

import React, { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Card,
    CardBody,
    Divider,
    Checkbox,
} from "@nextui-org/react";
import { useDispatch } from "react-redux";
import { initiatePayment } from "@/redux/slices/paymentSlice";
import { useRouter } from "next/navigation";
import { bkashPayment } from "@/lib/payment/bkash";
import { nagadPayment } from "@/lib/payment/nagad";
import { sslCommerzPayment } from "@/lib/payment/sslcommerz";

interface PaymentModalProps {
    isOpen: boolean;
    onOpenChange: () => void;
    courseId: string;
    courseTitle: string;
    amount: number;
}

export default function PaymentModal({
    isOpen,
    onOpenChange,
    courseId,
    courseTitle,
    amount,
}: PaymentModalProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<"bkash" | "nagad" | "sslcommerz" | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const paymentMethods = [
        {
            id: "bkash",
            name: "bKash",
            icon: "📱",
            description: "Pay with bKash mobile wallet",
            color: "from-pink-500 to-rose-500",
        },
        {
            id: "nagad",
            name: "Nagad",
            icon: "💳",
            description: "Pay with Nagad mobile wallet",
            color: "from-orange-500 to-amber-500",
        },
        {
            id: "sslcommerz",
            name: "Card Payment",
            icon: "💵",
            description: "Pay with Credit/Debit Card or all methods",
            color: "from-blue-500 to-indigo-500",
        },
    ];

    const handlePayment = async () => {
        if (!selectedMethod) {
            alert("Please select a payment method");
            return;
        }

        if (!agreedToTerms) {
            alert("Please agree to terms and conditions");
            return;
        }

        setIsProcessing(true);

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const paymentData = {
                amount,
                courseId,
                courseName: courseTitle,
                userId: user.id || "guest",
                userEmail: user.email || "guest@example.com",
                userName: user.name || "Guest User",
            };

            dispatch(
                initiatePayment({
                    courseId,
                    amount,
                    method: selectedMethod,
                })
            );

            if (selectedMethod === "bkash") {
                const response = await bkashPayment.createPayment(paymentData);
                if (response.bkashURL) {
                    window.location.href = response.bkashURL;
                }
            } else if (selectedMethod === "nagad") {
                const response = await nagadPayment.initializePayment(paymentData);
                if (response.callBackUrl) {
                    window.location.href = response.callBackUrl;
                }
            } else if (selectedMethod === "sslcommerz") {
                const response = await sslCommerzPayment.initializePayment(paymentData);
                if (response.GatewayPageURL) {
                    window.location.href = response.GatewayPageURL;
                }
            }
        } catch (error: any) {
            console.error("Payment Error:", error);
            alert(error.message || "Payment failed. Please try again.");
            setIsProcessing(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" isDismissable={!isProcessing}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold">Complete Payment</h2>
                            <p className="text-sm text-default-500">{courseTitle}</p>
                        </ModalHeader>
                        <ModalBody>
                            <Card className="bg-gradient-to-r from-primary-500 to-purple-500">
                                <CardBody className="text-center py-6">
                                    <p className="text-sm text-white/90 mb-1">Total Amount</p>
                                    <p className="text-5xl font-bold text-white">{amount} BDT</p>
                                </CardBody>
                            </Card>

                            <Divider className="my-4" />

                            <div className="space-y-4">
                                <p className="font-semibold text-lg">Select Payment Method</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {paymentMethods.map((method) => (
                                        <Card
                                            key={method.id}
                                            isPressable
                                            onPress={() => setSelectedMethod(method.id as any)}
                                            className={`border-2 transition-all cursor-pointer ${selectedMethod === method.id
                                                    ? "border-primary scale-105 shadow-lg"
                                                    : "border-transparent hover:border-default-300"
                                                }`}
                                        >
                                            <CardBody className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`text-4xl p-3 bg-gradient-to-r ${method.color} rounded-lg`}>
                                                        <span className="filter drop-shadow-lg">{method.icon}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-lg">{method.name}</p>
                                                        <p className="text-sm text-default-500">{method.description}</p>
                                                    </div>
                                                    {selectedMethod === method.id && (
                                                        <div className="text-primary text-2xl">✓</div>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4">
                                <Checkbox
                                    isSelected={agreedToTerms}
                                    onValueChange={setAgreedToTerms}
                                    size="sm"
                                >
                                    <span className="text-sm">
                                        I agree to the{" "}
                                        <a href="/terms-of-use" className="text-primary underline" target="_blank">
                                            Terms & Conditions
                                        </a>{" "}
                                        and{" "}
                                        <a href="/refund-policy" className="text-primary underline" target="_blank">
                                            Refund Policy
                                        </a>
                                    </span>
                                </Checkbox>
                            </div>

                            <Card className="bg-default-50 mt-4">
                                <CardBody className="p-4">
                                    <div className="flex items-start gap-2 text-sm">
                                        <span className="text-green-500 text-lg">🔒</span>
                                        <div>
                                            <p className="font-semibold mb-1">Secure Payment</p>
                                            <p className="text-default-600 text-xs">
                                                Your payment is processed securely. We don't store your payment information.
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                color="danger"
                                variant="light"
                                onPress={onClose}
                                isDisabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handlePayment}
                                isLoading={isProcessing}
                                isDisabled={!selectedMethod || !agreedToTerms}
                                className="font-semibold"
                                size="lg"
                            >
                                {isProcessing ? "Processing..." : `Pay ${amount} BDT`}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
