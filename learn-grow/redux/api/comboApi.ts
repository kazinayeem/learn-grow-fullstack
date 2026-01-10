import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ICombo, IComboOrder, IUserAccessStatus } from "@/types/combo.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const comboApi = createApi({
  reducerPath: "comboApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Combo", "UserCombos", "UserAccess"],

  endpoints: (builder) => ({
    // Get all active combos (for students)
    getActiveCombos: builder.query<
      { success: boolean; data: ICombo[]; pagination: any },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `/combo/list?page=${page}&limit=${limit}`,
      providesTags: ["Combo"],
    }),

    // Get all combos (for admin)
    getAllCombos: builder.query<
      { success: boolean; data: ICombo[]; pagination: any },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `/combo/all?page=${page}&limit=${limit}`,
      providesTags: ["Combo"],
    }),

    // Get combo by ID
    getComboById: builder.query<{ success: boolean; data: ICombo }, string>({
      query: (comboId) => `/combo/${comboId}`,
      providesTags: ["Combo"],
    }),

    // Create combo (Admin)
    createCombo: builder.mutation<
      { success: boolean; data: ICombo; message: string },
      Omit<ICombo, "_id" | "createdAt" | "updatedAt">
    >({
      query: (combo) => ({
        url: "/combo/create",
        method: "POST",
        body: combo,
      }),
      invalidatesTags: ["Combo"],
    }),

    // Update combo (Admin)
    updateCombo: builder.mutation<
      { success: boolean; data: ICombo; message: string },
      { comboId: string; data: Partial<ICombo> }
    >({
      query: ({ comboId, data }) => ({
        url: `/combo/${comboId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Combo"],
    }),

    // Disable combo (Admin)
    disableCombo: builder.mutation<
      { success: boolean; data: ICombo; message: string },
      string
    >({
      query: (comboId) => ({
        url: `/combo/${comboId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Combo"],
    }),

    // Get user's combo purchases
    getUserComboPurchases: builder.query<
      { success: boolean; data: IComboOrder[] },
      void
    >({
      query: () => `/combo/my/purchases`,
      providesTags: ["UserCombos"],
    }),

    // Extend user's combo access (Admin)
    extendComboAccess: builder.mutation<
      { success: boolean; message: string },
      {
        userId: string;
        comboId: string;
        newDuration: "1-month" | "2-months" | "3-months" | "lifetime";
      }
    >({
      query: (data) => ({
        url: `/combo/extend-access`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserAccess"],
    }),

    // Enroll in combo (after payment)
    enrollInCombo: builder.mutation<
      { success: boolean; message: string; data: any },
      { comboId: string }
    >({
      query: (data) => ({
        url: `/combo/enroll`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserCombos"],
    }),
  }),
});

export const {
  useGetActiveCombosQuery,
  useGetAllCombosQuery,
  useGetComboByIdQuery,
  useCreateComboMutation,
  useUpdateComboMutation,
  useDisableComboMutation,
  useGetUserComboPurchasesQuery,
  useExtendComboAccessMutation,
  useEnrollInComboMutation,
} = comboApi;
