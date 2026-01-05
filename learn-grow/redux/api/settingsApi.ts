import { baseApi } from "./baseApi";

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isActive: boolean;
  source?: string;
}

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

    // SMTP settings
    getSMTPConfig: build.query<{ success: boolean; data?: SMTPConfig; message?: string }, void>({
      query: () => ({ url: "/settings/smtp", method: "GET" }),
      providesTags: ["Settings"],
    }),
    updateSMTPConfig: build.mutation<
      { success: boolean; data?: SMTPConfig; message?: string },
      { host: string; port: number; secure: boolean; user: string; password?: string; fromName: string; fromEmail: string; replyTo?: string }
    >({
      query: (body) => ({ url: "/settings/smtp", method: "PUT", body }),
      invalidatesTags: ["Settings"],
    }),
    testSMTPConnection: build.mutation<{ success: boolean; message: string }, { testEmail?: string }>({
      query: (body) => ({ url: "/settings/smtp/test", method: "POST", body }),
    }),
  }),
});

export const {
  useGetCommissionQuery,
  useUpdateCommissionMutation,
  useGetSMTPConfigQuery,
  useUpdateSMTPConfigMutation,
  useTestSMTPConnectionMutation,
} = settingsApi;
