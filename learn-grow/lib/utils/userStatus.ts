import { API_CONFIG } from "@/config/apiConfig";
import Cookies from "js-cookie";

/**
 * Fetch the latest user status from the backend
 * Used to check if approval status has changed
 */
export const refreshUserStatus = async (): Promise<any | null> => {
  try {
    const token = Cookies.get("accessToken") || localStorage.getItem("token");
    if (!token) {
      return null;
    }

    const baseUrl = API_CONFIG.BASE_URL.replace(/\/api$/, "");
    const response = await fetch(`${baseUrl}/api/users/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Extract user from nested response structure
    const userData = data.data?.user || data.data || data.user || data;

    // Update localStorage with fresh user data
    if (typeof window !== "undefined" && userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }

    return userData;
  } catch (error) {
    return null;
  }
};

/**
 * Check if user approval status has changed in localStorage
 */
export const getApprovalStatus = (): boolean => {
  try {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      return !!parsed?.isApproved;
    }
  } catch (_) {
    return false;
  }
  return false;
};
