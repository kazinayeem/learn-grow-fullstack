import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "@/config/apiConfig";

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_CONFIG.BASE_URL}/api/users`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token");
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
    }),
});

export const {
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useUpdateUserRoleMutation,
} = userApi;
