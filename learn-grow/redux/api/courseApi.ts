import { baseApi } from "./baseApi";

// Matches backend /api/course endpoints (courses, modules, lessons)
export const courseApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Assessments
        getAssessmentsByCourse: build.query({
            query: (courseId: string) => ({ url: `/assessment/by-course/${courseId}`, method: "GET" }),
            providesTags: (r, e, courseId) => [{ type: "Course", id: courseId }],
        }),
        createAssessment: build.mutation({
            query: (data) => ({ url: "/assessment/create", method: "POST", body: data }),
            invalidatesTags: (r, e, arg) => [{ type: "Course", id: arg.courseId }, "Course"],
        }),
        updateAssessment: build.mutation({
            query: ({ id, ...data }) => ({ url: `/assessment/${id}`, method: "PATCH", body: data }),
            invalidatesTags: ["Course"],
        }),
        deleteAssessment: build.mutation({
            query: (id: string) => ({ url: `/assessment/${id}`, method: "DELETE" }),
            invalidatesTags: ["Course"],
        }),
        // Courses
        getAllCourses: build.query({
            query: (params = {}) => ({
                url: "/course/get-all-courses",
                method: "GET",
                params: {
                    page: params.page || 1,
                    limit: params.limit || 10,
                    search: params.search || undefined,
                    status: params.status || undefined,
                    category: params.category || undefined,
                },
            }),
            providesTags: ["Course"],
        }),
        getCoursesCount: build.query({
            query: (params = {}) => ({
                url: "/course/get-courses-count",
                method: "GET",
                params,
            }),
            providesTags: ["Course"],
        }),
        getPublishedCourses: build.query({
            query: () => ({ url: "/course/get-published-courses", method: "GET" }),
            providesTags: ["Course"],
        }),
        getFeaturedCourses: build.query({
            query: () => ({ url: "/course/get-featured-courses", method: "GET" }),
            providesTags: ["Course"],
        }),
        getCourseById: build.query({
            query: (id: string) => ({ url: `/course/get-course/${id}`, method: "GET" }),
            providesTags: (result, error, id) => [{ type: "Course", id }],
        }),
        getCourseStats: build.query({
            query: (id: string) => ({ url: `/course/get-course-stats/${id}`, method: "GET" }),
            providesTags: (result, error, id) => [{ type: "Course", id: `stats-${id}` }],
        }),
        getInstructorCourses: build.query({
            query: ({ instructorId, page = 1, limit = 12 }: { instructorId: string; page?: number; limit?: number }) => ({
                url: `/course/get-instructor-courses/${instructorId}`,
                method: "GET",
                params: { page, limit },
            }),
            providesTags: ["Course"],
        }),
        getCategoryCourses: build.query({
            query: (category: string) => ({ url: `/course/get-category-courses/${category}`, method: "GET" }),
            providesTags: ["Course"],
        }),
        createCourse: build.mutation({
            query: (data) => ({ url: "/course/create-course", method: "POST", body: data }),
            invalidatesTags: ["Course"],
        }),
        updateCourse: build.mutation({
            query: ({ id, ...data }) => ({ url: `/course/update-course/${id}`, method: "PATCH", body: data }),
            invalidatesTags: (r, e, { id }) => [{ type: "Course", id }, "Course"],
        }),
        deleteCourse: build.mutation({
            query: (id: string) => ({ url: `/course/delete-course/${id}`, method: "DELETE" }),
            invalidatesTags: ["Course"],
        }),

        // Modules
        createModule: build.mutation({
            query: (data) => ({ url: "/course/create-module", method: "POST", body: data }),
            invalidatesTags: (result, error, arg) => [
                "Module",
                "Course",
                { type: "Course", id: arg.courseId }
            ],
        }),
        getModules: build.query({
            query: (courseId: string) => ({ url: `/course/get-modules/${courseId}`, method: "GET" }),
            providesTags: ["Module"],
        }),
        getModuleById: build.query({
            query: (id: string) => ({ url: `/course/get-module/${id}`, method: "GET" }),
            providesTags: (r, e, id) => [{ type: "Module", id }],
        }),
        updateModule: build.mutation({
            query: ({ id, ...data }) => ({ url: `/course/update-module/${id}`, method: "PATCH", body: data }),
            invalidatesTags: (r, e, { id, courseId }) => [
                { type: "Module", id },
                "Module",
                "Course",
                { type: "Course", id: courseId }
            ],
        }),
        deleteModule: build.mutation({
            query: (id: string) => ({ url: `/course/delete-module/${id}`, method: "DELETE" }),
            invalidatesTags: ["Module", "Course"],
        }),

        // Lessons
        createLesson: build.mutation({
            query: (data) => ({ url: "/course/create-lesson", method: "POST", body: data }),
            invalidatesTags: ["Lesson", "Module", "Course"],
        }),
        getLessons: build.query({
            query: (moduleId: string) => ({ url: `/course/get-lessons/${moduleId}`, method: "GET" }),
            providesTags: ["Lesson"],
        }),
        getLessonById: build.query({
            query: (id: string) => ({ url: `/course/get-lesson/${id}`, method: "GET" }),
            providesTags: (r, e, id) => [{ type: "Lesson", id }],
        }),
        updateLesson: build.mutation({
            query: ({ id, ...data }) => ({ url: `/course/update-lesson/${id}`, method: "PATCH", body: data }),
            invalidatesTags: (r, e, { id }) => [{ type: "Lesson", id }, "Lesson", "Module", "Course"],
        }),
        deleteLesson: build.mutation({
            query: (id: string) => ({ url: `/course/delete-lesson/${id}`, method: "DELETE" }),
            invalidatesTags: ["Lesson", "Module", "Course"],
        }),
        getFreeLessons: build.query({
            query: () => ({ url: "/course/get-free-lessons", method: "GET" }),
            providesTags: ["Lesson"],
        }),
        completeLesson: build.mutation({
            query: (id: string) => ({ url: `/course/complete-lesson/${id}`, method: "POST" }),
            invalidatesTags: (r, e, id) => ["Course", { type: "Course", id }], // Invalidate Course to refresh locked states
        }),

        // Course Publishing & Approval
        publishCourse: build.mutation({
            query: (id: string) => ({ url: `/course/publish-course/${id}`, method: "PATCH" }),
            invalidatesTags: (r, e, id) => [{ type: "Course", id }, "Course"],
        }),
        unpublishCourse: build.mutation({
            query: (id: string) => ({ url: `/course/unpublish-course/${id}`, method: "PATCH" }),
            invalidatesTags: (r, e, id) => [{ type: "Course", id }, "Course"],
        }),
        approveCourse: build.mutation({
            query: (id: string) => ({ url: `/course/approve-course/${id}`, method: "PATCH" }),
            invalidatesTags: (r, e, id) => [{ type: "Course", id }, "Course"],
        }),
        rejectCourseApproval: build.mutation({
            query: (id: string) => ({ url: `/course/reject-course/${id}`, method: "PATCH" }),
            invalidatesTags: (r, e, id) => [{ type: "Course", id }, "Course"],
        }),
        getPendingApprovalCourses: build.query({
            query: () => ({ url: "/course/pending-approval-courses", method: "GET" }),
            providesTags: ["Course"],
        }),

        // Registration controls
        setRegistrationOpen: build.mutation({
            query: ({ id, isRegistrationOpen }: { id: string; isRegistrationOpen: boolean }) => ({
                url: `/course/set-registration-open/${id}`,
                method: "PATCH",
                body: { isRegistrationOpen },
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Course", id }, "Course"],
        }),
        setRegistrationDeadline: build.mutation({
            query: ({ id, registrationDeadline }: { id: string; registrationDeadline?: string | null }) => ({
                url: `/course/set-registration-deadline/${id}`,
                method: "PATCH",
                body: { registrationDeadline },
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Course", id }, "Course"],
        }),
        adminSetRegistration: build.mutation({
            query: ({ id, ...body }: { id: string; isRegistrationOpen?: boolean; registrationDeadline?: string | null }) => ({
                url: `/course/admin/set-registration/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (r, e, { id }) => [{ type: "Course", id }, "Course"],
        }),
    }),
});

export const {
    // Courses
    useGetAllCoursesQuery,
    useGetCoursesCountQuery,
    useGetPublishedCoursesQuery,
    useGetFeaturedCoursesQuery,
    useGetCourseByIdQuery,
    useGetCourseStatsQuery,
    useGetInstructorCoursesQuery,
    useGetCategoryCoursesQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation,
    // Modules
    useCreateModuleMutation,
    useGetModulesQuery,
    useGetModuleByIdQuery,
    useUpdateModuleMutation,
    useDeleteModuleMutation,
    // Lessons
    useCreateLessonMutation,
    useGetLessonsQuery,
    useGetLessonByIdQuery,
    useUpdateLessonMutation,
    useDeleteLessonMutation,
    useGetFreeLessonsQuery,
    useCompleteLessonMutation,
    // Assessments
    useGetAssessmentsByCourseQuery,
    useCreateAssessmentMutation,
    useUpdateAssessmentMutation,
    useDeleteAssessmentMutation,
    // Course Publishing & Approval
    usePublishCourseMutation,
    useUnpublishCourseMutation,
    useApproveCourseMutation,
    useRejectCourseApprovalMutation,
    useGetPendingApprovalCoursesQuery,
    // Registration
    useSetRegistrationOpenMutation,
    useSetRegistrationDeadlineMutation,
    useAdminSetRegistrationMutation,
} = courseApi;
