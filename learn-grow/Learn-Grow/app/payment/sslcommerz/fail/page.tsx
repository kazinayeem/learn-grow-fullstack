"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button } from "@nextui-org/react";

export default function SSLCommerzFailPage() {
    const router = useRouter();

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl border-red-200 border-1">
                <CardBody className="py-10 text-center flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-2">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
                    <p className="text-default-500">
                        The transaction was declined or failed. Please try again or use a different payment method.
                    </p>
                    <div className="flex gap-4 mt-2">
                        <Button
                            variant="bordered"
                            onPress={() => router.push("/")}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onPress={() => router.back()}
                        >
                            Try Again
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
