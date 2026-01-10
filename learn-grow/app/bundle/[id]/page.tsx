import React from "react";
import ComboDetails from "@/components/combo/ComboDetails";

interface BundleDetailsPageProps {
  params: { id: string };
}

export const metadata = {
  title: "Bundle Details | Learn Grow",
  description: "See what's included in this bundle and purchase.",
};

export default async function BundleDetailsPage({ params }: BundleDetailsPageProps) {
  const resolvedParams = await params;
  const idParam = resolvedParams?.id;
  const safeId = typeof idParam === "string" ? idParam.split("?")[0] : "";

  if (!safeId) {
    return (
      <div className="min-h-screen bg-default-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-danger text-lg mb-4">Invalid bundle URL</p>
          <a href="/bundle" className="text-primary underline">Back to Bundles</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50">
      <div className="container mx-auto px-4 py-8">
        <ComboDetails comboId={safeId} />
      </div>
    </div>
  );
}
