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
import { motion, AnimatePresence } from "framer-motion";

import { siteConfig } from "@/config/site";
import Logo from "@/public/logo.png";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Skeleton,
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
  const [mounted, setMounted] = React.useState(false);

  const syncAuth = React.useCallback(() => {
    setIsLoading(true);
    const loggingOut = sessionStorage.getItem("loggingOut");

    const tokenCookie = Cookies.get("accessToken");
    const tokenLocal =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    const token = tokenCookie || tokenLocal;
    const userStr = localStorage.getItem("user");
    const role = Cookies.get("userRole") || localStorage.getItem("userRole");

    // If logout flag is set but new auth data exists (e.g., Google login), clear the stale flag
    if (loggingOut === "1" && (token || userStr)) {
      sessionStorage.removeItem("loggingOut");
    }

    // If logout is truly in progress and no auth data is present, short-circuit
    if (loggingOut === "1" && !token && !userStr) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (!token && !userStr) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const parsed = userStr ? JSON.parse(userStr) : null;
      setIsAuthenticated(true);
      setUser(parsed);
      const resolvedRole = parsed?.role || role || undefined;
      setDashboardUrl(getDashboardUrl(resolvedRole));
    } catch (e) {
      setIsAuthenticated(false);
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    setMounted(true);
    syncAuth();

    const onAuthChange = () => {
      syncAuth();
    };
    const onStorage = () => {
      syncAuth();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        syncAuth();
      }
    };

    window.addEventListener("auth-change", onAuthChange);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("auth-change", onAuthChange);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [syncAuth]);

  const handleLogout = async () => {
    try {
      // Set logout flag FIRST
      sessionStorage.setItem("loggingOut", "1");

      // Call API logout (don't wait for it)
      try {
        await apiLogout();
      } catch (e) {
        // API logout failed, continuing with client-side logout
      }

      // Clear cookies
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      Cookies.remove("userRole", { path: "/" });

      // Clear localStorage (minimal)
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");

      // Update local state
      setIsAuthenticated(false);
      setUser(null);
      // Use router.replace for Next.js, with window.location.href as fallback for mobile reliability
      setTimeout(() => {
        router.replace("/");
        // Fallback for mobile devices that might have issues with router
        setTimeout(() => {
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
        }, 500);
      }, 100);
    } catch (error) {
      // Emergency logout - just go to home page
      window.location.href = "/";
    }
  };

  if (isLoading && !mounted) {
    return <Skeleton className="rounded-full w-10 h-10" />;
  }

  // If we have auth data in state, show authenticated view immediately
  if (isAuthenticated && user) {
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
            <p className="font-semibold">
              {user?.email || user?.phone || "User"}
            </p>
          </DropdownItem>
          <DropdownItem
            key="dashboard"
            onPress={() => router.push(dashboardUrl)}
          >
            Dashboard
          </DropdownItem>
          <DropdownItem key="settings" onPress={() => router.push("/profile")}>
            My Profile
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            onPress={handleLogout}
            className="cursor-pointer touch-manipulation active:opacity-80"
          >
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }

  // ... (previous imports remain, no change needed)

  return (
    <div className="flex gap-2 sm:gap-3 items-center">
      <Button
        as={Link}
        className={clsx(
          "text-sm font-bold px-4 sm:px-6 py-2 border-2 transition-all duration-300",
          isScrolled
            ? "text-blue-600 border-blue-600/40 bg-white hover:bg-blue-50 hover:border-blue-600"
            : "text-white border-white/60 bg-transparent hover:bg-white/20 hover:border-white"
        )}
        href="/login"
        size="md"
        variant="bordered"
        radius="lg"
        startContent={<span className="text-base sm:text-lg">👤</span>}
      >
        <span className="hidden sm:inline">লগইন</span>
      </Button>
      <Button
        as={Link}
        className={clsx(
          "text-sm font-bold px-4 sm:px-6 py-2 transition-all duration-300 shadow-lg",
          isScrolled
            ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
            : "text-blue-900 bg-white hover:bg-gray-50 hover:shadow-xl"
        )}
        href="/register"
        size="md"
        variant="solid"
        radius="lg"
        startContent={<span className="text-base sm:text-lg">✨</span>}
      >
        <span className="hidden sm:inline">রেজিস্ট্রেশন</span>
      </Button>
    </div>
  );
};

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileAuth, setMobileAuth] = React.useState<{
    authed: boolean;
    user?: any;
  }>({ authed: false });

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const syncMobile = () => {
      const loggingOut = sessionStorage.getItem("loggingOut");
      const tokenCookie = Cookies.get("accessToken");
      const tokenLocal =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("accessToken")
          : null;
      const token = tokenCookie || tokenLocal;
      const userStr =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;

      if (loggingOut === "1" && (token || userStr)) {
        sessionStorage.removeItem("loggingOut");
      }

      if (loggingOut === "1" && !token && !userStr) {
        setMobileAuth({ authed: false });
        return;
      }

      if (token || userStr) {
        try {
          setMobileAuth({
            authed: true,
            user: userStr ? JSON.parse(userStr) : undefined,
          });
        } catch {
          setMobileAuth({ authed: true });
        }
      } else {
        setMobileAuth({ authed: false });
      }
    };

    syncMobile();
    window.addEventListener("auth-change", syncMobile);
    window.addEventListener("storage", syncMobile);
    document.addEventListener("visibilitychange", syncMobile);
    return () => {
      window.removeEventListener("auth-change", syncMobile);
      window.removeEventListener("storage", syncMobile);
      document.removeEventListener("visibilitychange", syncMobile);
    };
  }, []);

  return (
    <NextUINavbar
      isBlurred={false}
      classNames={{
        base: clsx(
          "py-3 transition-all duration-500 !h-auto !min-h-[96px] !fixed top-0 left-0 right-0 z-50 overflow-visible",
          isScrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"
            : "bg-gradient-to-r from-blue-900/40 via-teal-800/40 to-amber-900/40 backdrop-blur-md"
        ),
        wrapper: "px-4 sm:px-6 lg:px-8 items-center",
      }}
      height="auto"
      maxWidth="full"
      position="sticky"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-auto" justify="start">
        <NavbarBrand as="li" className="gap-2 sm:gap-3 max-w-fit shrink-0">
          <NextLink
            className="flex justify-start items-center gap-2 sm:gap-3 group"
            href="/"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex-shrink-0"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-lg"
              />
              <motion.div whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.3 }}>
                <Image
                  priority
                  alt="Learn & Grow Logo"
                  className={clsx(
                    "relative object-contain rounded-xl transition-all duration-300",
                    isScrolled
                      ? "w-10 h-10 sm:w-12 sm:h-12"
                      : "w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
                  )}
                  src={Logo}
                  width={64}
                  height={64}
                />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col shrink-0"
            >
              <p
                className={clsx(
                  "font-extrabold tracking-tight whitespace-nowrap leading-tight",
                  isScrolled
                    ? "text-sm sm:text-base lg:text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                    : "text-base sm:text-lg lg:text-xl text-white drop-shadow-lg"
                )}
              >
                {siteConfig.name}
              </p>
              <p
                className={clsx(
                  "text-[9px] sm:text-xs font-medium mt-0 leading-tight whitespace-nowrap",
                  isScrolled ? "text-gray-600" : "text-white/90"
                )}
              >
                Empowering Education
              </p>
            </motion.div>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden md:flex basis-full" justify="center">
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-1 lg:gap-2 overflow-x-auto scrollbar-hide"
        >
          {siteConfig.navItems.map((item, index) => (
            <NavbarItem key={item.href} className="flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <NextLink
                className={clsx(
                  "relative text-sm lg:text-base font-semibold transition-all duration-300 px-3 lg:px-4 py-2 rounded-lg group whitespace-nowrap",
                  isScrolled
                    ? "text-gray-800 hover:text-blue-600"
                    : "text-white hover:text-white/80"
                )}
                href={item.href}
              >
                <span className="relative z-10">{item.label}</span>
                <span
                  className={clsx(
                    "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    isScrolled
                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                      : "bg-white/20"
                  )}
                ></span>
                <span
                  className={clsx(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 group-hover:w-3/4 transition-all duration-300",
                    isScrolled
                      ? "bg-gradient-to-r from-blue-600 to-purple-600"
                      : "bg-white"
                  )}
                ></span>
              </NextLink>
              </motion.div>
            </NavbarItem>
          ))}
        </motion.ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-auto" justify="end">
        <NavbarItem>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <AuthButtons isScrolled={isScrolled} />
          </motion.div>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1/5" justify="end">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.9 }}
        >
          <NavbarMenuToggle
            className={clsx(
              "ml-2 touch-manipulation active:scale-95 transition-all duration-500 ease-out w-8 h-8 [&>span]:w-6 [&>span]:h-0.5 [&>span:nth-child(2)]:my-1 [&>span]:transition-all [&>span]:duration-500",
              isScrolled ? "text-gray-700" : "text-white"
            )}
            aria-label="Toggle navigation menu"
          />
        </motion.div>
      </NavbarContent>

      <NavbarMenu
        className="pt-6 pb-safe max-h-[calc(100vh-120px)] overflow-y-auto transition-all duration-500 ease-out"
        style={{
          background:
            "linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(20, 83, 136, 0.95) 50%, rgba(180, 83, 9, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-4 select-none space-y-2"
        >
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <NextLink
                  className="w-full text-white text-lg font-semibold py-4 px-5 rounded-lg active:bg-white/30 touch-manipulation transition-all duration-300 hover:bg-white/20 min-h-[48px] flex items-center transform hover:translate-x-1"
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NextLink>
              </motion.div>
            </NavbarMenuItem>
          ))}
        </motion.div>
        <NavbarMenuItem>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col gap-4 mt-8 w-full px-4 pb-6"
          >
            {mobileAuth.authed ? (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    as={NextLink}
                    className="text-sm font-bold border-2 bg-white/10 backdrop-blur-md text-white border-white/60 active:bg-white/30 touch-manipulation min-h-[52px] transition-all duration-300 hover:bg-white/20 hover:border-white transform hover:scale-[1.02]"
                    href={getDashboardUrl(mobileAuth.user?.role)}
                    size="lg"
                    variant="bordered"
                    radius="lg"
                    fullWidth
                    onPress={() => setIsMenuOpen(false)}
                    startContent={<span className="text-xl">📊</span>}
                  >
                    Dashboard
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    as={NextLink}
                    className="text-sm font-bold bg-white text-blue-900 active:bg-gray-200 shadow-lg touch-manipulation min-h-[52px] transition-all duration-300 hover:shadow-xl hover:bg-blue-50 transform hover:scale-[1.02]"
                    href="/profile"
                    size="lg"
                    variant="solid"
                    radius="lg"
                    fullWidth
                    onPress={() => setIsMenuOpen(false)}
                    startContent={<span className="text-xl">👤</span>}
                  >
                    Profile
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                  className="text-sm font-bold bg-red-500 text-white active:bg-red-700 shadow-lg touch-manipulation min-h-[52px] transition-all duration-300 hover:bg-red-600 hover:shadow-xl transform hover:scale-[1.02]"
                  size="lg"
                  variant="solid"
                  radius="lg"
                  fullWidth
                  onPress={async () => {
                    try {
                      sessionStorage.setItem("loggingOut", "1");
                      await apiLogout();
                      // Ensure cookie removal matches original path
                      Cookies.remove("accessToken", { path: "/" });
                      Cookies.remove("refreshToken", { path: "/" });
                      Cookies.remove("userRole", { path: "/" });
                      localStorage.removeItem("user");
                      localStorage.removeItem("userRole");
                      localStorage.removeItem("token");
                      localStorage.removeItem("accessToken");
                      // Proactively sync UI on all listeners
                      window.dispatchEvent(new Event("auth-change"));
                      setMobileAuth({ authed: false });
                      setIsMenuOpen(false);
                      window.location.href = "/";
                    } catch (error) {
                      window.location.href = "/";
                    }
                  }}
                  startContent={<span className="text-xl">🚪</span>}
                >
                  লগআউট
                </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    as={NextLink}
                    className="text-sm font-bold border-2 bg-white/10 backdrop-blur-md text-white border-white/60 active:bg-white/30 touch-manipulation min-h-[52px] transition-all duration-300 hover:bg-white/20 hover:border-white transform hover:scale-[1.02]"
                    href="/login"
                    size="lg"
                    variant="bordered"
                    radius="lg"
                    fullWidth
                    onPress={() => setIsMenuOpen(false)}
                    startContent={<span className="text-xl">👤</span>}
                  >
                    লগইন
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    as={Link}
                    className="text-sm font-bold bg-white text-blue-900 active:bg-gray-200 shadow-lg touch-manipulation min-h-[52px] transition-all duration-300 hover:shadow-xl hover:bg-blue-50 transform hover:scale-[1.02]"
                    href="/register"
                    size="lg"
                    variant="solid"
                    radius="lg"
                    fullWidth
                    onPress={() => setIsMenuOpen(false)}
                    startContent={<span className="text-xl">✨</span>}
                  >
                    রেজিস্ট্রেশন
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        </NavbarMenuItem>
      </NavbarMenu>
    </NextUINavbar>
  );
};
