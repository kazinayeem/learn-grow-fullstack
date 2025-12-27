import { baseApi } from "./baseApi";

export const jobApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Get all jobs with filters and pagination
        getAllJobs: build.query({
            query: (params) => ({
                url: "/job/get-all-jobs",
                method: "GET",
                params,
            }),
            providesTags: ["Job"],
        }),

        // Get published jobs only
        getPublishedJobs: build.query({
            query: () => ({
                url: "/job/get-published-jobs",
                method: "GET",
            }),
            providesTags: ["Job"],
        }),

        // Get remote jobs
        getRemoteJobs: build.query({
            query: () => ({
                url: "/job/get-remote-jobs",
                method: "GET",
            }),
            providesTags: ["Job"],
        }),

        // Get jobs by department
        getJobsByDepartment: build.query({
            query: (department) => ({
                url: `/job/get-jobs-by-department/${department}`,
                method: "GET",
            }),
            providesTags: ["Job"],
        }),

        // Get single job by ID
        getJobById: build.query({
            query: (id) => ({
                url: `/job/get-single-job/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Job", id }],
        }),

        // Create new job post
        createJob: build.mutation({
            query: (data) => ({
                url: "/job/create-job",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Job"],
        }),

        // Update job post
        updateJob: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/job/update-job/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Job", id }, "Job"],
        }),

        // Publish job post
        publishJob: build.mutation({
            query: (id) => ({
                url: `/job/publish-job/${id}`,
                method: "PATCH",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Job", id }, "Job"],
        }),

        // Unpublish job post
        unpublishJob: build.mutation({
            query: (id) => ({
                url: `/job/unpublish-job/${id}`,
                method: "PATCH",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Job", id }, "Job"],
        }),

        // Delete job post
        deleteJob: build.mutation({
            query: (id) => ({
                url: `/job/delete-job/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Job"],
        }),
    }),
});

export const {
    useGetAllJobsQuery,
    useGetPublishedJobsQuery,
    useGetRemoteJobsQuery,
    useGetJobsByDepartmentQuery,
    useGetJobByIdQuery,
    useCreateJobMutation,
    useUpdateJobMutation,
    usePublishJobMutation,
    useUnpublishJobMutation,
    useDeleteJobMutation,
} = jobApi;
