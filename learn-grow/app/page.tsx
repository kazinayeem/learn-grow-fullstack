import React from "react";

import Educators from "@/components/Educators";
import ModernBanner from "@/components/ModernBanner";
import CoursesSection from "@/components/CoursesSection";
import PlatformFeaturesSection from "@/components/PlatformFeaturesSection";
import PricingSection from "@/components/PricingSection";
import EnrollmentSection from "@/components/EnrollmentSection";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Banner */}
      <ModernBanner />

      {/* Courses Offered */}
      <CoursesSection />

      {/* Platform Features - Moved Here */}
      <PlatformFeaturesSection />

      {/* Enrollment Options */}
      {/* <EnrollmentSection /> */}

      {/* Pricing Plans */}
      <PricingSection />

      {/* Our Educators - Last section before footer */}
      <Educators />
    </div>
  );
}
