"use client";

import React, { useEffect, useState } from "react";
import InstructorSidebar from "@/components/instructor/InstructorSidebar";
import { useRouter } from "next/navigation";
import { 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem, 
  Avatar, 
  Button,
  Chip
} from "@nextui-org/react";
import { FaHome, FaUser, FaSignOutAlt, FaBell } from "react-icons/fa";
import Cookies from "js-cookie";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userName, setUserName] = useState("Instructor");
  const [userEmail, setUserEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isApproved, setIsApproved] = useState(true);

  useEffect(() => {
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!userStr) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(userStr);
      if (!user?.role || user.role !== "instructor") {
        router.replace("/unauthorized");
        return;
      }

      setUserName(user.name || "Instructor");
      setUserEmail(user.email || "");
      setProfileImage(user.profileImage || "");
      setIsApproved(user.isApproved !== undefined ? user.isApproved : true);
    } catch {}
    setChecking(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    Cookies.remove("token");
    router.push("/login");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Left Section - Logo for mobile */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              LG
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-800">Instructor Dashboard</h1>
              <p className="text-xs text-gray-500">Welcome back, {userName}</p>
            </div>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-3">
            {/* Approval Status */}
            {!isApproved && (
              <Chip 
                color="warning" 
                variant="flat"
                size="sm"
                className="hidden sm:flex"
              >
                Pending Approval
              </Chip>
            )}

            {/* Notifications */}
            <Button
              isIconOnly
              variant="light"
              className="text-gray-600"
              aria-label="Notifications"
            >
              <FaBell className="text-xl" />
            </Button>

            {/* User Dropdown */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Avatar
                    src={profileImage}
                    name={userName}
                    size="sm"
                    className="ring-2 ring-green-500"
                    isBordered
                    color="success"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500">Instructor</p>
                  </div>
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem
                  key="profile"
                  startContent={<FaUser />}
                  onPress={() => router.push("/profile")}
                >
                  My Profile
                </DropdownItem>
                <DropdownItem
                  key="home"
                  startContent={<FaHome />}
                  onPress={() => router.push("/")}
                >
                  Go to Home
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<FaSignOutAlt />}
                  onPress={handleLogout}
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar */}
        <InstructorSidebar />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-64px)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
