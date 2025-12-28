import { baseApi } from "./baseApi";

export const blogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Blog endpoints
    getAllBlogs: build.query({
      query: (params = {}) => ({
        url: "/blog",
        method: "GET",
        params,
      }),
      providesTags: ["Blog"],
    }),
    getBlogById: build.query({
      query: (id: string) => ({ url: `/blog/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Blog", id }],
    }),
    getBlogBySlug: build.query({
      query: (slug: string) => ({ url: `/blog/slug/${slug}`, method: "GET" }),
      providesTags: (result, error, slug) => [{ type: "Blog", id: slug }],
    }),
    createBlog: build.mutation({
      query: (data) => ({ url: "/blog/create", method: "POST", body: data }),
      invalidatesTags: ["Blog"],
    }),
    updateBlog: build.mutation({
      query: ({ id, ...data }) => ({ url: `/blog/${id}`, method: "PATCH", body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: "Blog", id }, "Blog"],
    }),
    deleteBlog: build.mutation({
      query: (id: string) => ({ url: `/blog/${id}`, method: "DELETE" }),
      invalidatesTags: ["Blog"],
    }),
    approveBlog: build.mutation({
      query: (id: string) => ({ url: `/blog/admin/approve/${id}`, method: "PATCH" }),
      invalidatesTags: ["Blog"],
    }),
    rejectBlog: build.mutation({
      query: (id: string) => ({ url: `/blog/admin/reject/${id}`, method: "PATCH" }),
      invalidatesTags: ["Blog"],
    }),
    getPendingBlogs: build.query({
      query: () => ({ url: "/blog/admin/pending-approval", method: "GET" }),
      providesTags: ["Blog"],
    }),

    // Category endpoints
    getAllBlogCategories: build.query({
      query: () => ({ url: "/blog/category/list", method: "GET" }),
      providesTags: ["BlogCategory"],
    }),
    createBlogCategory: build.mutation({
      query: (data) => ({ url: "/blog/category/create", method: "POST", body: data }),
      invalidatesTags: ["BlogCategory"],
    }),
    updateBlogCategory: build.mutation({
      query: ({ id, ...data }) => ({ url: `/blog/category/${id}`, method: "PATCH", body: data }),
      invalidatesTags: ["BlogCategory"],
    }),
    deleteBlogCategory: build.mutation({
      query: (id: string) => ({ url: `/blog/category/${id}`, method: "DELETE" }),
      invalidatesTags: ["BlogCategory"],
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useGetBlogByIdQuery,
  useGetBlogBySlugQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useApproveBlogMutation,
  useRejectBlogMutation,
  useGetPendingBlogsQuery,
  useGetAllBlogCategoriesQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} = blogApi;
