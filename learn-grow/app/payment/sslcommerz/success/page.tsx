"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Spinner, Card, CardBody, Button } from "@nextui-org/react";
import { completePayment } from "@/redux/slices/paymentSlice";
import type { RootState } from "@/redux/store";

function SSLCommerzSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const currentPayment = useSelector((state: RootState) => state.payment.currentPayment);
    const [status, setStatus] = React.useState<"processing" | "success" | "failed">("processing");

    useEffect(() => {
        const processPayment = async () => {
            // 1. Get query parameters
            const tran_id = searchParams.get("tran_id");
            const val_id = searchParams.get("val_id"); // Usually returned by SSLCommerz

            // 2. Mock Validation or trust the success URL
            if (tran_id) {
                if (currentPayment) {
                    dispatch(completePayment({
                        paymentId: currentPayment.id,
                        transactionId: val_id || tran_id
                    }));
                }

                setStatus("success");

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    // Force hard reload or just push? Push is cleaner.
                    router.push("/dashboard");
                }, 2000);

            } else {
                setStatus("failed");
            }
        };

        processPayment();
    }, [searchParams, dispatch, router, currentPayment]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardBody className="py-10 text-center flex flex-col items-center gap-6">
                    {status === "processing" && (
                        <>
                            <Spinner size="lg" color="blue" />
                            <h2 className="text-xl font-bold">Verifying Payment...</h2>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
                            <p className="text-default-500">Thank you for your purchase.</p>
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
                                <span className="text-4xl">⚠️</span>
                            </div>
                            <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
                            <p className="text-default-500">We could not verify the transaction ID.</p>
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

export default function SSLCommerzSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Spinner size="lg" color="primary" />
            </div>
        }>
            <SSLCommerzSuccessContent />
        </Suspense>
    );
}
