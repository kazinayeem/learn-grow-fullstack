"use client";
import React from "react";
import { IoPersonAddSharp } from "react-icons/io5";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";
import Image from "next/image";

import { siteConfig } from "@/config/site";
import Logo from "@/public/logo.png";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Skeleton
} from "@nextui-org/react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { getDashboardUrl } from "@/lib/utils/dashboard";
import { logout as apiLogout } from "@/lib/auth";

const AuthButtons = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [dashboardUrl, setDashboardUrl] = React.useState("/dashboard");

  React.useEffect(() => {
    const syncAuth = () => {
      console.log("🔄 Navbar: Auth sync triggered");

      // 🚨 logout চললে কিছুই করো না
      const loggingOut = sessionStorage.getItem("loggingOut");
      console.log("🔄 Navbar: loggingOut flag =", loggingOut);

      if (loggingOut === "1") {
        console.log("🔄 Navbar: Logout in progress, stopping auth sync");
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const token = Cookies.get("accessToken");
      const user = localStorage.getItem("user");
      console.log("🔄 Navbar: token =", token ? "EXISTS" : "MISSING");
      console.log("🔄 Navbar: user =", user ? "EXISTS" : "MISSING");

      if (!token || !user) {
        console.log("🔄 Navbar: No auth data, setting unauthenticated");
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log("🔄 Navbar: Auth data found, setting authenticated");
      setIsAuthenticated(true);
      setUser(JSON.parse(user));
      setIsLoading(false);
    };


    syncAuth();
    // Listen for custom auth change event
    const onAuthChange = () => {
      console.log("🔄 Navbar: Auth change event received");
      syncAuth();
    };
    window.addEventListener("auth-change", onAuthChange);
    return () => {
      window.removeEventListener("auth-change", onAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    console.log("🚪 Navbar: Logout initiated");

    // Set logout flag FIRST
    sessionStorage.setItem("loggingOut", "1");
    console.log("🚪 Navbar: Set loggingOut flag");

    // Call API logout (don't wait for it)
    try {
      await apiLogout();
      console.log("🚪 Navbar: API logout successful");
    } catch (e) {
      console.log("🚪 Navbar: API logout failed (ignored):", e);
    }

    // Clear cookies
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    Cookies.remove("userRole", { path: "/" });
    console.log("🚪 Navbar: Cleared cookies");

    // Clear localStorage (minimal)
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    console.log("🚪 Navbar: Cleared localStorage");

    // Update local state
    setIsAuthenticated(false);
    setUser(null);
    console.log("🚪 Navbar: Updated local state");

    // Single redirect using router.replace (NO window.location.href)
    console.log("🚪 Navbar: Redirecting to /login");
    router.replace("/login");
  };


  if (isLoading) {
    return <Skeleton className="rounded-full w-10 h-10" />;
  }

  if (isAuthenticated) {
    return (
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            isBordered
            as="button"
            className="transition-transform"
            color="primary"
            name={user?.name || user?.email || user?.phone || "User"}
            size="sm"
            src={user?.profileImage || undefined}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownItem key="profile" className="h-14 gap-2">
            <p className="font-semibold">Signed in as</p>
            <p className="font-semibold">{user?.email || user?.phone || "User"}</p>
          </DropdownItem>
          <DropdownItem key="dashboard" onPress={() => router.push(dashboardUrl)}>
            Dashboard
          </DropdownItem>
          <DropdownItem key="settings" onPress={() => router.push("/profile")}>
            My Profile
          </DropdownItem>
          <DropdownItem key="logout" color="danger" onPress={handleLogout}>
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  // ... (previous imports remain, no change needed)

  return (
    <div className="flex gap-3 items-center">
      <Button
        as={Link}
        className="text-sm font-bold text-white border-2 border-white/40 hover:bg-white/10 px-6"
        style={{ backgroundColor: 'transparent' }}
        href="/login"
        size="md"
        variant="bordered"
        radius="full"
      >
        লগইন
      </Button>
      <Button
        as={Link}
        className="text-sm font-bold text-[#121064] bg-white hover:bg-white/90 px-6"
        href="/register"
        size="md"
        variant="solid"
        radius="full"
      >
        রেজিস্ট্রেশন
      </Button>
    </div>
  );
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <NextUINavbar
      className="py-3"
      style={{
        background: 'linear-gradient(135deg, #121064 0%, #1e1b8f 50%, #2d1ba8 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
      height="70px"
      maxWidth="xl"
      position="sticky"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-2 sm:gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2 sm:gap-3" href="/">
            <Image
              priority
              alt="Learn & Grow Logo"
              className="w-8 h-8 sm:w-11 sm:h-11 object-contain"
              src={Logo}
              width={44}
              height={44}
            />
            <p className="font-bold text-white text-base sm:text-lg tracking-wide">
              {siteConfig.name}
            </p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-8 justify-start ml-16">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className="text-white text-[15px] font-semibold hover:text-white/90 transition-all duration-200 px-1"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem>
          <AuthButtons />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden" justify="end">
        <NavbarMenuToggle className="text-white ml-2" />
      </NavbarContent>

      <NavbarMenu className="pt-6 bg-gradient-to-br from-[#121064] via-[#1e1b8f] to-[#2d1ba8]">
        {siteConfig.navItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`}>
            <NextLink
              className="w-full text-white text-lg font-semibold py-2 block"
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NextLink>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <div className="flex flex-col gap-3 mt-4 w-full">
            <Button
              as={NextLink}
              className="text-sm font-bold text-white border-2 border-white/40 hover:bg-white/10"
              style={{ backgroundColor: 'transparent' }}
              href="/login"
              size="lg"
              variant="bordered"
              radius="full"
              fullWidth
              onPress={() => setIsMenuOpen(false)}
            >
              লগইন
            </Button>
            <Button
              as={Link}
              className="text-sm font-bold text-[#121064] bg-white hover:bg-white/90"
              href="/register"
              size="lg"
              variant="solid"
              radius="full"
              fullWidth
              onPress={() => setIsMenuOpen(false)}
            >
              রেজিস্ট্রেশন
            </Button>
          </div>
        </NavbarMenuItem>
      </NavbarMenu>
    </NextUINavbar>
  );
};
