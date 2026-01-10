import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IUserAccessStatus } from "@/types/combo.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const accessManagementApi = createApi({
  reducerPath: "accessManagementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["UserAccess"],

  endpoints: (builder) => ({
    // Get user's course access status (Admin)
    getUserCourseAccess: builder.query<
      { success: boolean; data: IUserAccessStatus },
      string
    >({
      query: (userId) => `/orders/admin/user-course-access/${userId}`,
      providesTags: ["UserAccess"],
    }),

    // Set course access duration (Admin)
    setAccessDuration: builder.mutation<
      { success: boolean; message: string; data: any },
      { enrollmentId: string; duration: "1-month" | "2-months" | "3-months" | "lifetime" }
    >({
      query: (data) => ({
        url: `/orders/admin/set-access-duration`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserAccess"],
    }),

    // Extend course access (Admin)
    extendAccess: builder.mutation<
      { success: boolean; message: string; data: any },
      { enrollmentId: string; newDuration: "1-month" | "2-months" | "3-months" | "lifetime" }
    >({
      query: (data) => ({
        url: `/orders/admin/extend-access`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserAccess"],
    }),

    // Reduce course access (Admin)
    reduceAccess: builder.mutation<
      { success: boolean; message: string; data: any },
      { enrollmentId: string; newDuration: "1-month" | "2-months" | "3-months" | "lifetime" }
    >({
      query: (data) => ({
        url: `/orders/admin/reduce-access`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserAccess"],
    }),
  }),
});

export const {
  useGetUserCourseAccessQuery,
  useSetAccessDurationMutation,
  useExtendAccessMutation,
  useReduceAccessMutation,
} = accessManagementApi;
