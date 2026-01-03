"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { Button, Card, CardBody, Chip, Input, Spinner, Tabs, Tab } from "@nextui-org/react";
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from "@/redux/api/siteContentApi";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { apiRequest } from "@/lib/api";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

type PolicyKey = "privacy-policy" | "terms-of-use" | "refund-policy";

const POLICY_TABS: { key: PolicyKey; label: string }[] = [
  { key: "privacy-policy", label: "Privacy Policy" },
  { key: "terms-of-use", label: "Terms & Conditions" },
  { key: "refund-policy", label: "Refund Policy" },
];

export default function PoliciesAdminPage() {
  const router = useRouter();
  const [active, setActive] = useState<PolicyKey>("privacy-policy");
  const { data, isLoading, refetch } = useGetSiteContentQuery(active);
  const [updateContent, { isLoading: isSaving }] = useUpdateSiteContentMutation();
  const [html, setHtml] = useState<string>("");
  const contentFromApi = data?.data?.content;

  useEffect(() => {
    if (typeof contentFromApi === "string") setHtml(contentFromApi);
    else if (contentFromApi && typeof contentFromApi === "object") setHtml("");
    else setHtml("");
  }, [active, contentFromApi]);

  const handleSave = async () => {
    await updateContent({ page: active, content: html || "" }).unwrap();
    await refetch();
  };

  // Commission section
  const [commissionLoading, setCommissionLoading] = useState(true);
  const [platformCommission, setPlatformCommission] = useState<number>(20);
  const instructorPayout = useMemo(() => Math.max(0, 100 - (platformCommission || 0)), [platformCommission]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiRequest.get<{ success: boolean; data?: { platformCommissionPercent: number; instructorPayoutPercent: number } }>("/settings/commission");
        if (mounted && res?.success && res.data) setPlatformCommission(res.data.platformCommissionPercent);
      } finally {
        if (mounted) setCommissionLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const saveCommission = async () => {
    setCommissionLoading(true);
    try {
      await apiRequest.patch("/settings/commission", { platformCommissionPercent: platformCommission });
    } finally {
      setCommissionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="light" 
            startContent={<FaArrowLeft />}
            onPress={() => router.push("/admin")}
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold">Legal & Settings</h1>
        </div>
        <p className="text-gray-600">Manage Legal Policies with a rich text editor and platform commission.</p>

        <Card>
          <CardBody>
            <Tabs selectedKey={active} onSelectionChange={(k) => setActive(k as PolicyKey)} aria-label="Policies">
              {POLICY_TABS.map(({ key, label }) => (
                <Tab key={key} title={label}>
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center"><Spinner label={`Loading ${label}...`} /></div>
                  ) : (
                    <div className="space-y-4">
                      <ReactQuill 
                        theme="snow" 
                        value={html} 
                        onChange={setHtml}
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ color: [] }, { background: [] }],
                            ["blockquote", "code-block"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ script: "sub" }, { script: "super" }],
                            [{ indent: "-1" }, { indent: "+1" }],
                            ["link", "image", "video"],
                            ["clean"],
                          ],
                        }}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button color="primary" isLoading={isSaving} onPress={handleSave}>Save</Button>
                        <Chip variant="flat" color="secondary">SSR pages render from DB</Chip>
                      </div>
                    </div>
                  )}
                </Tab>
              ))}
            </Tabs>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-xl font-semibold">Commission Setting</h2>
            <p className="text-gray-600">Define platform commission; instructor payout is computed automatically.</p>
            {commissionLoading ? (
              <Spinner size="sm" label="Loading commission..." />
            ) : (
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                <Input
                  type="number"
                  label="Platform Commission (%)"
                  value={String(platformCommission)}
                  onChange={(e) => setPlatformCommission(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="max-w-xs"
                />
                <Chip color="success" variant="flat">Instructor Payout: {instructorPayout}%</Chip>
                <Button color="primary" onPress={saveCommission}>Save Commission</Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
