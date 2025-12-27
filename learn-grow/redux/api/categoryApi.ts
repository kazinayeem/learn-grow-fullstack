import { baseApi } from "./baseApi";

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllCategories: build.query({
            query: () => "/category/get-all-category",
            providesTags: ["Category"],
        }),
        getCategoryById: build.query({
            query: (id) => `/category/get-single-category/${id}`,
            providesTags: (result, error, id) => [{ type: "Category", id }],
        }),
        createCategory: build.mutation({
            query: (data) => ({
                url: "/category/create-category",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Category"],
        }),
        updateCategory: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/category/update-category/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Category"],
        }),
        deleteCategory: build.mutation({
            query: (id) => ({
                url: `/category/delete-category/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Category"],
        }),
    }),
});

export const {
    useGetAllCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;
