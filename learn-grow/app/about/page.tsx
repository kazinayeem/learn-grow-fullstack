import React from "react";
import { Metadata } from "next";
import { defaultAboutData } from "@/lib/aboutData";
import AboutClient from "@/components/AboutClient";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about Learn Grow - our mission, vision, and commitment to quality STEM education.",
};

async function getAboutContent() {
    try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://learnandgrow.io/api";
        const res = await fetch(`${apiBase}/site-content/about`, {
            // Allow ISR so /about can be pre-rendered
            next: { revalidate: 3600 },
        });
        if (!res.ok) return defaultAboutData;
        const data = await res.json();
        return data?.data?.content || defaultAboutData;
    } catch (error) {
        console.error("Failed to fetch about content:", error);
        return defaultAboutData;
    }
}

export default async function AboutPage() {
    const content = await getAboutContent();
    return <AboutClient content={content} />;
}
