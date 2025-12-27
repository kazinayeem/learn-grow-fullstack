"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, Textarea, Spinner } from "@nextui-org/react";
import { defaultTeamData } from "@/lib/teamData";
import { defaultBlogData } from "@/lib/blogData";
import { defaultEventsData } from "@/lib/eventsData";
import { defaultPressData } from "@/lib/pressData";
import { defaultContactData } from "@/lib/contactData";
import { defaultEducatorsData } from "@/lib/educatorsData";
import { defaultCareersData } from "@/lib/careersData";
import { defaultAboutData } from "@/lib/aboutData";
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from "@/redux/api/siteContentApi";

// Map UI names to API page keys and default data
const SECTIONS = {
    "About Page": { key: "about", default: defaultAboutData },
    "Team Page": { key: "team", default: defaultTeamData },
    "Blog Page": { key: "blog", default: defaultBlogData },
    "Events Page": { key: "events", default: defaultEventsData },
    "Press Page": { key: "press", default: defaultPressData },
    "Contact Page": { key: "contact", default: defaultContactData },
    "Careers Page": { key: "careers", default: defaultCareersData },
    "Educators (Homepage)": { key: "educators", default: defaultEducatorsData },
};

export default function ContentManagerPage() {
    const [selectedSection, setSelectedSection] = useState("Team Page");
    const [jsonContent, setJsonContent] = useState("");
    const [status, setStatus] = useState("");

    const sectionKey = SECTIONS[selectedSection as keyof typeof SECTIONS].key;
    const defaultData = SECTIONS[selectedSection as keyof typeof SECTIONS].default;

    // Fetch content from API
    const { data: apiData, isLoading, isError, refetch } = useGetSiteContentQuery(sectionKey);
    const [updateContent, { isLoading: isSaving }] = useUpdateSiteContentMutation();

    // Load content when data arrives or section changes
    useEffect(() => {
        if (isLoading) {
            setJsonContent("Loading...");
            return;
        }

        if (apiData?.data?.content && Object.keys(apiData.data.content).length > 0) {
            // Found in Database
            setJsonContent(JSON.stringify(apiData.data.content, null, 4));
        } else {
            // Not in DB, use default static data
            setJsonContent(JSON.stringify(defaultData, null, 4));
        }
        setStatus("");
    }, [apiData, selectedSection, isLoading]);

    const handleSave = async () => {
        try {
            const parsed = JSON.parse(jsonContent); // Validate JSON
            await updateContent({
                page: sectionKey,
                content: parsed
            }).unwrap();

            setStatus("✅ Saved to Database successfully! Updates are live.");
            refetch(); // Refresh data
        } catch (e: any) {
            if (e instanceof SyntaxError) {
                setStatus("❌ Invalid JSON! Please check your syntax.");
            } else {
                setStatus(`❌ Save failed: ${e.message || "Unknown error"}`);
            }
        }
    };

    const handleReset = () => {
        if (!confirm("Are you sure? This will revert to the original code defaults.")) return;
        setJsonContent(JSON.stringify(defaultData, null, 4));
        setStatus("⚠️ Reset to defaults. Click 'Save' to apply.");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Site Content Manager (CMS)</h1>
                <p className="mb-6 text-gray-600">
                    Edit the content for your website pages. Changes are saved to the database.
                </p>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar / Tabs */}
                    <div className="w-full md:w-1/4">
                        <Card>
                            <CardBody className="p-0">
                                <div className="flex flex-col">
                                    {Object.keys(SECTIONS).map((section) => (
                                        <button
                                            key={section}
                                            onClick={() => setSelectedSection(section)}
                                            className={`p-4 text-left font-semibold border-b last:border-b-0 hover:bg-gray-100 transition-colors ${selectedSection === section ? "bg-primary-50 text-primary border-l-4 border-l-primary" : "text-gray-700"
                                                }`}
                                        >
                                            {section}
                                        </button>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Editor */}
                    <div className="w-full md:w-3/4">
                        <Card>
                            <CardBody className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Editing: {selectedSection}</h2>
                                    <div className="flex gap-2">
                                        <Button color="danger" variant="light" onPress={handleReset} isDisabled={isSaving}>
                                            Reset Default
                                        </Button>
                                        <Button color="primary" onPress={handleSave} isLoading={isSaving}>
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>

                                {status && (
                                    <div className={`p-3 mb-4 rounded-lg text-sm font-semibold ${status.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {status}
                                    </div>
                                )}

                                {isLoading ? (
                                    <div className="h-96 flex items-center justify-center">
                                        <Spinner size="lg" label="Loading content..." />
                                    </div>
                                ) : (
                                    <Textarea
                                        minRows={20}
                                        maxRows={40}
                                        value={jsonContent}
                                        onChange={(e) => setJsonContent(e.target.value)}
                                        className="font-mono text-sm"
                                        placeholder="Content JSON"
                                        variant="bordered"
                                    />
                                )}

                                <p className="mt-4 text-xs text-gray-400">
                                    * Ensure you maintain valid JSON format. (Don't miss commas or quotes!)
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
