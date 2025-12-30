import React from "react";
import { defaultAboutData } from "@/lib/aboutData";
import AboutClient from "@/components/AboutClient";

async function getAboutContent() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/site-content/about`, {
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
