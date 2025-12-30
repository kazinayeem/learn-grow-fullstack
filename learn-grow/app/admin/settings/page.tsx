"use client";

import { Card, CardBody, Button, Input, Spinner } from "@nextui-org/react";
import { useGetCommissionQuery, useUpdateCommissionMutation } from "@/redux/api/settingsApi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetCommissionQuery();
  const [updateCommission, { isLoading: saving }] = useUpdateCommissionMutation();
  const [commission, setCommission] = useState<number>(20);
  const payout = Math.max(0, 100 - (Number.isFinite(commission) ? commission : 0));

  useEffect(() => {
    if (data?.data?.platformCommissionPercent != null) {
      setCommission(data.data.platformCommissionPercent);
    }
  }, [data]);

  const handleSave = async () => {
    await updateCommission({ platformCommissionPercent: Number(commission) || 0 }).unwrap();
    await refetch();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="light"
          startContent={<FaArrowLeft />}
          onPress={() => router.back()}
        >
          Back
        </Button>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
      </div>
      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-xl font-semibold">Commission</h2>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center"><Spinner label="Loading settings..." /></div>
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
              <Button color="primary" onPress={handleSave} isLoading={saving}>Save</Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
