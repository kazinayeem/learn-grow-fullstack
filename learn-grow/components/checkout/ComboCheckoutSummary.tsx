import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Spinner, Alert, Button, Badge, Divider, Image } from "@nextui-org/react";
import { useGetComboByIdQuery } from "@/redux/api/comboApi";
import Link from "next/link";

interface ComboCheckoutProps {
  onCheckout?: (comboId: string, comboData: any) => void;
}

export default function ComboCheckoutSummary() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const comboId = searchParams.get("comboId") || "";

  const { data: comboData, isLoading } = useGetComboByIdQuery(comboId, {
    skip: !comboId,
  });

  const combo = comboData?.data;

  if (!comboId) {
    return (
      <Alert color="danger" title="No combo selected">
        Please select a combo before proceeding to checkout.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size="lg" label="Loading combo details..." />
      </div>
    );
  }

  if (!combo) {
    return (
      <Alert color="danger" title="Combo not found">
        The combo you selected doesn't exist. Please go back and select a valid combo.
      </Alert>
    );
  }

  const handleCheckout = () => {
    // Store combo details in session/local storage for the checkout process
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedCombo", JSON.stringify(combo));
    }
    // Continue with the regular checkout flow
  };

  return (
    <Card>
      <CardHeader className="flex gap-3">
        <div>
          <p className="text-lg font-semibold text-foreground">Order Summary</p>
          <p className="text-sm text-default-500">Combo Bundle Purchase</p>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="gap-6">
        {/* Combo Details */}
        {combo.thumbnail && (
          <Image
            src={combo.thumbnail}
            alt={combo.name}
            className="w-full h-48 object-cover rounded-lg"
          />
        )}

        <div>
          <h3 className="text-xl font-bold text-foreground">{combo.name}</h3>
          {combo.description && (
            <p className="text-default-600 text-sm mt-2">{combo.description}</p>
          )}
        </div>

        {/* Courses Included */}
        <div>
          <p className="font-semibold text-foreground mb-3">
            Included Courses ({combo.courses.length})
          </p>
          <div className="space-y-2">
            {combo.courses.map((course: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-default-100 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-foreground">
                    {course.title}
                  </h4>
                  {course.level && (
                    <p className="text-xs text-default-500">{course.level}</p>
                  )}
                </div>
                <Badge>✓</Badge>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Access Duration */}
        <div>
          <p className="font-semibold text-foreground mb-2">Access Duration</p>
          <Badge color="success" size="lg">
            {combo.duration === "lifetime"
              ? "Lifetime Access"
              : `${combo.duration.replace("-", " ")} Access`}
          </Badge>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-default-600">Original Price:</span>
            <span className="line-through text-default-500">
              ৳{combo.price.toLocaleString()}
            </span>
          </div>
          {combo.discountPrice && (
            <>
              <div className="flex justify-between">
                <span className="text-default-600">Discount Price:</span>
                <span className="font-bold text-success">
                  ৳{combo.discountPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-default-600">You Save:</span>
                <span className="font-bold text-success">
                  ৳{(combo.price - combo.discountPrice).toLocaleString()}
                </span>
              </div>
            </>
          )}

          <Divider />

          <div className="flex justify-between items-center text-lg">
            <span className="font-bold text-foreground">Total Amount:</span>
            <span className="text-2xl font-bold text-success">
              ৳{(combo.discountPrice || combo.price).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Terms Notice */}
        <Alert
          color="info"
          title="Terms & Conditions"
          description="By proceeding, you agree to our terms and conditions. Access will be granted immediately after payment verification."
        />

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            as={Link}
            href={`/student/combo/${comboId}`}
            variant="bordered"
            fullWidth
          >
            Back to Combo
          </Button>
          <Button
            color="success"
            onClick={handleCheckout}
            fullWidth
          >
            Continue to Payment
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
