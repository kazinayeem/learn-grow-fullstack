import { baseApi } from "./baseApi";

export const liveClassApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Instructor endpoints
    createLiveClass: builder.mutation({
      query: (data) => ({
        url: "/live-classes/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),

    getInstructorLiveClasses: builder.query({
      query: () => ({
        url: "/live-classes/instructor/my-classes",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    updateLiveClass: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/live-classes/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Course"],
    }),

    deleteLiveClass: builder.mutation({
      query: (id) => ({
        url: `/live-classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),

    // Public endpoints
    getLiveClassById: builder.query({
      query: (id) => ({
        url: `/live-classes/${id}`,
        method: "GET",
      }),
    }),

    getLiveClassesByCourse: builder.query({
      query: (courseId) => ({
        url: `/live-classes/course/${courseId}`,
        method: "GET",
      }),
    }),

    getUpcomingClasses: builder.query({
      query: (limit = 10) => ({
        url: `/live-classes/upcoming?limit=${limit}`,
        method: "GET",
      }),
    }),

    getAllLiveClasses: builder.query({
      query: ({ skip = 0, limit = 20 } = {}) => ({
        url: `/live-classes/all?skip=${skip}&limit=${limit}`,
        method: "GET",
      }),
    }),

    // Admin endpoints
    getPendingLiveClasses: builder.query({
      query: () => ({
        url: "/live-classes/admin/pending",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    approveLiveClass: builder.mutation({
      query: (id) => ({
        url: `/live-classes/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["Course"],
    }),

    rejectLiveClass: builder.mutation({
      query: (id) => ({
        url: `/live-classes/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["Course"],
    }),

    updateRecordedLink: builder.mutation({
      query: ({ id, recordedLink }) => ({
        url: `/live-classes/${id}/recorded-link`,
        method: "PATCH",
        body: { recordedLink },
      }),
      invalidatesTags: ["Course"],
    }),
  }),
});

export const {
  useCreateLiveClassMutation,
  useGetInstructorLiveClassesQuery,
  useUpdateLiveClassMutation,
  useDeleteLiveClassMutation,
  useGetLiveClassByIdQuery,
  useGetLiveClassesByCourseQuery,
  useGetUpcomingClassesQuery,
  useGetAllLiveClassesQuery,
  useGetPendingLiveClassesQuery,
  useApproveLiveClassMutation,
  useRejectLiveClassMutation,
  useUpdateRecordedLinkMutation,
} = liveClassApi;
