"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Card, CardBody, Button, Spinner } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { completePayment } from "@/redux/slices/paymentSlice";
import { enrollInCourse } from "@/redux/slices/enrollmentSlice";
import { FaCheckCircle, FaTimesCircle, FaDownload, FaHome } from "react-icons/fa";

function PaymentConfirmContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [paymentDetails, setPaymentDetails] = useState<any>(null);

    useEffect(() => {
        // Get payment parameters from URL
        const paymentId = searchParams.get("payment_id");
        const transactionId = searchParams.get("transaction_id");
        const courseId = searchParams.get("course_id");
        const amount = searchParams.get("amount");
        const method = searchParams.get("method");

        // Simulate payment verification
        setTimeout(() => {
            const isSuccess = searchParams.get("status") !== "failed";

            if (isSuccess && paymentId && courseId) {
                // Complete payment in Redux
                dispatch(
                    completePayment({
                        paymentId,
                        transactionId: transactionId || `TXN-${Date.now()}`,
                    })
                );

                // Enroll in course
                dispatch(enrollInCourse({ courseId }));

                setPaymentDetails({
                    transactionId: transactionId || `TXN-${Date.now()}`,
                    courseId,
                    amount: amount || "0",
                    method: method || "unknown",
                    date: new Date().toLocaleString(),
                });

                setStatus("success");
            } else {
                setStatus("failed");
            }
        }, 2000);
    }, [searchParams, dispatch]);

    if (status === "loading") {
        return (
            <div className="container mx-auto px-4 py-16 max-w-2xl">
                <Card>
                    <CardBody className="text-center py-16">
                        <Spinner size="lg" className="mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
                        <p className="text-gray-600">Please wait while we confirm your payment</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="container mx-auto px-4 py-16 max-w-2xl">
                <Card className="border-2 border-green-500">
                    <CardBody className="p-8">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                                <FaCheckCircle className="text-5xl text-green-500" />
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-green-600 mb-2">
                                Payment Successful! 🎉
                            </h1>
                            <p className="text-gray-600">
                                Your payment has been processed successfully and you're now enrolled in the course.
                            </p>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
                            <h3 className="font-semibold text-lg mb-3">Payment Details</h3>

                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Transaction ID:</span>
                                <span className="font-mono font-semibold">
                                    {paymentDetails?.transactionId}
                                </span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Amount Paid:</span>
                                <span className="font-bold text-green-600">
                                    {paymentDetails?.amount} BDT
                                </span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-gray-200">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-semibold capitalize">
                                    {paymentDetails?.method}
                                </span>
                            </div>

                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Date & Time:</span>
                                <span className="font-semibold">
                                    {paymentDetails?.date}
                                </span>
                            </div>
                        </div>

                        {/* Course Access */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📚</span>
                                <div>
                                    <p className="font-semibold mb-1">Course Access Granted!</p>
                                    <p className="text-sm text-gray-600">
                                        You can now access all course materials, lectures, and resources.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                color="primary"
                                size="lg"
                                className="flex-1"
                                startContent={<FaHome />}
                                onPress={() => router.push("/dashboard")}
                            >
                                Go to Dashboard
                            </Button>
                            <Button
                                variant="bordered"
                                size="lg"
                                startContent={<FaDownload />}
                                onPress={() => alert("Invoice download coming soon!")}
                            >
                                Download Invoice
                            </Button>
                        </div>

                        {/* Email Confirmation Notice */}
                        <div className="mt-6 text-center text-sm text-gray-500">
                            <p>
                                📧 A confirmation email has been sent to your registered email address.
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Failed state
    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <Card className="border-2 border-red-500">
                <CardBody className="p-8">
                    {/* Error Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                            <FaTimesCircle className="text-5xl text-red-500" />
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-red-600 mb-2">
                            Payment Failed
                        </h1>
                        <p className="text-gray-600">
                            Unfortunately, your payment could not be processed.
                        </p>
                    </div>

                    {/* Possible Reasons */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-lg mb-3">Possible Reasons:</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Insufficient balance in your account</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Payment was cancelled</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Network connectivity issues</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>•</span>
                                <span>Payment gateway timeout</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            color="primary"
                            size="lg"
                            className="flex-1"
                            onPress={() => router.back()}
                        >
                            Try Again
                        </Button>
                        <Button
                            variant="bordered"
                            size="lg"
                            onPress={() => router.push("/contact")}
                        >
                            Contact Support
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

export default function PaymentConfirmPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
                <Spinner size="lg" />
            </div>
        }>
            <PaymentConfirmContent />
        </Suspense>
    );
}
