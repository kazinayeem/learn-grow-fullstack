import React from "react";
import Link from "next/link";
import ComboListing from "@/components/combo/ComboListing";

export const metadata = {
  title: "Course Combos | Learn Grow",
  description: "Browse our course combo bundles and save up to 40% on multiple courses.",
};

export default function CombosPage() {
  return (
    <div className="min-h-screen bg-default-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white py-12">
        <div className="container mx-auto px-4">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm font-semibold">
            <ol className="flex items-center gap-2 text-white/80">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li className="opacity-70">/</li>
              <li className="text-white">Combos</li>
            </ol>
          </nav>

          <h1 className="text-4xl font-bold mb-3">Course Combos</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Get more value with our course combo bundles. Save money by purchasing multiple
            courses together with flexible access durations.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <ComboListing />
      </div>
    </div>
  );
}
