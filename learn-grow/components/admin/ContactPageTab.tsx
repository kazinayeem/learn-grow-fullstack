"use client";

import React, { useState, useEffect } from "react";
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
import { FaSave, FaUndo } from "react-icons/fa";
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from "@/redux/api/siteContentApi";
import { defaultContactData } from "@/lib/contactData";
import toast from "react-hot-toast";

interface ContactData {
  hero: {
    title: string;
    subtitle: string;
    tag: string;
  };
  info: {
    email: string;
    phone: string;
    address: string;
  };
  form: {
    title: string;
    btnText: string;
  };
}

export default function ContactPageTab() {
  const [contactData, setContactData] = useState<ContactData>(defaultContactData);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: apiData, isLoading } = useGetSiteContentQuery("contact");
  const [updateContent] = useUpdateSiteContentMutation();

  // Load content from API
  useEffect(() => {
    if (apiData?.data?.content && typeof apiData.data.content === "object") {
      setContactData(apiData.data.content);
      setHasChanges(false);
    }
  }, [apiData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateContent({
        page: "contact",
        content: contactData,
      }).unwrap();
      toast.success("Contact page updated successfully!");
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default content?")) {
      setContactData(defaultContactData);
      setHasChanges(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Loading Contact page content..." color="primary" />
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
      <Card className="shadow-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Hero Section</h2>
          <div className="space-y-4">
            <Input
              label="Tag"
              placeholder="e.g., Contact"
              value={contactData.hero.tag}
              onChange={(e) => {
                setContactData({
                  ...contactData,
                  hero: { ...contactData.hero, tag: e.target.value },
                });
                setHasChanges(true);
              }}
              size="lg"
              variant="bordered"
            />
            <Input
              label="Hero Title"
              placeholder="Enter hero title"
              value={contactData.hero.title}
              onChange={(e) => {
                setContactData({
                  ...contactData,
                  hero: { ...contactData.hero, title: e.target.value },
                });
                setHasChanges(true);
              }}
              size="lg"
              variant="bordered"
            />
            <Textarea
              label="Hero Subtitle"
              placeholder="Enter hero subtitle"
              value={contactData.hero.subtitle}
              onChange={(e) => {
                setContactData({
                  ...contactData,
                  hero: { ...contactData.hero, subtitle: e.target.value },
                });
                setHasChanges(true);
              }}
              minRows={2}
              variant="bordered"
            />
          </div>
        </CardBody>
      </Card>

      {/* Contact Info Section */}
      <Card className="shadow-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Contact Information</h2>
          <div className="space-y-4">
            <Input
              label="Email"
              placeholder="info@example.com"
              type="email"
              value={contactData.info.email}
              onChange={(e) => {
                setContactData({
                  ...contactData,
                  info: { ...contactData.info, email: e.target.value },
                });
                setHasChanges(true);
              }}
              size="lg"
              variant="bordered"
            />
            <Input
              label="Phone Number"
              placeholder="+1 234 567 8900"
              value={contactData.info.phone}
              onChange={(e) => {
                setContactData({
                  ...contactData,
                  info: { ...contactData.info, phone: e.target.value },
                });
                setHasChanges(true);
              }}
              size="lg"
              variant="bordered"
            />
            <Textarea
              label="Address"
              placeholder="123 Main St, City, Country"
              value={contactData.info.address}
              onChange={(e) => {
                setContactData({
                  ...contactData,
                  info: { ...contactData.info, address: e.target.value },
                });
                setHasChanges(true);
              }}
              minRows={3}
              variant="bordered"
            />
          </div>
        </CardBody>
      </Card>

      {/* Form Section */}
      <Card className="shadow-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardBody className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-purple-700">Contact Form</h2>
          <div className="space-y-4">
            <Input
              label="Form Title"
              placeholder="e.g., Send us a Message"
              value={contactData.form.title}
              onChange={(e) => {
                setContactData({
                  ...contactData,
                  form: { ...contactData.form, title: e.target.value },
                });
                setHasChanges(true);
              }}
              size="lg"
              variant="bordered"
            />
            <Input
              label="Form Button Text"
              placeholder="e.g., Send Message"
              value={contactData.form.btnText}
              onChange={(e) => {
                setContactData({
                  ...contactData,
                  form: { ...contactData.form, btnText: e.target.value },
                });
                setHasChanges(true);
              }}
              size="lg"
              variant="bordered"
            />
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
