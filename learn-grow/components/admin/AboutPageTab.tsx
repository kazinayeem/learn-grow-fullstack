"use client";

import  { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Divider,
  Spinner,
  Alert,
} from "@nextui-org/react";
import { FaSave, FaUndo, FaPlus, FaTrash } from "react-icons/fa";
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from "@/redux/api/siteContentApi";
import { defaultAboutData } from "@/lib/aboutData";
import toast from "react-hot-toast";

interface AboutData {
  hero: {
    title: string;
    subtitle: string;
  };
  mission: {
    title: string;
    image: string;
    p1: string;
    p2: string;
  };
  features: Array<{
    title: string;
    desc: string;
    icon: string;
  }>;
}

export default function AboutPageTab() {
  const [aboutData, setAboutData] = useState<AboutData>(defaultAboutData);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: apiData, isLoading } = useGetSiteContentQuery("about");
  const [updateContent] = useUpdateSiteContentMutation();

  // Load content from API
  useEffect(() => {
    if (apiData?.data?.content && typeof apiData.data.content === "object") {
      // Create a deep copy to avoid read-only issues
      const content = JSON.parse(JSON.stringify(apiData.data.content));
      // Ensure features array has proper structure
      if (content.features && Array.isArray(content.features)) {
        content.features = content.features.map((f: any) => ({
          icon: f.icon || "",
          title: f.title || "",
          desc: f.desc || f.description || "",
        }));
      }
      setAboutData(content);
      setHasChanges(false);
    }
  }, [apiData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateContent({
        page: "about",
        content: aboutData,
      }).unwrap();
      toast.success("About page updated successfully!");
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default content?")) {
      setAboutData(defaultAboutData);
      setHasChanges(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Loading About page content..." color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert for changes */}
      {hasChanges && (
        <Alert color="warning" title="You have unsaved changes" />
      )}

      {/* Hero Section */}
      <Card className="shadow-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-orange-700">Hero Section</h2>
          <div className="space-y-4">
            <Input
              label="Hero Title"
              placeholder="Enter hero title"
              value={aboutData.hero.title}
              onChange={(e) => {
                setAboutData({
                  ...aboutData,
                  hero: { ...aboutData.hero, title: e.target.value },
                });
                setHasChanges(true);
              }}
              size="lg"
              variant="bordered"
            />
            <Textarea
              label="Hero Subtitle"
              placeholder="Enter hero subtitle"
              value={aboutData.hero.subtitle}
              onChange={(e) => {
                setAboutData({
                  ...aboutData,
                  hero: { ...aboutData.hero, subtitle: e.target.value },
                });
                setHasChanges(true);
              }}
              minRows={2}
              variant="bordered"
            />
          </div>
        </CardBody>
      </Card>

      {/* Mission Section */}
      <Card className="shadow-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-700">Mission Section</h2>
          <div className="space-y-4">
            <Input
              label="Mission Title"
              placeholder="Enter mission title"
              value={aboutData.mission.title}
              onChange={(e) => {
                setAboutData({
                  ...aboutData,
                  mission: { ...aboutData.mission, title: e.target.value },
                });
                setHasChanges(true);
              }}
              size="lg"
              variant="bordered"
            />
            <Input
              label="Mission Image URL"
              placeholder="https://example.com/image.jpg"
              value={aboutData.mission.image}
              onChange={(e) => {
                setAboutData({
                  ...aboutData,
                  mission: { ...aboutData.mission, image: e.target.value },
                });
                setHasChanges(true);
              }}
              size="lg"
              variant="bordered"
            />
            <Textarea
              label="Mission Paragraph 1"
              placeholder="Enter first paragraph"
              value={aboutData.mission.p1}
              onChange={(e) => {
                setAboutData({
                  ...aboutData,
                  mission: { ...aboutData.mission, p1: e.target.value },
                });
                setHasChanges(true);
              }}
              minRows={3}
              variant="bordered"
            />
            <Textarea
              label="Mission Paragraph 2"
              placeholder="Enter second paragraph"
              value={aboutData.mission.p2}
              onChange={(e) => {
                setAboutData({
                  ...aboutData,
                  mission: { ...aboutData.mission, p2: e.target.value },
                });
                setHasChanges(true);
              }}
              minRows={3}
              variant="bordered"
            />
          </div>
        </CardBody>
      </Card>

      {/* Features Section */}
      <Card className="shadow-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-700">Features</h2>
            <Button
              isIconOnly
              color="success"
              variant="flat"
              startContent={<FaPlus />}
              onPress={() => {
                setAboutData({
                  ...aboutData,
                  features: [
                    ...aboutData.features,
                    { title: "", desc: "", icon: "✨" },
                  ],
                });
                setHasChanges(true);
              }}
              title="Add new feature"
            />
          </div>

          <div className="space-y-4">
            {aboutData.features.map((feature, index) => (
              <div key={index}>
                <Card className="bg-white border border-gray-200 hover:border-green-300 transition-colors">
                  <CardBody className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 space-y-3 min-w-0">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Icon/Emoji</label>
                          <Input
                            placeholder="👨‍🏫 (paste emoji or text)"
                            value={feature.icon}
                            onChange={(e) => {
                              const newFeatures = [...aboutData.features];
                              newFeatures[index].icon = e.target.value;
                              setAboutData({ ...aboutData, features: newFeatures });
                              setHasChanges(true);
                            }}
                            size="sm"
                            variant="bordered"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Feature Title</label>
                          <Input
                            placeholder="Enter feature title"
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...aboutData.features];
                              newFeatures[index].title = e.target.value;
                              setAboutData({ ...aboutData, features: newFeatures });
                              setHasChanges(true);
                            }}
                            size="sm"
                            variant="bordered"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">Feature Description</label>
                          <Textarea
                            placeholder="Enter feature description"
                            value={feature.desc}
                            onChange={(e) => {
                              const newFeatures = [...aboutData.features];
                              newFeatures[index].desc = e.target.value;
                              setAboutData({ ...aboutData, features: newFeatures });
                              setHasChanges(true);
                            }}
                            minRows={3}
                            variant="bordered"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="flex lg:flex-col justify-end">
                        <Button
                          isIconOnly
                          color="danger"
                          variant="flat"
                          startContent={<FaTrash />}
                          onPress={() => {
                            const newFeatures = aboutData.features.filter(
                              (_, i) => i !== index
                            );
                            setAboutData({ ...aboutData, features: newFeatures });
                            setHasChanges(true);
                          }}
                          title="Delete feature"
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Divider />

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <Button
          color="warning"
          variant="flat"
          startContent={<FaUndo />}
          onPress={handleReset}
          size="lg"
          className="min-h-[44px] font-semibold"
        >
          Reset to Default
        </Button>
        <Button
          color="success"
          startContent={<FaSave />}
          onPress={handleSave}
          isLoading={isSaving}
          isDisabled={!hasChanges || isSaving}
          size="lg"
          className="flex-1 min-h-[44px] font-semibold"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
