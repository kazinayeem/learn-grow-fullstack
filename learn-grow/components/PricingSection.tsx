"use client";
import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Chip,
} from "@nextui-org/react";

import { useRouter } from "next/navigation";

import { pricingPlans } from "@/lib/platformData";
import { useGetActiveCombosQuery } from "@/redux/api/comboApi";
import { useGetCommissionQuery } from "@/redux/api/settingsApi";

const PricingSection = () => {
  const router = useRouter();
  const [language] = useState<'en' | 'bn'>('bn');
  const pricing = pricingPlans[language];
  const { data: combosData } = useGetActiveCombosQuery({ page: 1, limit: 1 });
  const firstCombo = combosData?.data?.[0];
  const { data: settingsData } = useGetCommissionQuery();
  const kitPriceSetting = settingsData?.data?.kitPrice;

  // Optional kit price override from env / admin config (fallback to static)
  const kitPriceEnv = process.env.NEXT_PUBLIC_KIT_PRICE;

  // Map plan IDs to their target routes
  const getPlanRoute = (planId: string, comboId?: string) => {
    switch (planId) {
      case "single-course":
        // Single course needs course selection first
        return "/courses";
      case "quarterly":
        return "/checkout?plan=quarterly";
      case "combo":
        return comboId ? `/bundle/${comboId}` : "/bundle";
      case "robotics-kit":
        return "/checkout?plan=kit";
      case "school":
        return "/contact";
      default:
        return "/checkout";
    }
  };

  const handleCtaClick = (planId: string, comboId?: string) => {
    const target = getPlanRoute(planId, comboId);
    router.push(target);
  };

  const singleCoursePlan = pricing.plans.find((p) => p.id === "single-course");

  // Build plan list: 
  // - If combo exists: show single-course + combo only (exclude robotics-kit and school)
  // - If no combo: show single-course + robotics-kit + school (exclude quarterly)
  const basePlans = pricing.plans.filter((p) => p.id !== "single-course");

  const transformedBasePlans = basePlans
    .map((plan) => {
      // If combo exists, replace quarterly plan with combo data
      if (plan.id === "quarterly" && firstCombo) {
        return {
          ...plan,
          id: "combo",
          name: firstCombo.name,
          price: String(firstCombo.discountPrice || firstCombo.price || ""),
          currency: language === "bn" ? "টাকা" : "BDT",
          period: language === "bn" ? "বান্ডেল" : "bundle",
          description: firstCombo.description || plan.description,
          features: [
            `${language === "bn" ? "কোর্স সংখ্যা" : "Courses"}: ${firstCombo.courses?.length || 0}`,
            language === "bn" ? "লাইভ ও রেকর্ডেড ক্লাস" : "Live & recorded access",
            language === "bn" ? "বান্ডেল ডিসকাউন্ট" : "Bundle discount",
            language === "bn" ? "সার্টিফিকেট ও কমিউনিটি" : "Certificates & community",
          ],
          popular: true,
          comboId: firstCombo._id,
          cta: language === "bn" ? "বান্ডেল দেখুন" : "View Bundle",
        } as any;
      }

      if (plan.id === "robotics-kit") {
        const price = String(kitPriceSetting ?? kitPriceEnv ?? plan.price ?? "");
        return {
          ...plan,
          price,
          hasPriceData: !!(kitPriceSetting || kitPriceEnv || plan.price),
        };
      }

      return plan;
    })
    // Filter plans based on combo availability
    .filter((plan) => {
      // If combo exists, only show combo (exclude quarterly, robotics-kit, and school)
      if (firstCombo) {
        return plan.id === "combo";
      }
      // If no combo, exclude quarterly but show robotics-kit and school
      return plan.id !== "quarterly";
    });

  const plans = [
    singleCoursePlan
      ? {
          ...singleCoursePlan,
          price: "", // hide price; course pages show pricing
          currency: "",
          period:
            language === "bn" ? "কোর্স অনুযায়ী মূল্য" : "See course page",
          cta: language === "bn" ? "কোর্স দেখুন" : "Browse Courses",
        }
      : null,
    ...transformedBasePlans,
  ].filter(Boolean) as typeof pricing.plans;

  return (
    <section className="pt-0 pb-10 bg-gradient-to-b from-white via-primary-50/30 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block mb-4">
            <Chip
              className="bg-accent-100 text-accent-700 font-semibold"
              size="lg"
              variant="flat"
            >
              {language === "en" ? "💰 Pricing Plans" : "💰 প্রাইসিং প্ল্যান"}
            </Chip>
          </div>
          <h2
            className={`text-4xl md:text-5xl font-black text-gray-900 mb-4 ${language === "bn" ? "font-siliguri" : ""}`}
          >
            {pricing.title}
          </h2>
          <p
            className={`text-lg md:text-xl text-gray-600 max-w-3xl mx-auto ${language === "bn" ? "font-siliguri" : ""}`}
          >
            {pricing.subtitle}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`group transition-all duration-300 animate-slideUp overflow-visible ${plan.popular
                ? "border-2 border-primary-500 shadow-glow-primary hover:shadow-glow-primary scale-105 lg:scale-110"
                : "border-0 shadow-card hover:shadow-card-hover hover:-translate-y-1"
                }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Chip
                    className="bg-gradient-primary text-white font-bold px-4 shadow-lg"
                    size="lg"
                  >
                    ⭐ {language === "en" ? "Most Popular" : "সবচেয়ে জনপ্রিয়"}
                  </Chip>
                </div>
              )}

              <CardHeader className="flex flex-col items-start p-6 pb-0">
                {/* Plan Name */}
                <h3
                  className={`text-2xl font-bold text-gray-900 mb-2 ${language === "bn" ? "font-siliguri" : ""}`}
                >
                  {plan.name}
                </h3>

                {/* Plan Description */}
                <p
                  className={`text-sm text-gray-600 mb-4 ${language === "bn" ? "font-siliguri" : ""}`}
                >
                  {plan.description}
                </p>

                 {/* Pricing */}
                 <div className="w-full mb-4">
                   {plan.id === "single-course" ? (
                     <div>
                       <div className={`text-lg font-semibold text-gray-800 ${language === "bn" ? "font-siliguri" : ""}`}>
                         {plan.period}
                       </div>
                       <div className={`text-sm text-gray-500 ${language === "bn" ? "font-siliguri" : ""}`}>
                         {language === "bn" ? "প্রতিটি কোর্স পাতায় মূল্য দেখুন" : "See pricing on course pages"}
                       </div>
                     </div>
                   ) : plan.id === "robotics-kit" && !(plan as any).hasPriceData ? (
                     // Hide price section for robotics kit when no data
                     <div>
                       <div className={`text-sm text-gray-600 italic ${language === "bn" ? "font-siliguri" : ""}`}>
                         {language === "bn" ? "মূল্য শীঘ্রই আসছে" : "Price coming soon"}
                       </div>
                     </div>
                   ) : plan.price === "Custom" || plan.price === "কাস্টম" ? (
                     <div>
                       <div className="text-4xl font-black bg-gradient-cool bg-clip-text text-transparent">
                         {plan.price}
                       </div>
                       <div
                         className={`text-sm text-gray-500 ${language === "bn" ? "font-siliguri" : ""}`}
                       >
                         {plan.period}
                       </div>
                     </div>
                   ) : (
                     <div className="flex flex-wrap items-baseline gap-1">
                       <span
                         className={`text-2xl font-bold text-gray-600 ${language === "bn" ? "font-siliguri" : ""}`}
                       >
                         {plan.currency}
                       </span>
                       <span
                         className={`text-5xl font-black bg-gradient-primary bg-clip-text text-transparent ${language === "bn" ? "font-siliguri" : ""}`}
                       >
                         {plan.price}
                       </span>
                       <span
                         className={`text-sm text-gray-500 ml-1 whitespace-nowrap ${language === "bn" ? "font-siliguri" : ""}`}
                       >
                         /{plan.period}
                       </span>
                     </div>
                   )}
                 </div>
              </CardHeader>

              <CardBody className="p-6 pt-0">
                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span
                        className={`${plan.popular ? "text-primary-500" : "text-accent-500"} mt-0.5 flex-shrink-0`}
                      >
                        ✓
                      </span>
                      <span
                        className={`text-sm text-gray-700 ${language === "bn" ? "font-siliguri" : ""}`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>

              <CardFooter className="p-6 pt-0">
                <Button
                  className={`w-full font-bold ${plan.popular
                    ? "bg-gradient-primary text-white shadow-glow-primary"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  size="lg"
                  onPress={() => handleCtaClick(plan.id, (plan as any).comboId)}
                >
                  <span className={language === "bn" ? "font-siliguri" : ""}>
                    {plan.cta}
                  </span>
                </Button>
              </CardFooter>

              {/* Hover Gradient Overlay */}
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/5 rounded-xl pointer-events-none" />
              )}
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        <div
          className="text-center mb-12 animate-fadeIn"
          style={{ animationDelay: "500ms" }}
        >
          <h3
            className={`text-xl font-bold text-gray-900 mb-4 ${language === "bn" ? "font-siliguri" : ""}`}
          >
            {pricing.paymentMethods.title}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {pricing.paymentMethods.methods.map((method, idx) => (
              <Chip
                key={idx}
                className="bg-white border border-gray-200 text-gray-700 font-semibold"
                size="lg"
                variant="flat"
              >
                <span className={language === "bn" ? "font-siliguri" : ""}>
                  {method}
                </span>
              </Chip>
            ))}
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="max-w-4xl mx-auto">
          <Card
            className="bg-gradient-to-r from-accent-50 to-primary-50 border-2 border-accent-200 animate-fadeIn"
            style={{ animationDelay: "600ms" }}
          >
            <CardBody className="p-8 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3
                className={`text-2xl font-bold text-gray-900 mb-3 ${language === "bn" ? "font-siliguri" : ""}`}
              >
                {language === "en"
                  ? "100% Satisfaction Guarantee"
                  : "১০০% সন্তুষ্টির গ্যারান্টি"}
              </h3>
              <p
                className={`text-gray-700 max-w-2xl mx-auto ${language === "bn" ? "font-siliguri" : ""}`}
              >
                {language === "en"
                  ? "Try any course risk-free. If you're not completely satisfied within the first 7 days, we'll give you a full refund - no questions asked!"
                  : "যেকোনো কোর্স রিস্ক-ফ্রি ট্রাই করুন। প্রথম ৭ দিনের মধ্যে সম্পূর্ণভাবে সন্তুষ্ট না হলে, আমরা আপনাকে সম্পূর্ণ রিফান্ড দেব - কোন প্রশ্ন ছাড়াই!"}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Help Text */}
        <div
          className="text-center mt-12 animate-fadeIn"
          style={{ animationDelay: "700ms" }}
        >
          <p
            className={`text-gray-600 mb-4 ${language === "bn" ? "font-siliguri" : ""}`}
          >
            {language === "en"
              ? "Have questions about pricing? Our team is here to help!"
              : "প্রাইসিং সম্পর্কে প্রশ্ন আছে? আমাদের টিম সাহায্য করতে এখানে আছে!"}
          </p>
          <Button
            className="border-2 border-primary-500 text-primary-600 font-bold hover:bg-primary-50"
            size="lg"
            variant="bordered"
          >
            <span className={language === "bn" ? "font-siliguri" : ""}>
              {language === "en"
                ? "📞 Contact Sales Team"
                : "📞 সেলস টিমের সাথে যোগাযোগ করুন"}
            </span>
          </Button>
        </div>
      </div>
    </section>

  );
};

export default PricingSection;
