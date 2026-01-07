"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "manager" | "instructor" | "student" | "guardian">("admin");
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    try {
      // 🚨 Check if logout is in progress - if so, don't redirect yet
      const loggingOut = sessionStorage.getItem("loggingOut") === "1";
      if (loggingOut) {
        return;
      }

      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (!userStr) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(userStr);
      // Allow both admin and manager roles to access admin pages
      if (!user?.role || (user.role !== "admin" && user.role !== "manager")) {
        router.replace("/unauthorized");
        return;
      }

      setUserRole(user.role);
      setUserName(user.name || "Admin");
      setUserEmail(user.email || "");
      setProfileImage(user.profileImage || "");
    } catch {}
    setChecking(false);
  }, [router]);

  const handleLogout = async () => {
    // Set logout flag FIRST to prevent race conditions
    sessionStorage.setItem("loggingOut", "1");

    // Clear all auth data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    Cookies.remove("userRole", { path: "/" });
    Cookies.remove("token", { path: "/" });

    // Redirect to home page (not login) to avoid blinking
    router.replace("/");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
            <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              LG
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Welcome back, {userName}</p>
            </div>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <Chip 
              color={userRole === "admin" ? "primary" : "secondary"}
              variant="flat"
              size="sm"
              className="hidden sm:flex"
            >
              {userRole === "admin" ? "Admin" : "Manager"}
            </Chip>

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
                    className="ring-2 ring-primary-500"
                    isBordered
                    color="primary"
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500 capitalize">{userRole}</p>
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
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-64px)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
