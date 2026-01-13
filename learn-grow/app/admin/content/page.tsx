"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Tabs,
  Tab,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaUsers,
  FaFileAlt,
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEnvelope,
} from "react-icons/fa";
import { defaultTeamData } from "@/lib/teamData";
import { defaultBlogData } from "@/lib/blogData";
import { defaultEventsData } from "@/lib/eventsData";
import { defaultPressData } from "@/lib/pressData";
import { defaultContactData } from "@/lib/contactData";
import { defaultEducatorsData } from "@/lib/educatorsData";
import { defaultCareersData } from "@/lib/careersData";
import { defaultAboutData } from "@/lib/aboutData";
import {
  useGetSiteContentQuery,
  useUpdateSiteContentMutation,
} from "@/redux/api/siteContentApi";
import "react-quill-new/dist/quill.snow.css";
import TeamManagementTab from "@/components/admin/TeamManagementTab";
import AboutPageTab from "@/components/admin/AboutPageTab";
import ContactPageTab from "@/components/admin/ContactPageTab";
import toast from "react-hot-toast";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-10">
      <Spinner label="Loading editor..." color="primary" />
    </div>
  ),
});

// Color configuration for different content sections
const SECTION_COLORS: Record<string, any> = {
  "Privacy Policy": { bg: "from-blue-50 to-indigo-50", border: "border-blue-200", text: "text-blue-700", icon: "🛡️" },
  "Terms & Conditions": { bg: "from-purple-50 to-pink-50", border: "border-purple-200", text: "text-purple-700", icon: "📜" },
  "Refund Policy": { bg: "from-green-50 to-emerald-50", border: "border-green-200", text: "text-green-700", icon: "💸" },
  "Cookie Policy": { bg: "from-amber-50 to-yellow-50", border: "border-amber-200", text: "text-amber-700", icon: "🍪" },
};

// Map UI names to API page keys and default data
const SECTIONS = {
 
  "Privacy Policy": { key: "privacy-policy", default: "" },
  "Terms & Conditions": { key: "terms-of-use", default: "" },
  "Refund Policy": { key: "refund-policy", default: "" },
  "Cookie Policy": { key: "cookie-policy", default: "" },
};

export default function ContentManagerPage() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState("Team");
  const [richValue, setRichValue] = useState<string>("");

  const sectionConfig = SECTIONS[selectedSection as keyof typeof SECTIONS];
  const sectionKey = sectionConfig?.key || "team";
  const defaultData = sectionConfig?.default || "";
  const colors = SECTION_COLORS[
    selectedSection as keyof typeof SECTION_COLORS
  ] || {
    bg: "from-gray-50 to-slate-50",
    border: "border-gray-200",
    text: "text-gray-700",
    icon: "📄",
  };

  // Fetch content from API
  const {
    data: apiData,
    isLoading,
    refetch,
  } = useGetSiteContentQuery(sectionKey);
  const [updateContent, { isLoading: isSaving }] =
    useUpdateSiteContentMutation();

  // Load content when data arrives or section changes
  useEffect(() => {
    if (isLoading) {
      setRichValue("<p>Loading...</p>");
      return;
    }

    const contentFromApi = apiData?.data?.content;

        // ALWAYS show default data if database is empty or returns null/undefined
        const hasValidContent = contentFromApi && (
            (typeof contentFromApi === "string" && contentFromApi.trim() !== "") ||
            (typeof contentFromApi === "object" && Object.keys(contentFromApi).length > 0)
        );

        if (hasValidContent) {
            // Database has content - use it
            if (typeof contentFromApi === "string") {
                setRichValue(contentFromApi);
            } else if (typeof contentFromApi === "object") {
                // Convert JSON to formatted HTML for editing
                setRichValue(`<pre>${JSON.stringify(contentFromApi, null, 2)}</pre>`);
            }
        } else {
            // Database is empty - use default data (NEVER show blank page)
            if (typeof defaultData === "string") {
                setRichValue(defaultData || "<p>No default content available for this section.</p>");
            } else if (typeof defaultData === "object" && defaultData !== null) {
                // Convert default JSON to formatted HTML
                setRichValue(`<pre>${JSON.stringify(defaultData, null, 2)}</pre>`);
            } else {
                // Fallback if no default data exists
                setRichValue("<p>No content available. Please add content and save.</p>");
            }
        }
    }, [apiData, selectedSection, isLoading, defaultData]);

  const handleSave = async () => {
    try {
      const payload = {
        page: sectionKey,
        content: richValue || "",
      };

      await updateContent(payload).unwrap();
      toast.success("Saved content successfully!");
      refetch(); // Refresh data
    } catch (e: any) {
      toast.error(`Save failed: ${e.message || "Unknown error"}`);
    }
  };

  const handleReset = () => {
    if (
      !confirm("Are you sure? This will revert to the original default content.")
    )
      return;

    if (typeof defaultData === "string") {
      setRichValue(defaultData || "<p>No default content available.</p>");
    } else if (typeof defaultData === "object" && defaultData !== null) {
      setRichValue(`<pre>${JSON.stringify(defaultData, null, 2)}</pre>`);
    } else {
      setRichValue("<p>No default content available for this section.</p>");
    }
    toast("Reset to defaults. Click 'Save' to apply.", { icon: "⚠️" });
  };

  return (
    <div className="w-full min-h-screen px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Header with Gradient */}
      <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push("/admin")}
          className="mb-3 sm:mb-4 text-white hover:bg-white/20 min-h-[44px]"
          size="lg"
        >
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-white/20 p-3 sm:p-4 rounded-xl backdrop-blur-sm">
            <FaFileAlt className="text-2xl sm:text-3xl lg:text-4xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Site Content Manager (CMS)
            </h1>
            <p className="text-sm sm:text-base text-white/90 mt-1">
              Manage team members, pages, and rich text content
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 overflow-hidden w-full">
        <Tabs
          aria-label="Content Manager Options"
          color="primary"
          variant="underlined"
          classNames={{
            tabList:
              "gap-2 sm:gap-4 lg:gap-6 w-full relative rounded-none p-0 border-b border-divider overflow-x-auto",
            cursor: "w-full bg-blue-600",
            tab: "max-w-fit px-3 sm:px-4 lg:px-6 h-12 sm:h-14 text-sm sm:text-base",
            tabContent:
              "group-data-[selected=true]:text-blue-600 font-semibold text-sm sm:text-base lg:text-lg",
          }}
        >
          <Tab
            key="content"
            title={
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FaFileAlt className="text-sm sm:text-base" />
                <span className="hidden sm:inline">Pages & Content</span>
                <span className="sm:hidden">Pages</span>
              </div>
            }
          >
            <div className="p-3 sm:p-4 lg:p-6 xl:p-8 w-full">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block w-full lg:w-1/4 lg:min-w-[250px] shrink-0">
                  <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden sticky top-6">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">
                      Select Page
                    </div>
                    <div className="flex flex-col max-h-[calc(100vh-250px)] overflow-y-auto">
                      {Object.keys(SECTIONS).map((section) => {
                        const sectionColors = SECTION_COLORS[
                          section as keyof typeof SECTION_COLORS
                        ] || { text: "text-gray-700", icon: "📄" };
                        const isSelected = selectedSection === section;
                        return (
                          <button
                            key={section}
                            onClick={() => setSelectedSection(section)}
                            className={`p-4 text-left font-medium transition-all flex items-center gap-3 border-l-4 ${
                              isSelected
                                ? `bg-blue-50 border-blue-600 text-blue-700 shadow-inner`
                                : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <span className="text-xl">
                              {sectionColors.icon}
                            </span>
                            {section}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sidebar - Mobile Dropdown */}
                <div className="lg:hidden w-full">
                  <Select
                    label="Select Page to Edit"
                    selectedKeys={[selectedSection]}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    size="lg"
                    variant="bordered"
                    startContent={<FaFileAlt className="text-gray-400" />}
                    classNames={{
                      trigger: "min-h-[56px] border-2 bg-white",
                    }}
                  >
                    {Object.keys(SECTIONS).map((section) => (
                      <SelectItem
                        key={section}
                        value={section}
                        textValue={section}
                      >
                        {SECTION_COLORS[section]?.icon} {section}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Editor Area */}
                <div className="flex-1 w-full min-w-0">
                  <Card className={`border-2 shadow-sm ${colors.border}`}>
                    <CardBody
                      className={`p-0 bg-gradient-to-br ${colors.bg} bg-opacity-30`}
                    >
                      <div className="p-4 sm:p-6 border-b border-gray-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm">
                        <div>
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold bg-white shadow-sm border ${colors.border} ${colors.text} mb-2`}
                          >
                            <span>{colors.icon}</span>
                            {selectedSection}
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Rich Text Editor
                          </h2>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <Button
                            color="danger"
                            variant="flat"
                            onPress={handleReset}
                            isDisabled={isSaving}
                            startContent={<FaUndo />}
                            className="flex-1 sm:flex-initial"
                          >
                            Reset
                          </Button>
                          <Button
                            color="primary"
                            onPress={handleSave}
                            isLoading={isSaving}
                            startContent={<FaSave />}
                            className="flex-1 sm:flex-initial shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6">
                        {isLoading ? (
                          <div className="h-96 flex flex-col items-center justify-center text-gray-500 gap-4">
                            <Spinner size="lg" color="primary" />
                            <p>Loading {selectedSection} content...</p>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                            <ReactQuill
                              theme="snow"
                              value={richValue}
                              onChange={setRichValue}
                              placeholder="Enter content here or use default content..."
                              className="h-full min-h-[450px]"
                              modules={{
                                toolbar: [
                                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                                  ["bold", "italic", "underline", "strike"],
                                  [{ color: [] }, { background: [] }],
                                  [{ list: "ordered" }, { list: "bullet" }],
                                  [{ script: "sub" }, { script: "super" }],
                                  [{ indent: "-1" }, { indent: "+1" }],
                                  ["blockquote", "code-block"],
                                  ["link", "image", "video"],
                                  ["clean"],
                                ],
                              }}
                            />
                          </div>
                        )}

                        {!isLoading && !apiData?.data?.content && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                            <span className="text-lg">ℹ️</span>
                            <div>
                              <strong>Default Content Loaded:</strong> The database has no saved content for this page, so default content is displayed. Click "Save Changes" to store this content in the database.
                            </div>
                          </div>
                        )}

                        <p className="mt-4 text-xs text-gray-500 inline-flex items-center gap-2 bg-white/50 p-2 rounded-lg border border-gray-200">
                          💡 <strong>Tip:</strong> Use the toolbar to add
                          formatted text, images, and links. Content is saved as
                          HTML.
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </div>
          </Tab>

          <Tab
            key="about"
            title={
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FaFileAlt className="text-sm sm:text-base" />
                <span className="hidden sm:inline">About Page</span>
                <span className="sm:hidden">About</span>
              </div>
            }
          >
            <div className="p-3 sm:p-4 lg:p-6 xl:p-8 w-full">
              <AboutPageTab />
            </div>
          </Tab>

          <Tab
            key="contact"
            title={
              <div className="flex items-center space-x-1 sm:space-x-2">
                <FaEnvelope className="text-sm sm:text-base" />
                <span className="hidden sm:inline">Contact Page</span>
                <span className="sm:hidden">Contact</span>
              </div>
            }
          >
            <div className="p-3 sm:p-4 lg:p-6 xl:p-8 w-full">
              <ContactPageTab />
            </div>
          </Tab>
        
        </Tabs>
      </div>
    </div>
  );
}
