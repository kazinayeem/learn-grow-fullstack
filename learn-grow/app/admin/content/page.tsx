"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button, Card, CardBody, Spinner, Tabs, Tab } from "@nextui-org/react";
import { defaultTeamData } from "@/lib/teamData";
import { defaultBlogData } from "@/lib/blogData";
import { defaultEventsData } from "@/lib/eventsData";
import { defaultPressData } from "@/lib/pressData";
import { defaultContactData } from "@/lib/contactData";
import { defaultEducatorsData } from "@/lib/educatorsData";
import { defaultCareersData } from "@/lib/careersData";
import { defaultAboutData } from "@/lib/aboutData";
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from "@/redux/api/siteContentApi";
import "react-quill-new/dist/quill.snow.css";
import TeamManagementTab from "@/components/admin/TeamManagementTab";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-10">
      <Spinner label="Loading editor..." />
    </div>
  ),
});

// Color configuration for different content sections
const SECTION_COLORS = {
  "Privacy Policy": { bg: "bg-blue-50", border: "border-blue-200", label: "bg-blue-100 text-blue-700" },
  "Terms & Conditions": { bg: "bg-purple-50", border: "border-purple-200", label: "bg-purple-100 text-purple-700" },
  "Refund Policy": { bg: "bg-green-50", border: "border-green-200", label: "bg-green-100 text-green-700" },
  "About Page": { bg: "bg-orange-50", border: "border-orange-200", label: "bg-orange-100 text-orange-700" },
  "Blog Page": { bg: "bg-pink-50", border: "border-pink-200", label: "bg-pink-100 text-pink-700" },
  "Events Page": { bg: "bg-cyan-50", border: "border-cyan-200", label: "bg-cyan-100 text-cyan-700" },
  "Press Page": { bg: "bg-indigo-50", border: "border-indigo-200", label: "bg-indigo-100 text-indigo-700" },
  "Contact Page": { bg: "bg-amber-50", border: "border-amber-200", label: "bg-amber-100 text-amber-700" },
  "Careers Page": { bg: "bg-emerald-50", border: "border-emerald-200", label: "bg-emerald-100 text-emerald-700" },
  "Educators (Homepage)": { bg: "bg-rose-50", border: "border-rose-200", label: "bg-rose-100 text-rose-700" },
};

// Map UI names to API page keys and default data (non-team content)
const SECTIONS = {
    "About Page": { key: "about", default: defaultAboutData },
    "Blog Page": { key: "blog", default: defaultBlogData },
    "Events Page": { key: "events", default: defaultEventsData },
    "Press Page": { key: "press", default: defaultPressData },
    "Contact Page": { key: "contact", default: defaultContactData },
    "Careers Page": { key: "careers", default: defaultCareersData },
    "Educators (Homepage)": { key: "educators", default: defaultEducatorsData },
    // Policy pages - rich text HTML
    "Privacy Policy": { key: "privacy-policy", default: "" },
    "Terms & Conditions": { key: "terms-of-use", default: "" },
    "Refund Policy": { key: "refund-policy", default: "" },
};

export default function ContentManagerPage() {
    const [selectedSection, setSelectedSection] = useState("About Page");
    const [richValue, setRichValue] = useState<string>("");
    const [status, setStatus] = useState("");

    const sectionKey = SECTIONS[selectedSection as keyof typeof SECTIONS].key;
    const defaultData = SECTIONS[selectedSection as keyof typeof SECTIONS].default;
    const colors = SECTION_COLORS[selectedSection as keyof typeof SECTION_COLORS] || { 
      bg: "bg-gray-50", 
      border: "border-gray-200", 
      label: "bg-gray-100 text-gray-700" 
    };

    // Fetch content from API
    const { data: apiData, isLoading, isError, refetch } = useGetSiteContentQuery(sectionKey);
    const [updateContent, { isLoading: isSaving }] = useUpdateSiteContentMutation();

    // Load content when data arrives or section changes
    useEffect(() => {
        if (isLoading) {
            setRichValue("<p>Loading...</p>");
            return;
        }
        
        const contentFromApi = apiData?.data?.content;
        
        // For all sections, convert to HTML string
        if (contentFromApi) {
            if (typeof contentFromApi === "string") {
                setRichValue(contentFromApi);
            } else if (typeof contentFromApi === "object") {
                // Convert JSON to formatted HTML for editing
                setRichValue(`<pre>${JSON.stringify(contentFromApi, null, 2)}</pre>`);
            } else {
                setRichValue("");
            }
        } else {
            // Use default data
            if (typeof defaultData === "string") {
                setRichValue(defaultData);
            } else {
                setRichValue(`<pre>${JSON.stringify(defaultData, null, 2)}</pre>`);
            }
        }
        setStatus("");
    }, [apiData, selectedSection, isLoading]);

    const handleSave = async () => {
        try {
            const payload = { 
                page: sectionKey, 
                content: richValue || "" 
            };
            
            await updateContent(payload).unwrap();
            setStatus("✅ Saved to Database successfully! Updates are live.");
            refetch(); // Refresh data
        } catch (e: any) {
            setStatus(`❌ Save failed: ${e.message || "Unknown error"}`);
        }
    };

    const handleReset = () => {
        if (!confirm("Are you sure? This will revert to the original code defaults.")) return;
        
        if (typeof defaultData === "string") {
            setRichValue(defaultData);
        } else {
            setRichValue(`<pre>${JSON.stringify(defaultData, null, 2)}</pre>`);
        }
        setStatus("⚠️ Reset to defaults. Click 'Save' to apply.");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Site Content Manager (CMS)</h1>
                <p className="mb-6 text-gray-600">
                    Manage team members, pages, and rich text content for your website.
                </p>

                <Tabs color="primary" aria-label="Content Manager Tabs" size="lg">
                    {/* Team Management Tab */}
                    <Tab key="team" title="👥 Team Members">
                        <TeamManagementTab />
                    </Tab>

                    {/* Rich Text Content Tab */}
                    <Tab key="content" title="📝 Pages & Content">
                        <div className="mt-6">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Sidebar / Section List */}
                                <div className="w-full lg:w-1/4">
                                    <Card>
                                        <CardBody className="p-0">
                                            <div className="flex flex-col">
                                                {Object.keys(SECTIONS).map((section) => {
                                                    const sectionColors = SECTION_COLORS[section as keyof typeof SECTION_COLORS];
                                                    return (
                                                        <button
                                                            key={section}
                                                            onClick={() => setSelectedSection(section)}
                                                            className={`p-4 text-left font-semibold border-b last:border-b-0 hover:bg-opacity-80 transition-all ${
                                                                selectedSection === section 
                                                                    ? `${sectionColors.label} border-l-4 border-l-primary` 
                                                                    : "text-gray-700 hover:bg-gray-100"
                                                            }`}
                                                        >
                                                            {section}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>

                                {/* Editor */}
                                <div className="w-full lg:w-3/4">
                                    <Card className={`border-2 ${colors.border}`}>
                                        <CardBody className={`p-6 ${colors.bg}`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors.label} mb-2`}>
                                                        {selectedSection}
                                                    </span>
                                                    <h2 className="text-2xl font-bold text-gray-800">Rich Text Editor</h2>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button color="danger" variant="light" onPress={handleReset} isDisabled={isSaving} size="sm">
                                                        Reset
                                                    </Button>
                                                    <Button color="primary" onPress={handleSave} isLoading={isSaving} size="sm">
                                                        Save
                                                    </Button>
                                                </div>
                                            </div>

                                            {status && (
                                                <div className={`p-3 mb-4 rounded-lg text-sm font-semibold border ${status.startsWith("✅") ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}`}>
                                                    {status}
                                                </div>
                                            )}

                                            {isLoading ? (
                                                <div className="h-96 flex items-center justify-center">
                                                    <Spinner size="lg" label="Loading content..." />
                                                </div>
                                            ) : (
                                                <div className="min-h-[500px]">
                                                    <ReactQuill 
                                                        theme="snow" 
                                                        value={richValue} 
                                                        onChange={setRichValue} 
                                                        placeholder="Enter content here..."
                                                        className="bg-white rounded-lg"
                                                        modules={{
                                                            toolbar: [
                                                                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                                                                ['bold', 'italic', 'underline', 'strike'],
                                                                [{ color: [] }, { background: [] }],
                                                                [{ list: 'ordered' }, { list: 'bullet' }],
                                                                ['blockquote', 'code-block'],
                                                                ['link', 'image'],
                                                                ['clean']
                                                            ]
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <p className="mt-4 text-xs text-gray-500">
                                                💡 Tip: Use the toolbar to add colors, backgrounds, formatting, and styles. All content is saved as HTML.
                                            </p>
                                        </CardBody>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}

