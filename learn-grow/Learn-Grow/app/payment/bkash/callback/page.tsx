"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Spinner, Card, CardBody, Button } from "@nextui-org/react";
import { completePayment } from "@/redux/slices/paymentSlice";
import type { RootState } from "@/redux/store";

export default function BkashCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const currentPayment = useSelector((state: RootState) => state.payment.currentPayment);
    const [status, setStatus] = React.useState<"processing" | "success" | "failed">("processing");
    const [message, setMessage] = React.useState("Processing your payment...");

    useEffect(() => {
        const processPayment = async () => {
            // 1. Get query parameters
            const paymentID = searchParams.get("paymentID");
            const statusParam = searchParams.get("status");

            // 2. Mock Validation (since we don't have backend)
            // In a real app, we would send 'paymentID' to our backend to execute payment

            if (statusParam === "success" || statusParam === "0000" || paymentID) {
                // Check if we have a pending payment in Redux to verify
                // For demo, we rely on the Redux state or just trust the mock
                if (currentPayment) {
                    dispatch(completePayment({
                        paymentId: currentPayment.id,
                        transactionId: paymentID || `TRX-${Date.now()}`
                    }));
                }

                setStatus("success");
                setMessage("Payment Successful! Enrolling you now...");

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);

            } else {
                setStatus("failed");
                setMessage("Payment Failed or Cancelled.");
            }
        };

        if (searchParams.toString()) {
            processPayment();
        }
    }, [searchParams, dispatch, router, currentPayment]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardBody className="py-10 text-center flex flex-col items-center gap-6">
                    {status === "processing" && (
                        <>
                            <Spinner size="lg" color="primary" />
                            <h2 className="text-xl font-bold">Processing bKash Payment</h2>
                            <p className="text-default-500">{message}</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
                            <p className="text-default-500">{message}</p>
                            <Button
                                color="primary"
                                className="mt-4"
                                onPress={() => router.push("/dashboard")}
                            >
                                Go to Dashboard
                            </Button>
                        </>
                    )}

                    {status === "failed" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-2">
                                <span className="text-4xl">❌</span>
                            </div>
                            <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
                            <p className="text-default-500">{message}</p>
                            <Button
                                color="primary"
                                variant="bordered"
                                className="mt-4"
                                onPress={() => router.push("/courses")}
                            >
                                Try Again
                            </Button>
                        </>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
