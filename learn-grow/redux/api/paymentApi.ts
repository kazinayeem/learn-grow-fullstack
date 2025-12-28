import { baseApi } from "./baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Public endpoint
    getAllPaymentMethods: build.query({
      query: (params = {}) => ({
        url: "/payment-methods",
        method: "GET",
        params,
      }),
      providesTags: ["PaymentMethod"],
    }),

    // Admin endpoints
    getPaymentMethodById: build.query({
      query: (id: string) => ({
        url: `/payment-methods/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "PaymentMethod", id }],
    }),

    createPaymentMethod: build.mutation({
      query: (data) => ({
        url: "/payment-methods",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PaymentMethod"],
    }),

    updatePaymentMethod: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/payment-methods/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PaymentMethod", id },
        "PaymentMethod",
      ],
    }),

    deletePaymentMethod: build.mutation({
      query: (id: string) => ({
        url: `/payment-methods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PaymentMethod"],
    }),

    togglePaymentMethod: build.mutation({
      query: (id: string) => ({
        url: `/payment-methods/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PaymentMethod", id },
        "PaymentMethod",
      ],
    }),

    reorderPaymentMethods: build.mutation({
      query: (orders) => ({
        url: "/payment-methods/reorder",
        method: "POST",
        body: { orders },
      }),
      invalidatesTags: ["PaymentMethod"],
    }),
  }),
});

export const {
  useGetAllPaymentMethodsQuery,
  useGetPaymentMethodByIdQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useTogglePaymentMethodMutation,
  useReorderPaymentMethodsMutation,
} = paymentApi;
