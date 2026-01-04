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
        // Admin: Get lightweight dashboard stats
        getAdminDashboardStats: builder.query({
            query: () => "/admin/dashboard/stats",
            providesTags: ["Users"],
        }),

        // Admin: List users with pagination, search, role filter
        getUsersAdmin: builder.query({
            query: ({ page = 1, limit = 10, search = "", role = "" } = {}) => {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("limit", String(limit));
                if (search) params.set("search", search);
                if (role) params.set("role", role);
                return `/admin?${params.toString()}`;
            },
            providesTags: ["Users"],
        }),

        // Get user by ID (Admin)
        getUserById: builder.query({
            query: (id) => `/admin/${id}`,
            providesTags: ["Users"],
        }),

        // Create new user (Admin only)
        createUser: builder.mutation({
            query: (userData) => ({
                url: "/admin",
                method: "POST",
                body: userData,
            }),
            invalidatesTags: ["Users"],
        }),

        // Update user (Admin)
        updateUser: builder.mutation({
            query: ({ id, ...userData }) => ({
                url: `/admin/${id}`,
                method: "PUT",
                body: userData,
            }),
            invalidatesTags: ["Users"],
        }),

        // Delete user (Admin only)
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/admin/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Users"],
        }),

        // Update user role (Admin only)
        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({
                url: `/admin/${id}/role`,
                method: "PATCH",
                body: { role },
            }),
            invalidatesTags: ["Users"],
        }),

        // Get all instructors (for admin)
        getAllInstructors: builder.query({
            query: (params = {}) => ({
                url: "/instructors",
                method: "GET",
                params: {
                    page: params.page || 1,
                    limit: params.limit || 12,
                    search: params.search || undefined,
                    status: params.status || undefined,
                },
            }),
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

        // Get instructor dashboard stats
        getInstructorStats: builder.query({
            query: () => "/instructor-stats",
            providesTags: ["Users"],
        }),

        // Instructor: Get enrolled students with pagination
        getInstructorStudents: builder.query({
            query: ({ page = 1, limit = 20, search = "" } = {}) => {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("limit", String(limit));
                if (search) params.set("search", search);
                return `/instructor/students?${params.toString()}`;
            },
            providesTags: ["Users"],
        }),

        // Instructor: Get individual student details
        getInstructorStudentById: builder.query({
            query: (id) => `/instructor/students/${id}`,
            providesTags: ["Users"],
        }),

        // Send OTP for password change
        sendPasswordChangeOtp: builder.mutation({
            query: (data) => ({
                url: "/send-password-change-otp",
                method: "POST",
                body: data,
            }),
        }),

        // Verify OTP and change password
        verifyPasswordChangeOtp: builder.mutation({
            query: (data) => ({
                url: "/verify-password-change-otp",
                method: "POST",
                body: data,
            }),
        }),

        // Update phone number
        updatePhoneNumber: builder.mutation({
            query: (data) => ({
                url: "/update-phone",
                method: "PATCH",
                body: data,
            }),
        }),
    }),
});

export const {
    useGetAdminDashboardStatsQuery,
    useGetUsersAdminQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useUpdateUserRoleMutation,
    useGetAllInstructorsQuery,
    useApproveInstructorMutation,
    useRejectInstructorMutation,
    useGetInstructorStatsQuery,
    useGetInstructorStudentsQuery,
    useGetInstructorStudentByIdQuery,
    useSendPasswordChangeOtpMutation,
    useVerifyPasswordChangeOtpMutation,
    useUpdatePhoneNumberMutation,
} = userApi;
