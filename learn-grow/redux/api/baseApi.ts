import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include", // send cookies with every request so server can validate session
    prepareHeaders: (headers) => {
        const tokenFromCookie = Cookies.get("accessToken");
        const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const tokenFromStorageAlt = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const token = tokenFromCookie || tokenFromStorage || tokenFromStorageAlt;

        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

// Attempt to refresh the access token using the stored refresh token
const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = Cookies.get("refreshToken") || (typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null);

    if (!refreshToken) {
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (!response.ok || !data?.data?.accessToken) {
            throw new Error(data?.message || "Failed to refresh token");
        }

        const { accessToken, refreshToken: newRefreshToken } = data.data;

        Cookies.set("accessToken", accessToken, { path: "/" });
        if (newRefreshToken) {
            Cookies.set("refreshToken", newRefreshToken, { path: "/" });
            if (typeof window !== "undefined") {
                localStorage.setItem("refreshToken", newRefreshToken);
            }
        }

        if (typeof window !== "undefined") {
            localStorage.setItem("token", accessToken);
        }

        return accessToken;
    } catch (error) {
        // On refresh failure clear tokens so the caller can handle logout
        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("refreshToken", { path: "/" });
        Cookies.remove("userRole", { path: "/" });

        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userRole");
        }

        return null;
    }
};

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            // Retry the original request with the new token available via prepareHeaders
            result = await baseQuery(args, api, extraOptions);
        }

        // If still unauthorized after refresh attempt, clear tokens but DON'T force redirect
        // Let each page/component handle auth failures appropriately
        if (result.error && result.error.status === 401) {
            Cookies.remove("accessToken", { path: "/" });
            Cookies.remove("refreshToken", { path: "/" });
            Cookies.remove("userRole", { path: "/" });

            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userRole");
                localStorage.removeItem("user");
                // DON'T redirect - let components handle it
                // window.location.href = "/login?session_expired=true";
            }
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        "User",
        "Course",
        "Category",
        "SiteContent",
        "Job",
        "Module",
        "Lesson",
        "Blog",
        "BlogCategory",
        "Event",
        "EventGuest",
        "EventRegistration",
        "PaymentMethod",
        "Order",
        "Team",
        "Instructors",
        "JobApplication",
        "EmailHistory",
        "LatestEmail",
        "Analytics",
    ],
    endpoints: () => ({}),
});
