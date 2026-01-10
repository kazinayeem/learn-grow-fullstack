import React from "react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import ComboDetails from "@/components/combo/ComboDetails";

interface ComboDetailPageProps {
  params: {
    comboId: string;
  };
}

export async function generateMetadata({ params }: ComboDetailPageProps) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${baseUrl}/combo/${params.comboId}`, {
      cache: "revalidate",
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      return {
        title: "Combo Not Found | Learn Grow",
        description: "The combo you're looking for doesn't exist.",
      };
    }

    const data = await res.json();
    const combo = data?.data;

    return {
      title: `${combo.name} | Learn Grow`,
      description: combo.description || "Enroll in this course combo today.",
      openGraph: {
        title: combo.name,
        description: combo.description,
        images: combo.thumbnail ? [combo.thumbnail] : [],
      },
    };
  } catch (error) {
    return {
      title: "Combo | Learn Grow",
      description: "View course combo details.",
    };
  }
}

export default function ComboDetailPage({ params }: ComboDetailPageProps) {
  return (
    <div className="min-h-screen bg-default-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Breadcrumbs className="mb-6">
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/student/combos">Combos</BreadcrumbItem>
            <BreadcrumbItem>Details</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <ComboDetails comboId={params.comboId} />
      </div>
    </div>
  );
}
