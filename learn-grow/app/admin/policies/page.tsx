"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { Button, Card, CardBody, Chip, Input, Spinner, Tabs, Tab, Progress } from "@nextui-org/react";
import { useGetSiteContentQuery, useUpdateSiteContentMutation } from "@/redux/api/siteContentApi";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaGavel, FaFileContract, FaUndo, FaSave, FaPercentage, FaMoneyBillWave, FaShieldAlt } from "react-icons/fa";
import { apiRequest } from "@/lib/api";
import { toast } from "react-toastify";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="flex justify-center p-8"><Spinner label="Loading editor..." color="primary" /></div>
});

type PolicyKey = "privacy-policy" | "terms-of-use" | "refund-policy";

const POLICY_TABS: { key: PolicyKey; label: string; icon: React.ReactNode }[] = [
  { key: "privacy-policy", label: "Privacy Policy", icon: <FaShieldAlt /> },
  { key: "terms-of-use", label: "Terms & Conditions", icon: <FaFileContract /> },
  { key: "refund-policy", label: "Refund Policy", icon: <FaUndo /> },
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
    try {
      await updateContent({ page: active, content: html || "" }).unwrap();
      await refetch();
      toast.success("Policy updated successfully!");
    } catch (error) {
      toast.error("Failed to update policy");
    }
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
      toast.success("Commission rates updated!");
    } catch (error) {
      toast.error("Failed to update commission rates");
    } finally {
      setCommissionLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
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
            <FaGavel className="text-3xl sm:text-4xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Legal & Policies
            </h1>
            <p className="text-sm sm:text-base text-white/90 mt-1">
              Manage legal documents and platform financial policies
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content (Policies) */}
        <div className="w-full lg:w-3/4">
          <Card className="shadow-lg border border-gray-100 h-full">
            <CardBody className="p-0">
              <Tabs
                selectedKey={active}
                onSelectionChange={(k) => setActive(k as PolicyKey)}
                aria-label="Policies"
                color="secondary"
                variant="underlined"
                classNames={{
                  tabList: "p-4 border-b border-gray-100 flex-wrap",
                  cursor: "w-full bg-purple-600",
                  tab: "max-w-fit px-4 h-12",
                  tabContent: "group-data-[selected=true]:text-purple-600 font-bold text-base"
                }}
              >
                {POLICY_TABS.map(({ key, label, icon }) => (
                  <Tab
                    key={key}
                    title={
                      <div className="flex items-center space-x-2">
                        {icon}
                        <span>{label}</span>
                      </div>
                    }
                  >
                    <div className="p-6 pt-2">
                      {isLoading ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-3">
                          <Spinner size="lg" color="secondary" />
                          <p className="text-gray-500">Loading {label}...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <ReactQuill
                              theme="snow"
                              value={html}
                              onChange={setHtml}
                              placeholder="Enter policy content..."
                              className="min-h-[500px]"
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
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-2 text-sm text-purple-800">
                              <FaSave />
                              <span>Don't forget to save your changes to publish them live.</span>
                            </div>
                            <Button
                              color="secondary"
                              size="lg"
                              isLoading={isSaving}
                              onPress={handleSave}
                              className="font-bold shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 w-full sm:w-auto"
                              startContent={<FaSave />}
                            >
                              Save Policy
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Tab>
                ))}
              </Tabs>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar (Commission) */}
        <div className="w-full lg:w-1/4">
          <Card className="shadow-lg border border-gray-100 sticky top-6">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-lg shadow-md">
                  <FaMoneyBillWave size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Commission</h2>
              </div>

              {commissionLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="md" color="success" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-gray-600">Platform</span>
                      <span className="text-green-600">{platformCommission}%</span>
                    </div>
                    <Progress
                      aria-label="Commission"
                      value={platformCommission}
                      color="success"
                      size="md"
                      classNames={{ indicator: "bg-gradient-to-r from-green-500 to-emerald-600" }}
                    />
                  </div>

                  <div>
                    <Input
                      type="number"
                      label="Platform Fee (%)"
                      value={String(platformCommission)}
                      onChange={(e) => setPlatformCommission(Number(e.target.value))}
                      min={0}
                      max={100}
                      variant="bordered"
                      endContent={<FaPercentage className="text-gray-400" />}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Remaining <strong>{instructorPayout}%</strong> goes to instructor.
                    </p>
                  </div>

                  <Button
                    color="success"
                    onPress={saveCommission}
                    fullWidth
                    className="font-semibold text-white shadow-lg bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    Update Rates
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
