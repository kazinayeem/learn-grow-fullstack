import { baseApi } from "../api/baseApi";

export interface TicketReply {
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  userRole: "admin" | "manager" | "instructor" | "student";
  message: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "solved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "technical" | "billing" | "course" | "account" | "other";
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  createdByRole: "admin" | "manager" | "instructor" | "student";
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  replies: TicketReply[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface TicketStats {
  open: number;
  inProgress: number;
  solved: number;
  closed: number;
  total: number;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority?: "low" | "medium" | "high" | "urgent";
  category?: "technical" | "billing" | "course" | "account" | "other";
}

export interface AddReplyRequest {
  message: string;
}

export interface UpdateStatusRequest {
  status: "open" | "in_progress" | "solved" | "closed";
}

export interface AssignTicketRequest {
  assignedTo: string;
}

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tickets
    getAllTickets: builder.query<
      { success: boolean; data: Ticket[]; pagination: any },
      { status?: string; priority?: string; page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/tickets",
        params,
      }),
      providesTags: ["Tickets"],
    }),

    // Get single ticket
    getTicketById: builder.query<{ success: boolean; data: Ticket }, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (result, error, id) => [{ type: "Tickets", id }],
    }),

    // Get ticket statistics
    getTicketStats: builder.query<{ success: boolean; data: TicketStats }, void>({
      query: () => "/tickets/stats",
      providesTags: ["TicketStats"],
    }),

    // Create ticket
    createTicket: builder.mutation<
      { success: boolean; message: string; data: Ticket },
      CreateTicketRequest
    >({
      query: (body) => ({
        url: "/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tickets", "TicketStats"],
    }),

    // Add reply
    addReply: builder.mutation<
      { success: boolean; message: string; data: Ticket },
      { id: string; message: string }
    >({
      query: ({ id, message }) => ({
        url: `/tickets/${id}/reply`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Tickets",
        { type: "Tickets", id },
      ],
    }),

    // Update ticket status
    updateTicketStatus: builder.mutation<
      { success: boolean; message: string; data: Ticket },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/tickets/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Tickets",
        "TicketStats",
        { type: "Tickets", id },
      ],
    }),

    // Assign ticket
    assignTicket: builder.mutation<
      { success: boolean; message: string; data: Ticket },
      { id: string; assignedTo: string }
    >({
      query: ({ id, assignedTo }) => ({
        url: `/tickets/${id}/assign`,
        method: "PATCH",
        body: { assignedTo },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Tickets",
        { type: "Tickets", id },
      ],
    }),

    // Delete ticket
    deleteTicket: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tickets", "TicketStats"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketStatsQuery,
  useCreateTicketMutation,
  useAddReplyMutation,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useDeleteTicketMutation,
} = ticketApi;
