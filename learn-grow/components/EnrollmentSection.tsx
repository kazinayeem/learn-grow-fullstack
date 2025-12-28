"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button, Chip } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FaCheck, FaRobot, FaStar, FaBook } from "react-icons/fa";

export default function EnrollmentSection() {
  const router = useRouter();

  const enrollmentPlans = [
    {
      id: "single",
      title: "একক কোর্স",
      subtitle: "Single Course Enrollment",
      price: 3500,
      duration: "৳3,500 / প্রতি কোর্স",
      description: "একটি নির্দিষ্ট কোর্সে প্রবেশাধিকার",
      duration_detail: "৩ মাসের অ্যাক্সেস",
      features: [
        "নির্বাচিত কোর্স",
        "৩ মাসের অ্যাক্সেস",
        "সম্পূর্ণ কোর্স উপাদান",
      ],
      icon: <FaBook className="text-2xl" />,
      badge: null,
      color: "primary",
      action: () => {
        // Check if user is logged in
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          router.push("/login");
          return;
        }
        router.push("/courses?enrollment=single");
      },
    },
    {
      id: "quarterly",
      title: "ত্রৈমাসিক সাবস্ক্রিপশন",
      subtitle: "All Course Access - 3 Months",
      price: 9999,
      duration: "৳9,999 / প্রতি ৩ মাস",
      description: "সমস্ত কোর্সে সীমাহীন প্রবেশাধিকার",
      duration_detail: "সবচেয়ে জনপ্রিয়",
      features: [
        "সমস্ত কোর্সে অ্যাক্সেস",
        "লাইভ ক্লাস",
        "মেন্টর সহায়তা",
        "সার্টিফিকেট",
        "কমিউনিটি অ্যাক্সেস",
        "রোবোটিক্স কিট অন্তর্ভুক্ত",
      ],
      icon: <FaStar className="text-2xl" />,
      badge: "Most Popular",
      color: "success",
      action: () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          router.push("/login");
          return;
        }
        router.push("/checkout?plan=quarterly");
      },
    },
    {
      id: "kit",
      title: "শুধু রোবোটিক্স কিট",
      subtitle: "Kit Only Order",
      price: 4500,
      duration: "৳4,500 / একবার",
      description: "রোবোটিক্স কিট ডেলিভারি",
      duration_detail: "একবার ক্রয়",
      features: [
        "সম্পূর্ণ রোবোটিক্স কিট",
        "বাড়িতে ডেলিভারি",
        "সেটআপ গাইড অন্তর্ভুক্ত",
      ],
      icon: <FaRobot className="text-2xl" />,
      badge: null,
      color: "warning",
      action: () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          router.push("/login");
          return;
        }
        router.push("/checkout?plan=kit");
      },
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            আপনার শেখার পথ বেছে নিন
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Your Learning Journey Starts Here
          </p>
          <p className="text-gray-500">
            প্রতিটি শিক্ষার্থীর জন্য নমনীয় মূল্য | Flexible Pricing for Every Learner
          </p>
        </div>

        {/* Enrollment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {enrollmentPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.id === "quarterly" ? "md:scale-105 md:row-span-2" : ""
              }`}
              shadow={plan.id === "quarterly" ? "lg" : "md"}
            >
              {/* Badge for Popular Plan */}
              {plan.badge && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Chip
                    color="danger"
                    variant="shadow"
                    className="text-white font-bold"
                    startContent={<FaStar className="text-sm" />}
                  >
                    {plan.badge}
                  </Chip>
                </div>
              )}

              <CardHeader className="flex flex-col items-start px-6 py-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-lg bg-${plan.color}-100 text-${plan.color}-600`}>
                    {plan.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{plan.subtitle}</p>
              </CardHeader>

              <CardBody className="px-6 py-4 flex-grow">
                {/* Price */}
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ৳{plan.price.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">{plan.duration_detail}</p>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6">{plan.description}</p>

                {/* Features List */}
                <div className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <FaCheck className={`text-${plan.color}-500 flex-shrink-0`} />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  fullWidth
                  size="lg"
                  color={plan.color}
                  variant={plan.id === "quarterly" ? "solid" : "bordered"}
                  onPress={plan.action}
                  className={`font-bold ${
                    plan.id === "quarterly"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : ""
                  }`}
                >
                  এখনই শুরু করুন | Buy Now
                </Button>
              </CardBody>

              {/* Additional Info */}
              {plan.id === "quarterly" && (
                <div className="px-6 py-4 bg-green-50 border-t border-green-200">
                  <p className="text-sm text-green-800 font-semibold">
                    ✓ রোবোটিক্স কিট অন্তর্ভুক্ত | Kit Included
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16 overflow-x-auto">
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">বৈশিষ্ট্য তুলনা | Feature Comparison</h3>
            
            <table className="w-full text-center text-sm md:text-base">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-3 font-semibold text-gray-900">বৈশিষ্ট্য</th>
                  <th className="py-3 px-3 font-semibold text-gray-900">একক কোর্স</th>
                  <th className="py-3 px-3 font-semibold text-green-600">সাবস্ক্রিপশন ⭐</th>
                  <th className="py-3 px-3 font-semibold text-gray-900">শুধু কিট</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="text-left py-3 px-3">কোর্স অ্যাক্সেস</td>
                  <td className="py-3 px-3">✓ (১টি)</td>
                  <td className="py-3 px-3 bg-green-50">✓ সব</td>
                  <td className="py-3 px-3">✗</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="text-left py-3 px-3">রোবোটিক্স কিট</td>
                  <td className="py-3 px-3">✗</td>
                  <td className="py-3 px-3 bg-green-50">✓</td>
                  <td className="py-3 px-3">✓</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="text-left py-3 px-3">লাইভ ক্লাস</td>
                  <td className="py-3 px-3">✗</td>
                  <td className="py-3 px-3 bg-green-50">✓</td>
                  <td className="py-3 px-3">✗</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="text-left py-3 px-3">মেন্টর সাপোর্ট</td>
                  <td className="py-3 px-3">✗</td>
                  <td className="py-3 px-3 bg-green-50">✓</td>
                  <td className="py-3 px-3">✗</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="text-left py-3 px-3">সার্টিফিকেট</td>
                  <td className="py-3 px-3">✓</td>
                  <td className="py-3 px-3 bg-green-50">✓</td>
                  <td className="py-3 px-3">✗</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="text-left py-3 px-3">কমিউনিটি অ্যাক্সেস</td>
                  <td className="py-3 px-3">✗</td>
                  <td className="py-3 px-3 bg-green-50">✓</td>
                  <td className="py-3 px-3">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-lg">
            প্রশ্ন আছে? আমাদের সাথে যোগাযোগ করুন | Questions? Contact us
          </p>
          <Button
            as="a"
            href="/contact"
            variant="light"
            size="lg"
            color="primary"
            className="mt-4"
          >
            আরও জানুন | Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
