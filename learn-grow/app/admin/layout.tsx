"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "instructor" | "student" | "guardian">("admin");

  useEffect(() => {
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!userStr) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(userStr);
      if (!user?.role || user.role !== "admin") {
        router.replace("/login");
        return;
      }

      setUserRole(user.role);
    } catch {}
    setChecking(false);
  }, []);

  if (checking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 shadow-lg z-50">
        <div className="px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-purple-100">Welcome, {userRole.replace("-", " ")}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex pt-20">
        {/* Sidebar */}
        <AdminSidebar userRole={userRole} />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
