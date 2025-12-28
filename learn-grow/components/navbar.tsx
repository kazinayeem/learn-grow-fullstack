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
    const syncAuth = async () => {
      const tokenFromCookie = Cookies.get("accessToken");
      const tokenFromStorage = localStorage.getItem("token");
      const token = tokenFromCookie || tokenFromStorage;

      const userData = localStorage.getItem("user");
      let userRole = Cookies.get("userRole") || localStorage.getItem("userRole");

      if (token) {
        setIsAuthenticated(true);
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            if (!userRole && parsedUser.role) {
              userRole = parsedUser.role;
            }
          } catch (e) {
            console.error("Navbar: Error parsing user data", e);
          }
        } else {
          // Fetch profile if token exists but user data is missing
          try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resp.ok) {
              const json = await resp.json();
              const u = json?.data;
              if (u) {
                setUser(u);
                userRole = u.role || userRole;
                // Cache for subsequent renders
                try {
                  localStorage.setItem("user", JSON.stringify(u));
                  if (u.role) localStorage.setItem("userRole", u.role);
                } catch {}
              }
            }
          } catch (err) {
            console.warn("Navbar: failed to fetch profile", err);
          }
        }

        const url = getDashboardUrl(userRole || undefined);
        setDashboardUrl(url);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    syncAuth();
    const onStorage = () => syncAuth();
    const onFocus = () => syncAuth();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      // Swallow logout errors; we still clear client state below.
      console.warn("Navbar: logout request failed, clearing client state anyway", err);
    }

    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("userRole");
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (storageErr) {
      console.warn("Navbar: storage clear failed", storageErr);
    }

    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/login";
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
