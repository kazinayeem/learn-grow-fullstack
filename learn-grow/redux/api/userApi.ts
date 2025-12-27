import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { API_CONFIG } from "@/config/apiConfig";

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        // Avoid double "/api" when BASE_URL already includes it
        baseUrl: `${API_CONFIG.BASE_URL.replace(/\/api$/, "")}/api/users`,
        prepareHeaders: (headers) => {
            const tokenFromCookie = Cookies.get("accessToken");
            const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const token = tokenFromCookie || tokenFromStorage;

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Users"],
    endpoints: (builder) => ({
        // Get all users (Admin only)
        getAllUsers: builder.query({
            query: () => "/",
            providesTags: ["Users"],
        }),

        // Get user by ID
        getUserById: builder.query({
            query: (id) => `/${id}`,
            providesTags: ["Users"],
        }),

        // Create new user (Admin only)
        createUser: builder.mutation({
            query: (userData) => ({
                url: "/",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["Users"],
        }),

        // Update user
        updateUser: builder.mutation({
            query: ({ id, ...userData }) => ({
                url: `/${id}`,
                method: "PUT",
                body: userData,
            }),
            invalidatesTags: ["Users"],
        }),

        // Delete user (Admin only)
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Users"],
        }),

        // Update user role (Admin only)
        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({
                url: `/${id}/role`,
                method: "PATCH",
                body: { role },
            }),
            invalidatesTags: ["Users"],
        }),

        // Get all instructors
        getAllInstructors: builder.query({
            query: () => "/instructors",
            providesTags: ["Users"],
        }),

        // Approve instructor (Admin only)
        approveInstructor: builder.mutation({
            query: (instructorId) => ({
                url: `/instructors/${instructorId}/approve`,
                method: "PATCH",
            }),
            invalidatesTags: ["Users"],
        }),

        // Reject instructor (Admin only)
        rejectInstructor: builder.mutation({
            query: (instructorId) => ({
                url: `/instructors/${instructorId}/reject`,
                method: "PATCH",
            }),
            invalidatesTags: ["Users"],
        }),
    }),
});

export const {
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useUpdateUserRoleMutation,
    useGetAllInstructorsQuery,
    useApproveInstructorMutation,
    useRejectInstructorMutation,
} = userApi;
