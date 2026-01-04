"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide navbar and footer for admin, manager, and instructor dashboard routes
  const isDashboardRoute = pathname.startsWith("/admin") || 
                          pathname.startsWith("/instructor") ||
                          pathname.startsWith("/manager");

  return (
    <div className="relative flex flex-col min-h-screen">
      {!isDashboardRoute && <Navbar />}

      <main className="flex-grow">{children}</main>

      {!isDashboardRoute && <Footer />}
    </div>
  );
}
