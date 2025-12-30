import { baseApi } from "./baseApi";

export const teamApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Get all team members (admin)
        getAllTeamMembers: build.query({
            query: () => ({ url: "/team", method: "GET" }),
            providesTags: ["Team"],
        }),

        // Get team members for home page
        getHomeTeamMembers: build.query({
            query: () => ({ url: "/team/home", method: "GET" }),
            providesTags: ["Team"],
        }),

        // Get single team member
        getTeamMemberById: build.query({
            query: (id: string) => ({ url: `/team/${id}`, method: "GET" }),
            providesTags: (result, error, id) => [{ type: "Team", id }],
        }),

        // Create team member
        createTeamMember: build.mutation({
            query: (data) => ({ url: "/team", method: "POST", body: data }),
            invalidatesTags: ["Team"],
        }),

        // Update team member
        updateTeamMember: build.mutation({
            query: ({ id, ...data }) => ({ url: `/team/${id}`, method: "PATCH", body: data }),
            invalidatesTags: (result, error, { id }) => [{ type: "Team", id }, "Team"],
        }),

        // Toggle show on home
        toggleShowHome: build.mutation({
            query: ({ id, showOnHome }) => ({
                url: `/team/${id}/toggle-home`,
                method: "PATCH",
                body: { showOnHome },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Team", id }, "Team"],
        }),

        // Delete team member
        deleteTeamMember: build.mutation({
            query: (id: string) => ({ url: `/team/${id}`, method: "DELETE" }),
            invalidatesTags: ["Team"],
        }),

        // Get approved instructors for import
        getApprovedInstructorsForImport: build.query({
            query: () => ({ url: "/team/import/approved/instructors", method: "GET" }),
            providesTags: ["Instructors"],
        }),

        // Import instructors
        importInstructors: build.mutation({
            query: (instructorIds: string[]) => ({
                url: "/team/import/instructors",
                method: "POST",
                body: { instructorIds },
            }),
            invalidatesTags: ["Team"],
        }),
    }),
});

export const {
    useGetAllTeamMembersQuery,
    useGetHomeTeamMembersQuery,
    useGetTeamMemberByIdQuery,
    useCreateTeamMemberMutation,
    useUpdateTeamMemberMutation,
    useToggleShowHomeMutation,
    useDeleteTeamMemberMutation,
    useGetApprovedInstructorsForImportQuery,
    useImportInstructorsMutation,
} = teamApi;
