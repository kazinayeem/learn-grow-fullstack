import { Metadata } from "next";
import PricingClient from "./pricing-client";
import PricingSection from "@/components/PricingSection";

export const metadata: Metadata = {
  title: "Pricing Plans - Affordable Robotics Courses & STEM Kits",
  description:
    "Explore flexible pricing plans for Learn & Grow robotics courses and STEM education kits. Choose from single courses, quarterly subscriptions, or institutional packages with robotics kits included.",
  keywords: [
    "robotics course pricing",
    "STEM education plans",
    "affordable robotics courses",
    "course subscription",
    "educational packages",
    "robotics kit prices",
  ],
  openGraph: {
    title: "Pricing Plans - Learn & Grow Academy",
    description:
      "Flexible pricing options for robotics courses and STEM education. Find the perfect plan for your learning journey.",
    url: "https://learnandgrow.io/pricing",
    type: "website",
  },
  alternates: {
    canonical: "https://learnandgrow.io/pricing",
  },
};

export default function PricingPage() {
  return (
    <div className="mt-2">
      <PricingSection />
    </div>
  );
}
