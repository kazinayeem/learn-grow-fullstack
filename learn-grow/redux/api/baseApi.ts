import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    prepareHeaders: (headers) => {
        const tokenFromCookie = Cookies.get("accessToken");
        const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const token = tokenFromCookie || tokenFromStorage;

        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // Global logout on 401
        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken", { path: "/" });
        Cookies.remove("refreshToken");
        Cookies.remove("userRole", { path: "/" });
        Cookies.remove("userRole");

        if (typeof window !== "undefined") {
            window.location.href = "/login?session_expired=true";
        }
    }
    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
<<<<<<< HEAD
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
        prepareHeaders: (headers) => {
            const tokenFromCookie = Cookies.get("accessToken");
            const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const token = tokenFromCookie || tokenFromStorage;

            if (token) {
                headers.set("authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["User", "Course", "Category", "SiteContent", "Job", "Module", "Lesson", "Blog", "BlogCategory", "Event", "EventGuest", "EventRegistration", "PaymentMethod", "Order", "Team", "Instructors", "JobApplication", "EmailHistory", "LatestEmail"],
=======
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User", "Course", "Category", "SiteContent", "Job", "Module", "Lesson", "Blog", "BlogCategory", "Event", "EventGuest", "EventRegistration", "PaymentMethod", "Order", "Team", "Instructors"],
>>>>>>> 85bc5c61374d940c6aa2f0fde8616367de30bcb3
    endpoints: () => ({}),
});
