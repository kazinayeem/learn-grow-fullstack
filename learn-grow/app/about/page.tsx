import React from "react";
import { defaultAboutData } from "@/lib/aboutData";
import AboutClient from "@/components/AboutClient";

async function getAboutContent() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/site-content/about`, {
            cache: 'no-store', // SSR with fresh data
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
