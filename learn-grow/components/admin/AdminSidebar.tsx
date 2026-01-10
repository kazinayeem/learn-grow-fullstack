"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, Tooltip } from "@nextui-org/react";
import {
  FaHome,
  FaTicketAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaUserTie,
  FaBook,
  FaVideo,
  FaChartBar,
  FaCog,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaBlog,
  FaCreditCard,
  FaFileAlt,
  FaCalendarAlt,
  FaBriefcase,
  FaShieldAlt,
  FaQuestionCircle,
  FaUserPlus,
  FaUserShield,
  FaEnvelope,
} from "react-icons/fa";

interface NavItem {
  label: string;
  icon: any;
  href: string;
  badge?: number;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems: NavItem[] = [
    { label: "Dashboard", icon: FaHome, href: "/admin" },
    { label: "Tickets", icon: FaTicketAlt, href: "/admin/tickets" },
    { label: "Contacts", icon: FaEnvelope, href: "/admin/contacts" },
    { label: "Students", icon: FaUsers, href: "/admin/students" },
    { label: "Instructors", icon: FaChalkboardTeacher, href: "/admin/instructors" },
    { label: "Managers", icon: FaUserTie, href: "/admin/managers" },
    { label: "Users", icon: FaUserShield, href: "/admin/users" },
    { label: "Guests", icon: FaUserPlus, href: "/admin/guests" },
    { label: "Courses", icon: FaBook, href: "/admin/courses" },
    { label: "Combos", icon: FaShoppingCart, href: "/admin/combos" },
    { label: "Orders", icon: FaShoppingCart, href: "/admin/orders" },
    { label: "Payment Methods", icon: FaCreditCard, href: "/admin/payment-methods" },
    { label: "Live Classes", icon: FaVideo, href: "/admin/live-classes" },
    { label: "Events", icon: FaCalendarAlt, href: "/admin/events" },
    { label: "Jobs", icon: FaBriefcase, href: "/admin/jobs" },
    { label: "Blogs", icon: FaBlog, href: "/admin/blog" },
    { label: "Site Content", icon: FaFileAlt, href: "/admin/content" },

    { label: "Team Management", icon: FaUsers, href: "/admin/team-management" },
    { label: "Analytics", icon: FaChartBar, href: "/admin/analytics" },
    { label: "Settings", icon: FaCog, href: "/admin/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary-500 text-white p-3 rounded-lg shadow-lg hover:bg-primary-600 transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Desktop Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex fixed left-2 top-1/2 -translate-y-1/2 z-50 bg-white border-2 border-gray-200 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
        style={{ left: isCollapsed ? "70px" : "250px" }}
        aria-label="Toggle sidebar width"
      >
        {isCollapsed ? (
          <FaChevronRight className="text-gray-600" />
        ) : (
          <FaChevronLeft className="text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } w-64 flex flex-col shadow-xl lg:shadow-none`}
      >
        {/* Sidebar Header */}
        <div className={`p-4 border-b border-gray-200 flex items-center justify-between ${
          isCollapsed ? "lg:justify-center" : ""
        }`}>
          <div className={`flex items-center gap-2 ${
            isCollapsed ? "lg:hidden" : ""
          }`}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              LG
            </div>
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
          <div className={isCollapsed ? "lg:block" : "lg:hidden"}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              LG
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
            aria-label="Close sidebar"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            const NavLink = (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all cursor-pointer group relative ${
                    active
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                      : "hover:bg-gray-100 text-gray-700 hover:text-primary-600"
                  } ${
                    isCollapsed ? "lg:justify-center" : ""
                  }`}
                >
                  <Icon className={`text-xl flex-shrink-0 ${
                    active ? "" : "group-hover:scale-110 transition-transform"
                  }`} />
                  <span className={`font-medium flex-1 ${
                    isCollapsed ? "lg:hidden" : ""
                  }`}>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge
                      content={item.badge}
                      color="danger"
                      size="sm"
                      className={`${
                        active ? "bg-white text-primary-500 font-semibold" : ""
                      } ${
                        isCollapsed ? "lg:text-[10px] lg:min-w-[20px] lg:h-5" : ""
                      }`}
                    >
                      <span className={`${
                        isCollapsed ? "lg:absolute lg:top-1 lg:right-1 lg:w-5 lg:h-5 lg:flex lg:items-center lg:justify-center" : ""
                      }`} />
                    </Badge>
                  )}
                </div>
              </Link>
            );

            // Wrap with tooltip only for collapsed state on desktop
            return isCollapsed ? (
              <Tooltip
                key={item.href}
                content={item.label}
                placement="right"
                className="lg:block hidden"
                delay={0}
              >
                {NavLink}
              </Tooltip>
            ) : (
              NavLink
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t border-gray-200 ${
          isCollapsed ? "lg:hidden" : ""
        }`}>
          <div className="text-xs text-gray-500 text-center">
            <p>Learn & Grow</p>
            <p className="text-[10px] mt-1">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
