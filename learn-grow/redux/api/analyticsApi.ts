import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApi } from "./baseApi";

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: () => "/analytics",
      providesTags: ["Analytics"],
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApi;
