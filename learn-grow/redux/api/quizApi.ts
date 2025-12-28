import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { API_CONFIG } from "@/config/apiConfig";

export const quizApi = createApi({
    reducerPath: "quizApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_CONFIG.BASE_URL.replace(/\/api$/, "")}/api/quiz`,
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
    tagTypes: ["Quizzes"],
    endpoints: (builder) => ({
        // Create quiz
        createQuiz: builder.mutation({
            query: (quizData) => ({
                url: "/create",
                method: "POST",
                body: quizData,
            }),
            invalidatesTags: ["Quizzes"],
        }),

        // Get quizzes by course
        getQuizzesByCourse: builder.query({
            query: (courseId: string) => ({
                url: `/course/${courseId}`,
                method: "GET",
            }),
            providesTags: ["Quizzes"],
        }),

        // Get quiz by ID
        getQuizById: builder.query({
            query: (id: string) => ({
                url: `/${id}`,
                method: "GET",
            }),
            providesTags: ["Quizzes"],
        }),

        // Update quiz
        updateQuiz: builder.mutation({
            query: ({ id, ...quizData }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: quizData,
            }),
            invalidatesTags: ["Quizzes"],
        }),

        // Publish quiz
        publishQuiz: builder.mutation({
            query: ({ id, status }) => ({
                url: `/${id}/publish`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: ["Quizzes"],
        }),

        // Delete quiz
        deleteQuiz: builder.mutation({
            query: (id: string) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Quizzes"],
        }),
    }),
});

export const {
    useCreateQuizMutation,
    useGetQuizzesByCourseQuery,
    useGetQuizByIdQuery,
    useUpdateQuizMutation,
    usePublishQuizMutation,
    useDeleteQuizMutation,
} = quizApi;
