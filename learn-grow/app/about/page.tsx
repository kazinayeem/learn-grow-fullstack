import React from "react";
import { Metadata } from "next";
import { defaultAboutData } from "@/lib/aboutData";
import AboutClient from "@/components/AboutClient";

export const metadata: Metadata = {
  title: "About Us - Leading Robotics & STEM Education Provider",
  description: "Learn about Learn & Grow Academy - our mission to revolutionize STEM education through expert robotics courses, innovative teaching methods, and hands-on learning experiences for students worldwide.",
  keywords: [
    "about Learn and Grow",
    "STEM education mission",
    "robotics education provider",
    "educational technology",
    "learning platform",
    "robotics academy"
  ],
  openGraph: {
    title: "About Learn & Grow - Transforming STEM Education",
    description: "Discover our mission, vision, and commitment to delivering quality robotics and STEM education to learners of all ages.",
    url: "https://learnandgrow.io/about",
    type: "website",
    images: [
      {
        url: "https://learnandgrow.io/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "About Learn & Grow",
      },
    ],
  },
  alternates: {
    canonical: "https://learnandgrow.io/about",
  },
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
