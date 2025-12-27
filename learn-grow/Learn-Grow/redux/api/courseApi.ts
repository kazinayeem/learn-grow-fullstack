import { baseApi } from "./baseApi";

// Matches backend /api/course endpoints (courses, modules, lessons)
export const courseApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Courses
        getAllCourses: build.query({
            query: (params) => ({
                url: "/course/get-all-courses",
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
        getInstructorCourses: build.query({
            query: (instructorId: string) => ({ url: `/course/get-instructor-courses/${instructorId}`, method: "GET" }),
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
            invalidatesTags: ["Module", "Course"],
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
            invalidatesTags: (r, e, { id }) => [{ type: "Module", id }, "Module"],
        }),
        deleteModule: build.mutation({
            query: (id: string) => ({ url: `/course/delete-module/${id}`, method: "DELETE" }),
            invalidatesTags: ["Module"],
        }),

        // Lessons
        createLesson: build.mutation({
            query: (data) => ({ url: "/course/create-lesson", method: "POST", body: data }),
            invalidatesTags: ["Lesson", "Module"],
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
            invalidatesTags: (r, e, { id }) => [{ type: "Lesson", id }, "Lesson"],
        }),
        deleteLesson: build.mutation({
            query: (id: string) => ({ url: `/course/delete-lesson/${id}`, method: "DELETE" }),
            invalidatesTags: ["Lesson"],
        }),
        getFreeLessons: build.query({
            query: () => ({ url: "/course/get-free-lessons", method: "GET" }),
            providesTags: ["Lesson"],
        }),
    }),
});

export const {
    // Courses
    useGetAllCoursesQuery,
    useGetPublishedCoursesQuery,
    useGetFeaturedCoursesQuery,
    useGetCourseByIdQuery,
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
} = courseApi;
