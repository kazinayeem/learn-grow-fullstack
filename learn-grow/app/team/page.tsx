"use client";

import React from "react";
import { Spinner } from "@nextui-org/react";
import { defaultTeamData } from "@/lib/teamData";
import TeamClient from "@/components/TeamClient";
import { useGetSiteContentQuery } from "@/redux/api/siteContentApi";

export default function TeamPage() {
    const { data: apiData, isLoading } = useGetSiteContentQuery("team");

    // Use API data if available, otherwise default
    const content = (apiData?.data?.content && typeof apiData.data.content === "object" && Object.keys(apiData.data.content).length > 0)
        ? apiData.data.content
        : defaultTeamData;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" label="Loading team members..." />
            </div>
        );
    }

    return <TeamClient content={content} />;
}
