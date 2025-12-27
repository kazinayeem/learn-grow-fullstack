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

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="relative flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow">{children}</main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}
