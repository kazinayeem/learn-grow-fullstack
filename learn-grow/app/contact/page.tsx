"use client";

import React from "react";
import { Spinner } from "@nextui-org/react";
import { defaultContactData } from "@/lib/contactData";
import ContactClient from "@/components/ContactClient";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

export default function ContactPage() {
    const { data: apiData, isLoading } = useGetSiteContentQuery("contact");

    // Use API data if available, otherwise default
    const content = (apiData?.data?.content && typeof apiData.data.content === "object" && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : defaultContactData;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading Contact info..." />
            </div>
        );
    }

    return <ContactClient content={content} />;
}
