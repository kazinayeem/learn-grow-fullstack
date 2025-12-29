import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { API_CONFIG } from "@/config/apiConfig";

export const assignmentApi = createApi({
    reducerPath: "assignmentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_CONFIG.BASE_URL.replace(/\/api$/, "")}/api/assignment`,
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
    tagTypes: ["Assignments", "Submissions"],
    endpoints: (builder) => ({
        // Create assignment
        createAssignment: builder.mutation({
            query: (assignmentData) => ({
                url: "/create",
                method: "POST",
                body: assignmentData,
            }),
            invalidatesTags: ["Assignments"],
        }),

        // Get assignments by course
        getAssignmentsByCourse: builder.query({
            query: (courseId: string) => ({
                url: `/course/${courseId}`,
                method: "GET",
            }),
            providesTags: ["Assignments"],
        }),

        // Get assignment by ID
        getAssignmentById: builder.query({
            query: (id: string) => ({
                url: `/${id}`,
                method: "GET",
            }),
            providesTags: ["Assignments"],
        }),

        // Update assignment
        updateAssignment: builder.mutation({
            query: ({ id, ...assignmentData }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: assignmentData,
            }),
            invalidatesTags: ["Assignments"],
        }),

        // Delete assignment
        deleteAssignment: builder.mutation({
            query: (id: string) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Assignments"],
        }),

        // Submit assignment (student)
        submitAssignment: builder.mutation({
            query: ({ id, submissionLink }) => ({
                url: `/${id}/submit`,
                method: "POST",
                body: { submissionLink },
            }),
            invalidatesTags: ["Submissions"],
        }),

        // Get assignment submissions (instructor)
        getAssignmentSubmissions: builder.query({
            query: (id: string) => ({
                url: `/${id}/submissions`,
                method: "GET",
            }),
            providesTags: ["Submissions"],
        }),

        // Get my submission (student)
        getMySubmission: builder.query({
            query: (id: string) => ({
                url: `/${id}/my-submission`,
                method: "GET",
            }),
            providesTags: ["Submissions"],
        }),

        // Grade submission (instructor)
        gradeSubmission: builder.mutation({
            query: ({ id, score, feedback }) => ({
                url: `/submission/${id}/grade`,
                method: "PATCH",
                body: { score, feedback },
            }),
            invalidatesTags: ["Submissions"],
        }),
    }),
});

export const {
    useCreateAssignmentMutation,
    useGetAssignmentsByCourseQuery,
    useGetAssignmentByIdQuery,
    useUpdateAssignmentMutation,
    useDeleteAssignmentMutation,
    useSubmitAssignmentMutation,
    useGetAssignmentSubmissionsQuery,
    useGetMySubmissionQuery,
    useGradeSubmissionMutation,
} = assignmentApi;
