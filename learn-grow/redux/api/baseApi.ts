import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export const baseApi = createApi({
    reducerPath: "api",
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
    tagTypes: ["User", "Course", "Category", "SiteContent", "Job", "Module", "Lesson", "Blog", "BlogCategory", "Event", "EventGuest", "EventRegistration", "PaymentMethod", "Order", "Team", "Instructors"],
    endpoints: () => ({}),
});
