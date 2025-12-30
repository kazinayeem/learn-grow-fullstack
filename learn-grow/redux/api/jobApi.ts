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

        // ========== JOB APPLICATION ENDPOINTS ==========

        // Apply for a job
        applyForJob: build.mutation({
            query: (data) => ({
                url: "/job/apply",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["JobApplication"],
        }),

        // Get all applications with filters
        getApplications: build.query({
            query: (params) => ({
                url: "/job/applications",
                method: "GET",
                params,
            }),
            providesTags: ["JobApplication"],
        }),

        // Get applications for a specific job
        getApplicationsByJobId: build.query({
            query: (jobId) => ({
                url: `/job/applications/by-job/${jobId}`,
                method: "GET",
            }),
            providesTags: (result, error, jobId) => [{ type: "JobApplication", id: jobId }],
        }),

        // Get single application by ID
        getApplicationById: build.query({
            query: (id) => ({
                url: `/job/applications/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "JobApplication", id }],
        }),

        // Update application status
        updateApplicationStatus: build.mutation({
            query: ({ id, status }) => ({
                url: `/job/applications/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "JobApplication", id }, "JobApplication"],
        }),

        // Delete application
        deleteApplication: build.mutation({
            query: (id) => ({
                url: `/job/applications/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["JobApplication"],
        }),

        // Get application statistics
        getApplicationStats: build.query({
            query: () => ({
                url: "/job/applications/stats/overview",
                method: "GET",
            }),
            providesTags: ["JobApplication"],
        }),

        // Send email to applicant
        sendApplicationEmail: build.mutation({
            query: (data) => ({
                url: "/job/send-email",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { applicationId }) => [
                { type: "JobApplication", id: applicationId },
                "JobApplication"
            ],
        }),

        // Get email history for an application
        getEmailHistory: build.query({
            query: (applicationId) => ({
                url: `/job/email-history/${applicationId}`,
                method: "GET",
            }),
            providesTags: (result, error, applicationId) => [{ type: "EmailHistory", id: applicationId }],
        }),

        // Get latest email for an application
        getLatestEmail: build.query({
            query: (applicationId) => ({
                url: `/job/email-latest/${applicationId}`,
                method: "GET",
            }),
            providesTags: (result, error, applicationId) => [{ type: "LatestEmail", id: applicationId }],
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
    useApplyForJobMutation,
    useGetApplicationsQuery,
    useGetApplicationsByJobIdQuery,
    useGetApplicationByIdQuery,
    useUpdateApplicationStatusMutation,
    useDeleteApplicationMutation,
    useGetApplicationStatsQuery,
    useSendApplicationEmailMutation,
    useGetEmailHistoryQuery,
    useGetLatestEmailQuery,
} = jobApi;
