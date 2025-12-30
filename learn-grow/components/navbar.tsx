"use client";
import React from "react";
import clsx from "clsx";
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

const AuthButtons = ({ isScrolled }: { isScrolled: boolean }) => {
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
        className={clsx(
          "text-sm font-bold border-2 px-6 bg-transparent",
          isScrolled
            ? "text-white border-white/40 hover:bg-white/10"
            : "text-[#121064] border-[#121064]/40 hover:bg-[#121064]/5"
        )}
        href="/login"
        size="md"
        variant="bordered"
        radius="full"
      >
        লগইন
      </Button>
      <Button
        as={Link}
        className={clsx(
          "text-sm font-bold px-6",
          isScrolled
            ? "text-[#121064] bg-white hover:bg-white/90"
            : "text-white bg-[#121064] hover:bg-[#121064]/90"
        )}
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
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <NextUINavbar
      isBlurred={false}
      classNames={{
        base: clsx(
          "py-3 transition-all duration-300",
          isScrolled
            ? "bg-[#121064]/95 backdrop-blur-xl border-b border-white/20 shadow-lg"
            : "bg-transparent"
        ),
        wrapper: "bg-transparent",
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
            <p
              className={clsx(
                "font-bold text-base sm:text-lg tracking-wide",
                isScrolled ? "text-white" : "text-[#121064]"
              )}
            >
              {siteConfig.name}
            </p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-8 justify-start ml-16">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "text-[15px] font-semibold transition-all duration-200 px-1",
                  isScrolled
                    ? "text-white hover:text-white/90"
                    : "text-[#121064] hover:text-[#121064]/80"
                )}
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
          <AuthButtons isScrolled={isScrolled} />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden" justify="end">
        <NavbarMenuToggle
          className={clsx("ml-2", isScrolled ? "text-white" : "text-[#121064]")}
        />
      </NavbarContent>

      <NavbarMenu 
        className="pt-6" 
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
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
              className={clsx(
                "text-sm font-bold border-2 bg-transparent",
                isScrolled
                  ? "text-white border-white/40 hover:bg-white/10"
                  : "text-[#121064] border-[#121064]/40 hover:bg-[#121064]/5"
              )}
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
              className={clsx(
                "text-sm font-bold",
                isScrolled
                  ? "text-[#121064] bg-white hover:bg-white/90"
                  : "text-white bg-[#121064] hover:bg-[#121064]/90"
              )}
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
