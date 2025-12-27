import { baseApi } from "./baseApi";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCommission: build.query<{ success: boolean; data?: { platformCommissionPercent: number; instructorPayoutPercent: number } }, void>({
      query: () => ({ url: "/settings/commission", method: "GET" }),
      providesTags: ["SiteContent"],
    }),
    updateCommission: build.mutation<{ success: boolean; data?: { platformCommissionPercent: number; instructorPayoutPercent: number } }, { platformCommissionPercent: number }>({
      query: (body) => ({ url: "/settings/commission", method: "PATCH", body }),
      invalidatesTags: ["SiteContent"],
    }),
  }),
});

export const { useGetCommissionQuery, useUpdateCommissionMutation } = settingsApi;
