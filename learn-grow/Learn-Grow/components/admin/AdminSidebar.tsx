"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@nextui-org/react";

interface AdminSidebarProps {
  userRole?: "admin" | "instructor" | "student" | "guardian";
}

export default function AdminSidebar({ userRole = "admin" }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = [
      { name: "Dashboard", href: "/admin", icon: "📊", roles: ["admin", "instructor", "student", "guardian"] },
      { name: "Courses", href: "/admin/courses", icon: "📚", roles: ["admin", "instructor"] },
      { name: "Users", href: "/admin/users", icon: "👥", roles: ["admin"] },
      { name: "Live Classes", href: "/admin/live-classes", icon: "🎥", roles: ["admin", "instructor"] },
      { name: "Quizzes", href: "/admin/quizzes", icon: "📝", roles: ["admin", "instructor"] },
      { name: "Jobs", href: "/admin/jobs", icon: "💼", roles: ["admin"] },
      { name: "Analytics", href: "/admin/analytics", icon: "📈", roles: ["admin", "instructor"] },
      { name: "Settings", href: "/admin/settings", icon: "⚙️", roles: ["admin"] },
      // Student/Guardian specific helpers (can map to different pages if needed)
      { name: "My Courses", href: "/dashboard/my-courses", icon: "🎓", roles: ["student", "guardian"] },
      { name: "Progress", href: "/dashboard/progress", icon: "📈", roles: ["student", "guardian"] },
    ];

    return baseItems.filter((item) => item.roles.includes(userRole));
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "admin":
        return "Super Admin";
      case "instructor":
        return "Instructor";
      case "student":
        return "Student";
      case "guardian":
        return "Guardian";
      default:
        return "Admin";
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case "admin":
        return "from-purple-600 to-indigo-600";
      case "instructor":
        return "from-blue-600 to-cyan-600";
      case "student":
        return "from-green-600 to-emerald-600";
      case "guardian":
        return "from-amber-600 to-orange-600";
      default:
        return "from-gray-600 to-gray-700";
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <Button
          isIconOnly
          className="bg-slate-900 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30 top-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-20 left-0 h-[calc(100vh-80px)] w-64 bg-slate-900 text-white shadow-xl transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:relative lg:top-0 lg:h-auto overflow-y-auto`}
      >
        {/* Sidebar Header */}
        <div className={`bg-gradient-to-r ${getRoleColor()} p-6 border-b border-slate-700`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Learn Grow</h2>
              <p className="text-sm text-slate-200 mt-1">{getRoleLabel()}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-white text-2xl hover:bg-white/20 p-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
              {isActive(item.href) && (
                <span className="ml-auto w-2 h-2 rounded-full bg-white"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 p-6 bg-slate-950">
          <div className="space-y-3">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
            >
              <span className="text-lg">👤</span>
              <span className="text-sm font-medium">Profile</span>
            </Link>
            <Link
              href="/logout"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
            >
              <span className="text-lg">🚪</span>
              <span className="text-sm font-medium">Logout</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Desktop Spacer */}
      <div className="hidden lg:block w-64"></div>
    </>
  );
}
