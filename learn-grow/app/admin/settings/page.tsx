"use client";

import { Card, CardBody, Button, Input, Spinner, Checkbox } from "@nextui-org/react";
import {
  useGetCommissionQuery,
  useUpdateCommissionMutation,
  useGetSMTPConfigQuery,
  useUpdateSMTPConfigMutation,
  useTestSMTPConnectionMutation,
} from "@/redux/api/settingsApi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetCommissionQuery();
  const [updateCommission, { isLoading: saving }] = useUpdateCommissionMutation();
  const [commission, setCommission] = useState<number>(20);
  const payout = Math.max(0, 100 - (Number.isFinite(commission) ? commission : 0));

  // SMTP state
  const { data: smtpData, isLoading: smtpLoading, refetch: smtpRefetch } = useGetSMTPConfigQuery();
  const [updateSMTP, { isLoading: smtpSaving }] = useUpdateSMTPConfigMutation();
  const [testSMTP, { isLoading: smtpTesting }] = useTestSMTPConnectionMutation();
  const [smtp, setSMTP] = useState({
    host: "",
    port: 587,
    secure: false,
    user: "",
    password: "",
    fromName: "",
    fromEmail: "",
    replyTo: "",
  });
  const [testEmail, setTestEmail] = useState("");
  const [smtpSource, setSMTPSource] = useState("");

  useEffect(() => {
    if (data?.data?.platformCommissionPercent != null) {
      setCommission(data.data.platformCommissionPercent);
    }
  }, [data]);

  useEffect(() => {
    if (smtpData?.data) {
      setSMTP({
        host: smtpData.data.host,
        port: smtpData.data.port,
        secure: smtpData.data.secure,
        user: smtpData.data.user,
        password: "",
        fromName: smtpData.data.fromName,
        fromEmail: smtpData.data.fromEmail,
        replyTo: smtpData.data.replyTo || "",
      });
      setSMTPSource(smtpData.data.source || "");
    }
  }, [smtpData]);

  const handleSave = async () => {
    try {
      await updateCommission({ platformCommissionPercent: Number(commission) || 0 }).unwrap();
      await refetch();
      toast.success("Commission settings updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update commission settings");
    }
  };

  const handleSMTPSave = async () => {
    try {
      const payload: any = {
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        user: smtp.user,
        fromName: smtp.fromName,
        fromEmail: smtp.fromEmail,
      };
      if (smtp.password) payload.password = smtp.password;
      if (smtp.replyTo) payload.replyTo = smtp.replyTo;

      await updateSMTP(payload).unwrap();
      await smtpRefetch();
      setSMTP((prev) => ({ ...prev, password: "" }));
      toast.success("SMTP settings updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update SMTP settings");
    }
  };

  const handleTestSMTP = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }
    try {
      const result = await testSMTP({ testEmail }).unwrap();
      toast.success(result.message || "Test email sent successfully");
      setTestEmail("");
    } catch (error: any) {
      toast.error(error?.data?.message || "SMTP test failed");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.push("/admin")}
        >
          Back
        </Button>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
      </div>

      {/* Commission Settings */}
      <Card className="mb-6">
        <CardBody className="space-y-4">
          <h2 className="text-xl font-semibold">Commission</h2>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Spinner label="Loading settings..." />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Platform Commission (%)"
                  value={String(commission)}
                  onChange={(e) => setCommission(Math.min(100, Math.max(0, Number(e.target.value))))}
                />
                <Input isReadOnly label="Instructor Payout (%)" value={`${payout}`} />
              </div>
              <div className="text-sm text-gray-500">Range 0–100. Payout = 100 - Commission.</div>
              <Button color="primary" onPress={handleSave} isLoading={saving}>
                Save Commission
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* SMTP Settings */}
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">SMTP Email Configuration</h2>
            {smtpSource && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Source: {smtpSource}
              </span>
            )}
          </div>
          {smtpLoading ? (
            <div className="h-60 flex items-center justify-center">
              <Spinner label="Loading SMTP settings..." />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="SMTP Host"
                  placeholder="smtp.gmail.com"
                  value={smtp.host}
                  onChange={(e) => setSMTP({ ...smtp, host: e.target.value })}
                />
                <Input
                  type="number"
                  label="SMTP Port"
                  placeholder="587"
                  value={String(smtp.port)}
                  onChange={(e) => setSMTP({ ...smtp, port: Number(e.target.value) })}
                />
              </div>
              <Checkbox
                isSelected={smtp.secure}
                onValueChange={(checked) => setSMTP({ ...smtp, secure: checked })}
              >
                Use Secure Connection (TLS/SSL)
              </Checkbox>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="SMTP Username"
                  placeholder="user@example.com"
                  value={smtp.user}
                  onChange={(e) => setSMTP({ ...smtp, user: e.target.value })}
                />
                <Input
                  type="password"
                  label="SMTP Password"
                  placeholder="Leave blank to keep current"
                  value={smtp.password}
                  onChange={(e) => setSMTP({ ...smtp, password: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="From Name"
                  placeholder="Learn & Grow"
                  value={smtp.fromName}
                  onChange={(e) => setSMTP({ ...smtp, fromName: e.target.value })}
                />
                <Input
                  type="email"
                  label="From Email"
                  placeholder="noreply@example.com"
                  value={smtp.fromEmail}
                  onChange={(e) => setSMTP({ ...smtp, fromEmail: e.target.value })}
                />
              </div>
              <Input
                type="email"
                label="Reply-To Email (Optional)"
                placeholder="support@example.com"
                value={smtp.replyTo}
                onChange={(e) => setSMTP({ ...smtp, replyTo: e.target.value })}
              />
              <div className="pt-2 space-y-2">
                <Button color="primary" onPress={handleSMTPSave} isLoading={smtpSaving}>
                  Save SMTP Settings
                </Button>
              </div>

              {/* Test SMTP */}
              <div className="pt-4 border-t">
                <h3 className="text-md font-semibold mb-3">Test SMTP Connection</h3>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    color="secondary"
                    onPress={handleTestSMTP}
                    isLoading={smtpTesting}
                  >
                    Send Test Email
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Sends a test email to verify SMTP configuration is working correctly.
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
