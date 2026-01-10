import React from "react";
import ComboListing from "@/components/combo/ComboListing";

export const metadata = {
  title: "Bundles | Learn Grow",
  description: "Browse all course bundles and save more.",
};

export default function BundlesPage() {
  return (
    <div className="min-h-screen bg-default-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Bundles</h1>
        <p className="text-default-600 mb-8">Explore our curated bundles that combine multiple courses with great value.</p>
        <ComboListing />
      </div>
    </div>
  );
}
