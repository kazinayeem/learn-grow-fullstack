import React from "react";
import AccessDurationManager from "@/components/admin/AccessDurationManager";

export const metadata = {
  title: "Access Duration Manager | Admin | Learn Grow",
  description: "Manage student course access durations.",
};

export default function AccessManagementPage() {
  return (
    <div className="min-h-screen bg-default-50">
      <div className="container mx-auto px-4 py-8">
        <AccessDurationManager />
      </div>
    </div>
  );
}
