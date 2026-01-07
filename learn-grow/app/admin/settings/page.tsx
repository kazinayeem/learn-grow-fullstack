"use client";

import { Card, CardBody, Button, Input, Spinner, Checkbox, Progress, Chip, Tabs, Tab } from "@nextui-org/react";
import {
  useGetCommissionQuery,
  useUpdateCommissionMutation,
  useGetSMTPConfigQuery,
  useUpdateSMTPConfigMutation,
  useTestSMTPConnectionMutation,
} from "@/redux/api/settingsApi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCogs,
  FaPercentage,
  FaEnvelope,
  FaServer,
  FaLock,
  FaUser,
  FaPaperPlane,
  FaShieldAlt,
  FaWallet,
  FaGlobe
} from "react-icons/fa";
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
      {/* Header with Gradient */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-2xl p-6 sm:p-8 text-white shadow-xl">
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
            <FaCogs className="text-3xl sm:text-4xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Platform Settings
            </h1>
            <p className="text-sm sm:text-base text-white/90 mt-1">
              Configure commission rates, email (SMTP) settings, and more
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px]">
        <Tabs
          aria-label="Settings Tabs"
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider px-6 pt-4",
            cursor: "w-full bg-blue-600",
            tab: "max-w-fit px-4 h-14",
            tabContent: "group-data-[selected=true]:text-blue-600 font-bold text-lg"
          }}
        >
          <Tab
            key="finance"
            title={
              <div className="flex items-center space-x-2">
                <FaWallet className="text-purple-600" />
                <span>Finance & Commission</span>
              </div>
            }
          >
            <div className="p-6 sm:p-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                  <FaPercentage size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Commission Structure</h2>
                  <p className="text-gray-500">Manage how revenue is split between the platform and instructors</p>
                </div>
              </div>

              {isLoading ? (
                <div className="h-60 flex items-center justify-center">
                  <Spinner size="lg" label="Loading financial settings..." />
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100">
                    <div className="flex justify-between mb-4 font-bold text-lg">
                      <span className="text-purple-700">Platform Share: {commission}%</span>
                      <span className="text-green-700">Instructor Share: {payout}%</span>
                    </div>
                    <Progress
                      size="lg"
                      radius="lg"
                      classNames={{
                        track: "drop-shadow-sm border border-purple-200 bg-white h-4",
                        indicator: "bg-gradient-to-r from-purple-600 to-indigo-600 h-4",
                      }}
                      value={commission}
                      aria-label="Commission split"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium px-1">
                      <span>Platform keeps this amount</span>
                      <span>Instructor receives this amount</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="number"
                      label="Platform Commission (%)"
                      value={String(commission)}
                      onChange={(e) => setCommission(Math.min(100, Math.max(0, Number(e.target.value))))}
                      variant="bordered"
                      size="lg"
                      description="Enter percentage (0-100)"
                      startContent={<FaPercentage className="text-gray-400" />}
                      classNames={{
                        inputWrapper: "border-2 border-gray-200 hover:border-purple-500 focus-within:border-purple-600"
                      }}
                    />
                    <Input
                      isReadOnly
                      label="Instructor Payout (%)"
                      value={`${payout}`}
                      variant="flat"
                      size="lg"
                      className="opacity-90"
                      startContent={<FaWallet className="text-green-600" />}
                      classNames={{
                        inputWrapper: "bg-green-50 border-2 border-green-200"
                      }}
                    />
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
                    <FaGlobe className="text-xl shrink-0 mt-0.5" />
                    <div>
                      <strong>Global Policy:</strong> This commission rate applies to all course sales unless overridden by specific instructor agreements. Changes take effect immediately for new transactions.
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      color="secondary"
                      onPress={handleSave}
                      isLoading={saving}
                      size="lg"
                      className="font-bold shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 min-w-[200px]"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Tab>

          <Tab
            key="smtp"
            title={
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-blue-600" />
                <span>Email Configuration (SMTP)</span>
              </div>
            }
          >
            <div className="p-6 sm:p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <FaServer size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">SMTP Server</h2>
                    <p className="text-gray-500">Configure outbound email delivery settings</p>
                  </div>
                </div>
                {smtpSource && (
                  <Chip size="md" variant="flat" color="primary" startContent={<FaGlobe size={12} />}>
                    Source: {smtpSource}
                  </Chip>
                )}
              </div>

              {smtpLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Spinner size="lg" label="Loading SMTP settings..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Server Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                          label="SMTP Host"
                          placeholder="smtp.gmail.com"
                          value={smtp.host}
                          onChange={(e) => setSMTP({ ...smtp, host: e.target.value })}
                          variant="bordered"
                          size="lg"
                          classNames={{ inputWrapper: "border-gray-300" }}
                        />
                        <Input
                          type="number"
                          label="SMTP Port"
                          placeholder="587"
                          value={String(smtp.port)}
                          onChange={(e) => setSMTP({ ...smtp, port: Number(e.target.value) })}
                          variant="bordered"
                          size="lg"
                          classNames={{ inputWrapper: "border-gray-300" }}
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
                        <Checkbox
                          isSelected={smtp.secure}
                          onValueChange={(checked) => setSMTP({ ...smtp, secure: checked })}
                          size="lg"
                          color="primary"
                        >
                          <span className="font-semibold text-gray-700 ml-2">Use Secure Connection (TLS/SSL)</span>
                        </Checkbox>
                        <p className="text-xs text-gray-500 ml-9 mt-1">Recommended for production environments</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Authentication
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                          label="SMTP Username"
                          placeholder="user@example.com"
                          value={smtp.user}
                          onChange={(e) => setSMTP({ ...smtp, user: e.target.value })}
                          variant="bordered"
                          size="lg"
                          startContent={<FaUser className="text-gray-400" />}
                          classNames={{ inputWrapper: "border-gray-300" }}
                        />
                        <Input
                          type="password"
                          label="SMTP Password"
                          placeholder="Leave blank to keep"
                          value={smtp.password}
                          onChange={(e) => setSMTP({ ...smtp, password: e.target.value })}
                          variant="bordered"
                          size="lg"
                          startContent={<FaLock className="text-gray-400" />}
                          classNames={{ inputWrapper: "border-gray-300" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Sender Info
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                          label="From Name"
                          placeholder="Learn & Grow"
                          value={smtp.fromName}
                          onChange={(e) => setSMTP({ ...smtp, fromName: e.target.value })}
                          variant="bordered"
                          size="lg"
                          classNames={{ inputWrapper: "border-gray-300" }}
                        />
                        <Input
                          type="email"
                          label="From Email"
                          placeholder="noreply@example.com"
                          value={smtp.fromEmail}
                          onChange={(e) => setSMTP({ ...smtp, fromEmail: e.target.value })}
                          variant="bordered"
                          size="lg"
                          classNames={{ inputWrapper: "border-gray-300" }}
                        />
                      </div>
                      <Input
                        type="email"
                        label="Reply-To Email (Optional)"
                        placeholder="support@example.com"
                        value={smtp.replyTo}
                        onChange={(e) => setSMTP({ ...smtp, replyTo: e.target.value })}
                        variant="bordered"
                        size="lg"
                        classNames={{ inputWrapper: "border-gray-300" }}
                      />
                    </div>

                    <Button
                      color="primary"
                      onPress={handleSMTPSave}
                      isLoading={smtpSaving}
                      size="lg"
                      className="font-bold shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 min-w-[200px]"
                    >
                      Save Configuration
                    </Button>
                  </div>

                  {/* Right Column: Test Panel */}
                  <div className="lg:col-span-1">
                    <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-100 shadow-none sticky top-6">
                      <CardBody className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                          <FaShieldAlt className="text-green-600" />
                          Connection Test
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Send a test email to verify that your SMTP settings are correct before saving.
                        </p>

                        <div className="space-y-4">
                          <Input
                            type="email"
                            label="Recipient Email"
                            placeholder="you@example.com"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            variant="flat"
                            classNames={{
                              inputWrapper: "bg-white border border-gray-200"
                            }}
                          />
                          <Button
                            color="secondary"
                            variant="flat"
                            onPress={handleTestSMTP}
                            isLoading={smtpTesting}
                            fullWidth
                            className="font-semibold bg-white border border-purple-200 hover:bg-purple-50 text-purple-700"
                            startContent={<FaPaperPlane />}
                          >
                            Send Test Email
                          </Button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
                          <p className="font-semibold text-gray-700 mb-1">Troubleshooting:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Check if your firewall blocks the port.</li>
                            <li>Ensure "Less Secure Apps" is allowed if using Gmail.</li>
                            <li>Verify credentials carefully.</li>
                          </ul>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
