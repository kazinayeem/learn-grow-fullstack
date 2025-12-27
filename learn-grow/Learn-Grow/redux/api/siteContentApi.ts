import { baseApi } from "./baseApi";

export const siteContentApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getSiteContent: build.query({
            query: (page) => ({
                url: `/site-content/${page}`,
                method: "GET",
            }),
            providesTags: ["SiteContent"],
        }),
        updateSiteContent: build.mutation({
            query: (data) => ({
                url: "/site-content",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["SiteContent"],
        }),
    }),
});

export const { useGetSiteContentQuery, useUpdateSiteContentMutation } = siteContentApi;
