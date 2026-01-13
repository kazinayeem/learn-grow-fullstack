"use client";

import React from "react";
import { Spinner } from "@nextui-org/react";
import { defaultAboutData } from "@/lib/aboutData";
import AboutClient from "@/components/AboutClient";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

export default function AboutPage() {
    const { data: apiData, isLoading } = useGetSiteContentQuery("about");

    // Use API data if available, otherwise default
    const content = (apiData?.data?.content && typeof apiData.data.content === "object" && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : defaultAboutData;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading About content..." />
            </div>
        );
    }

    return <AboutClient content={content} />;
}
