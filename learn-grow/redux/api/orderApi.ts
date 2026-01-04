import { baseApi } from "./baseApi";

export interface DeliveryAddress {
  name: string;
  phone: string;
  fullAddress: string;
  city: string;
  postalCode: string;
}

export interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  planType: "single" | "quarterly" | "kit" | "school";
  courseId?: {
    _id: string;
    title: string;
    thumbnail: string;
  };
  paymentMethodId: {
    _id: string;
    name: string;
    accountNumber: string;
  };
  transactionId: string;
  senderNumber: string;
  paymentNote?: string;
  paymentStatus: "pending" | "approved" | "rejected";
  deliveryAddress?: DeliveryAddress;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  planType: "single" | "quarterly" | "kit" | "school";
  courseId?: string;
  paymentMethodId: string;
  transactionId: string;
  senderNumber: string;
  paymentNote?: string;
  deliveryAddress?: DeliveryAddress;
  price: number;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<{ message: string; order: Order }, CreateOrderPayload>({
      query: (data) => ({
        url: "/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),

    getMyOrders: builder.query<{ orders: Order[] }, void>({
      query: () => "/orders/my",
      providesTags: ["Order"],
    }),

    getAllOrders: builder.query<
      {
        orders: Order[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      },
      { status?: string; planType?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/orders",
        params,
      }),
      providesTags: ["Order"],
    }),

    getOrderById: builder.query<{ order: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    approveOrder: builder.mutation<{ message: string; order: Order }, string>({
      query: (id) => ({
        url: `/orders/${id}/approve`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: {},
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Order", id }, "Order"],
    }),

    rejectOrder: builder.mutation<{ message: string; order: Order }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/reject`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Order", id }, "Order"],
    }),

    checkActiveSubscription: builder.query<
      {
        hasActiveSubscription: boolean;
        subscription?: {
          startDate: string;
          endDate: string;
          daysRemaining: number;
        };
        expired?: boolean;
        lastExpiredDate?: string;
      },
      void
    >({
      query: () => "/orders/subscription/check",
      providesTags: ["Order"],
    }),

    getUserPurchasedCourses: builder.query<
      {
        courses: Array<{
          course: {
            _id: string;
            title: string;
            thumbnail: string;
            instructor: string;
            duration: number;
          };
          accessUntil: string;
          accessType: string;
        }>;
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
        hasQuarterlyAccess: boolean;
      },
      number | void
    >({
      query: (page = 1) => `/orders/purchased-courses?page=${page}`,
      providesTags: ["Order"],
    }),

    // Get orders for a specific student (admin only)
    getStudentOrders: builder.query<
      {
        success: boolean;
        data: Order[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      },
      { studentId: string; page?: number; limit?: number }
    >({
      query: ({ studentId, page = 1, limit = 20 }) => ({
        url: '/orders',
        params: { userId: studentId, page, limit }
      }),
      providesTags: ["Order"],
    }),

    // Get enrolled students for a course (instructor)
    getEnrolledStudents: builder.query<
      {
        success: boolean;
        message: string;
        data: {
          students: Array<{
            _id: string;
            name: string;
            email: string;
            phone?: string;
            profileImage?: string;
            enrolledAt: string;
            accessType: "single" | "quarterly";
            expiresAt?: string;
            orderId: string;
          }>;
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        };
      },
      { courseId: string; page?: number; limit?: number }
    >({
      query: ({ courseId, page = 1, limit = 20 }) => 
        `/orders/course/${courseId}/students?page=${page}&limit=${limit}`,
      providesTags: ["Order"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useApproveOrderMutation,
  useRejectOrderMutation,
  useCheckActiveSubscriptionQuery,
  useGetUserPurchasedCoursesQuery,
  useGetEnrolledStudentsQuery,
  useGetStudentOrdersQuery,
} = orderApi;
