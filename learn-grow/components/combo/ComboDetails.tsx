"use client";

import React from "react";
import {
  Card,
  CardBody,
  Button,
  Badge,
  Image,
  Divider,
  Spinner,
  Alert,
} from "@nextui-org/react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useGetComboByIdQuery, useGetUserComboPurchasesQuery } from "@/redux/api/comboApi";
import { getDurationLabel } from "@/lib/access-control";
import { ICombo, IComboOrder } from "@/types/combo.types";

interface ComboDetailsProps {
  comboId: string;
}

export default function ComboDetails({ comboId }: ComboDetailsProps) {
  const router = useRouter();
  const { data: comboData, isLoading: comboLoading, error } = useGetComboByIdQuery(comboId, { skip: !comboId });
  const { data: purchasesData } = useGetUserComboPurchasesQuery();
  // Handle multiple possible response shapes
  const safeComboId = (comboId || "").split("?")[0];
  const combo = (comboData as any)?.data || (comboData as any)?.combo || (comboData as any);
  const purchases = purchasesData?.data || [];
  const courses = combo?.courses || [];

  // Check if user already purchased this combo
  const hasPurchased = purchases.some(
    (purchase: IComboOrder) => purchase.comboId._id === comboId
  );

  if (comboLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Loading combo details..." />
      </div>
    );
  }

  if (!safeComboId || !combo) {
    return (
      <div className="text-center py-10">
        <p className="text-danger text-lg mb-4">Combo not found</p>
        <Button as={Link} href="/bundle" color="primary" variant="bordered">
          Back to Bundles
        </Button>
      </div>
    );
  }

  const primaryPrice = combo.discountPrice || combo.price;
  const savings = combo.discountPrice ? combo.price - combo.discountPrice : 0;
  const instructorData = (combo as any)?.instructor || {};
  const instructor = {
    name: combo.instructorName || instructorData.name || "",
    title: instructorData.title || "",
    experience: instructorData.experience || "",
    bio: instructorData.bio || "",
    coursesTaught: courses.length || 0,
    avatar: instructorData.avatar || combo.thumbnail || "/logo.png",
    socials: Array.isArray(instructorData.socials) ? instructorData.socials : [],
  };

  const learnings = [
    "Ship production-ready projects with confidence",
    "Master core patterns used across included courses",
    "Build portfolio pieces that align with hiring signals",
    "Apply best practices for maintainability and delivery",
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 lg:py-10">
      {hasPurchased && (
        <Alert color="success" className="mb-6">
          You have already purchased this bundle. Head to My Courses to start learning.
        </Alert>
      )}

      {/* Hero */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-default-100 mb-8 min-h-[320px] md:min-h-[420px]">
        <div className="absolute inset-0">
          <NextImage
            src={combo.thumbnail || "/logo.png"}
            alt={combo.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1000px"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="relative z-10 inset-0 flex flex-col justify-end p-6 md:p-8 gap-3 text-white">
          <Badge color="success" variant="solid" className="w-fit">
            {combo.duration === "lifetime" ? "Lifetime Access" : `${getDurationLabel(combo.duration)}`}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight drop-shadow">
            {combo.name}
          </h1>
          {combo.description && (
            <p className="text-base md:text-lg text-white/85 max-w-3xl">
              {combo.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge color="primary" variant="flat">📚 Includes {courses.length} Courses</Badge>
            <Badge color="secondary" variant="flat">💼 Career-focused outcomes</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="flex items-baseline gap-2">
              {combo.discountPrice && (
                <span className="text-lg line-through text-white/70">
                  ৳{combo.price.toLocaleString()}
                </span>
              )}
              <span className="text-3xl font-bold">৳{primaryPrice.toLocaleString()}</span>
              {savings > 0 && (
                <span className="px-2 py-1 rounded-full bg-emerald-500/90 text-xs font-semibold">
                  Save ৳{savings.toLocaleString()}
                </span>
              )}
            </div>
            <Button
              as={Link}
              href={`/checkout?plan=combo&comboId=${combo._id}`}
              color="success"
              size="lg"
              className="shadow-lg hover:opacity-95"
            >
              Buy Bundle Now
            </Button>
            <Button as={Link} href="/bundle" variant="bordered" color="default">
              Back to Bundles
            </Button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-8 items-start">
        {/* Left column */}
        <div className="space-y-8">
          {/* What you'll learn */}
          <Card shadow="sm" className="border border-default-200">
            <CardBody className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">What you'll learn</h2>
              <ul className="space-y-2 text-default-700 text-sm">
                {learnings.map((item, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="text-success">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {/* Included courses */}
          <Card shadow="sm" className="border border-default-200">
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Included Courses</h2>
                  <p className="text-sm text-default-500">Access applies to these courses only.</p>
                </div>
                <Badge color="primary" variant="flat">{courses.length} courses</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course: any, idx: number) => (
                  <Card key={idx} shadow="sm" className="border border-default-200 hover:shadow-md transition">
                    <CardBody className="space-y-3 p-4">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden">
                        <Image
                          src={course.thumbnail || "/logo.png"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          fallbackSrc="/logo.png"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-2 left-2">
                          <Badge color="default" variant="flat" className="text-xs">Included via bundle</Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2">{course.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-default-600">
                        {course.level && <Badge size="sm" variant="flat">{course.level}</Badge>}
                      </div>
                      <Button
                        as={Link}
                        href={`/courses/${course._id}`}
                        size="sm"
                        variant="bordered"
                        color="primary"
                        className="w-full"
                      >
                        View course preview
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Instructor */}
          {(instructor.name || instructor.title || instructor.bio || instructor.experience) && (
            <Card shadow="sm" className="border border-default-200">
              <CardBody className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Meet your instructor</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-default-200 bg-default-100">
                    <Image src={instructor.avatar} alt={instructor.name || "Instructor avatar"} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    {instructor.name && <p className="font-semibold text-foreground">{instructor.name}</p>}
                    {instructor.title && <p className="text-sm text-default-500">{instructor.title}</p>}
                    {instructor.experience && <p className="text-sm text-default-500">Experience: {instructor.experience}</p>}
                    {instructor.bio && <p className="text-sm text-default-600 leading-relaxed">{instructor.bio}</p>}
                    <p className="text-xs text-default-500">Courses taught: {instructor.coursesTaught}</p>
                    {instructor.socials.length > 0 && (
                      <div className="flex gap-3 text-xs text-primary-600">
                        {instructor.socials.map((s, i) => (
                          <Link key={i} href={s.href} className="hover:underline">
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Value & Trust */}
          <Card shadow="sm" className="border border-default-200">
            <CardBody className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Why this bundle</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-default-700">
                <div className="p-3 rounded-lg bg-default-100">
                  <p className="font-semibold text-foreground">Savings</p>
                  <p>Save ৳{savings > 0 ? savings.toLocaleString() : "0"} compared to buying individually.</p>
                </div>
                <div className="p-3 rounded-lg bg-default-100">
                  <p className="font-semibold text-foreground">Access</p>
                  <p>{combo.duration === "lifetime" ? "Lifetime access to included courses." : `${getDurationLabel(combo.duration)} of access to included courses.`}</p>
                </div>
                <div className="p-3 rounded-lg bg-default-100">
                  <p className="font-semibold text-foreground">Certificate</p>
                  <p>Earn course certificates where available.</p>
                </div>
                <div className="p-3 rounded-lg bg-default-100">
                  <p className="font-semibold text-foreground">Refund policy</p>
                  <p>Subject to platform refund policy for bundles.</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right column - sticky card */}
        <div className="lg:sticky lg:top-6">
          <Card shadow="lg" className="border border-default-200">
            <CardBody className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">৳{primaryPrice.toLocaleString()}</span>
                {combo.discountPrice && (
                  <span className="text-sm line-through text-default-500">৳{combo.price.toLocaleString()}</span>
                )}
                {savings > 0 && (
                  <Badge color="success" variant="flat">Save ৳{savings.toLocaleString()}</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge color="success" variant="flat">{combo.duration === "lifetime" ? "Lifetime Access" : getDurationLabel(combo.duration)}</Badge>
                <Badge color="primary" variant="flat">📚 {courses.length} courses</Badge>
              </div>

              <Button
                as={Link}
                href={`/checkout?plan=combo&comboId=${combo._id}`}
                color="success"
                size="lg"
                className="w-full"
                isDisabled={hasPurchased}
              >
                {hasPurchased ? "Already purchased" : "Buy Bundle Now"}
              </Button>
              <Button as={Link} href="/bundle" variant="bordered" className="w-full">
                Back to Bundles
              </Button>
              {hasPurchased && (
                <Button as={Link} href="/student/courses" color="primary" className="w-full" variant="flat">
                  Go to My Courses
                </Button>
              )}
              <Divider />
              <div className="text-sm text-default-600 space-y-1">
                <p>Access applies only to included courses.</p>
                <p>No platform-wide access is included.</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Mobile sticky purchase bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/95 border-t border-default-200 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md p-3 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground">৳{primaryPrice.toLocaleString()}</span>
          <span className="text-xs text-default-500">{combo.duration === "lifetime" ? "Lifetime access" : getDurationLabel(combo.duration)}</span>
        </div>
        <Button
          as={Link}
          href={`/checkout?plan=combo&comboId=${combo._id}`}
          color="success"
          size="md"
          isDisabled={hasPurchased}
          className="flex-1"
        >
          {hasPurchased ? "Purchased" : "Buy Now"}
        </Button>
      </div>
    </div>
  );
}
