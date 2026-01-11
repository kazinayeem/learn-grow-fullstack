import React from "react";
import Link from "next/link";
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
          <nav aria-label="Breadcrumb" className="text-sm font-semibold">
            <ol className="flex items-center gap-2 text-white/80">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li className="opacity-70">/</li>
              <li>
                <Link href="/student/combos" className="hover:text-white">Combos</Link>
              </li>
              <li className="opacity-70">/</li>
              <li className="text-white">Details</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <ComboDetails comboId={params.comboId} />
      </div>
    </div>
  );
}
