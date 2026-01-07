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
  Button 
} from "@nextui-org/react";
import { FaHome, FaUser, FaSignOutAlt, FaBars } from "react-icons/fa";
import Cookies from "js-cookie";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "manager" | "instructor" | "student" | "guardian">("manager");
  const [userName, setUserName] = useState("Manager");
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
      if (!user?.role || !["admin", "manager"].includes(user.role)) {
        router.replace("/login");
        return;
      }

      setUserRole(user.role);
      setUserName(user.name || "Manager");
      setUserEmail(user.email || "");
      setProfileImage(user.profileImage || "");
    } catch {}
    setChecking(false);
  }, [router]);

  const handleLogout = async () => {
    // Set logout flag FIRST
    sessionStorage.setItem("loggingOut", "1");

    // Clear cookies
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    Cookies.remove("userRole", { path: "/" });

    // Clear localStorage (minimal)
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
    }

    // Single redirect using router.replace to home page (not login) to avoid blinking
    router.replace("/");
  };

  if (checking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg z-50">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold">Manager Dashboard</h1>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Go to Main Site Button */}
              <Button
                size="sm"
                variant="light"
                className="hidden sm:flex text-white hover:bg-white/20"
                startContent={<FaHome />}
                onPress={() => router.push("/")}
              >
                Main Site
              </Button>
              
              <Button
                size="sm"
                isIconOnly
                variant="light"
                className="sm:hidden text-white"
                onPress={() => router.push("/")}
              >
                <FaHome className="text-lg" />
              </Button>

              {/* User Profile Dropdown */}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <div className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-white/10 rounded-lg px-2 sm:px-3 py-1.5 transition-all">
                    <Avatar
                      src={profileImage}
                      name={userName}
                      size="sm"
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    />
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-semibold">{userName}</p>
                      <p className="text-xs text-green-200">{userRole}</p>
                    </div>
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold text-primary">{userEmail}</p>
                  </DropdownItem>
                  <DropdownItem 
                    key="manager-profile" 
                    startContent={<FaUser />}
                    onPress={() => router.push("/profile")}
                  >
                    My Profile
                  </DropdownItem>
                  <DropdownItem 
                    key="main-site" 
                    startContent={<FaHome />}
                    className="md:hidden"
                    onPress={() => router.push("/")}
                  >
                    Go to Main Site
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
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex pt-20">
        {/* Sidebar */}
        <AdminSidebar />

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
