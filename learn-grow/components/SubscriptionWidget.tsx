"use client";

import React from "react";
import { Card, CardBody, Button, Chip, Progress } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCheckActiveSubscriptionQuery } from "@/redux/api/orderApi";
import { FaCheckCircle, FaClock, FaRedo } from "react-icons/fa";

export function SubscriptionWidget() {
  const router = useRouter();
  const { data, isLoading } = useCheckActiveSubscriptionQuery();

  if (isLoading) {
    return (
      <Card className="border-2 border-primary">
        <CardBody className="p-6">
          <p>Loading subscription info...</p>
        </CardBody>
      </Card>
    );
  }

  if (data?.hasActiveSubscription) {
    const subscription = data.subscription;
    if (!subscription) return null;

    const totalDays = 90; // Quarterly subscription is 90 days
    const daysRemaining = subscription.daysRemaining;
    const percentRemaining = (daysRemaining / totalDays) * 100;

    return (
      <Card className="border-2 border-success bg-gradient-to-r from-success/10 to-success/5">
        <CardBody className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaCheckCircle className="text-success" />
                Active Subscription
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Quarterly Subscription
              </p>
            </div>
            <Chip color="success" variant="flat" size="lg">
              ACTIVE
            </Chip>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Days Remaining</p>
              <div className="flex items-center gap-3">
                <Progress
                  value={percentRemaining}
                  color="success"
                  className="flex-1"
                />
                <span className="font-bold text-lg">{daysRemaining} days</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Starts</p>
                <p className="font-semibold">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Expires</p>
                <p className="font-semibold text-danger">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {daysRemaining <= 7 && (
              <div className="bg-warning/20 p-3 rounded-lg border border-warning">
                <p className="text-sm text-warning-700">
                  ⚠️ Your subscription expires soon. Renew to continue learning!
                </p>
              </div>
            )}

            {percentRemaining <= 25 && (
              <Button
                color="primary"
                startContent={<FaRedo />}
                onPress={() => router.push("/pricing")}
              >
                Renew Now
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (data?.expired) {
    return (
      <Card className="border-2 border-danger bg-gradient-to-r from-danger/10 to-danger/5">
        <CardBody className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaClock className="text-danger" />
                Subscription Expired
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your access has expired
              </p>
            </div>
            <Chip color="danger" variant="flat" size="lg">
              EXPIRED
            </Chip>
          </div>

          <div className="bg-danger/20 p-4 rounded-lg mb-4 border border-danger">
            <p className="text-sm text-danger-700">
              Your subscription expired on{" "}
              <strong>{new Date(data.lastExpiredDate!).toLocaleDateString()}</strong>. Renew your
              subscription to regain access to courses.
            </p>
          </div>

          <Button
            color="primary"
            size="lg"
            className="w-full"
            startContent={<FaRedo />}
            onPress={() => router.push("/pricing")}
          >
            Renew Subscription
          </Button>
        </CardBody>
      </Card>
    );
  }

  // No subscription at all
  return (
    <Card className="border-2 border-gray-200">
      <CardBody className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">No Active Subscription</h3>
            <p className="text-sm text-gray-600 mt-1">
              Get unlimited access to all courses
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          Choose a plan that suits your learning style and start your journey with us.
        </p>

        <Button
          color="primary"
          size="lg"
          className="w-full"
          onPress={() => router.push("/pricing")}
        >
          View Pricing Plans
        </Button>
      </CardBody>
    </Card>
  );
}
