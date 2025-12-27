import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Email OTP endpoints
        sendEmailOtp: build.mutation({
            query: (data) => ({
                url: "/user/send-email-otp",
                method: "POST",
                body: data,
            }),
        }),
        verifyEmailOtp: build.mutation({
            query: (data) => ({
                url: "/user/verify-email-otp",
                method: "POST",
                body: data,
            }),
        }),
        // Legacy phone OTP (keeping for backward compatibility)
        sendOtp: build.mutation({
            query: (data) => ({
                url: "/user/send-otp",
                method: "POST",
                body: data,
            }),
        }),
        verifyOtp: build.mutation({
            query: (data) => ({
                url: "/user/verify-sms",
                method: "POST",
                body: data,
            }),
        }),
        // Google OAuth
        googleLogin: build.mutation({
            query: (data) => ({
                url: "/user/google-login",
                method: "POST",
                body: data,
            }),
        }),
        register: build.mutation({
            query: (data) => ({
                url: "/user/user-create",
                method: "POST",
                body: data,
            }),
        }),
        login: build.mutation({
            query: (data) => ({
                url: "/user/login",
                method: "POST",
                body: data,
            }),
        }),
        changePassword: build.mutation({
            query: (data) => ({
                url: "/user/change-password",
                method: "POST",
                body: data,
            }),
        }),
        forgetPassword: build.mutation({
            query: (data) => ({
                url: "/user/forget-password",
                method: "POST",
                body: data,
            }),
        }),
        resetPassword: build.mutation({
            query: (data) => ({
                url: "/user/reset-password",
                method: "POST",
                body: data,
            }),
        }),
        resendOtp: build.mutation({
            query: (data) => ({
                url: "/user/resend-otp",
                method: "POST",
                body: data,
            }),
        }),
        getProfile: build.query({
            query: () => "/user/profile",
            providesTags: ["User"],
        }),
        updateProfile: build.mutation({
            query: (data) => ({
                url: "/user/update-profile",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        getAllUsers: build.query({
            query: () => "/user/all-users",
            providesTags: ["User"],
        }),
        deleteUser: build.mutation({
            query: (id) => ({
                url: `/user/delete-user/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useSendEmailOtpMutation,
    useVerifyEmailOtpMutation,
    useGoogleLoginMutation,
    useSendOtpMutation,
    useVerifyOtpMutation,
    useRegisterMutation,
    useLoginMutation,
    useChangePasswordMutation,
    useForgetPasswordMutation,
    useResetPasswordMutation,
    useResendOtpMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useGetAllUsersQuery,
    useDeleteUserMutation,
} = authApi;
