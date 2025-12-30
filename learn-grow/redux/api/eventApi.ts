import { baseApi } from "./baseApi";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Public endpoints
    getAllEvents: build.query({
      query: (params = {}) => ({
        url: "/events",
        method: "GET",
        params,
      }),
      providesTags: ["Event"],
    }),
    
    getEventById: build.query({
      query: (id: string) => ({ url: `/events/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),
    
    registerForEvent: build.mutation({
      query: ({ eventId, ...data }) => ({
        url: `/events/${eventId}/register`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    
    // Admin endpoints - Events
    createEvent: build.mutation({
      query: (data) => ({ url: "/events/create", method: "POST", body: data }),
      invalidatesTags: ["Event"],
    }),
    
    updateEvent: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/events/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Event", id }, "Event"],
    }),
    
    deleteEvent: build.mutation({
      query: (id: string) => ({ url: `/events/${id}`, method: "DELETE" }),
      invalidatesTags: ["Event"],
    }),
    
    addGuestsToEvent: build.mutation({
      query: ({ eventId, guestIds }) => ({
        url: `/events/${eventId}/guests`,
        method: "POST",
        body: { guestIds },
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    
    removeGuestFromEvent: build.mutation({
      query: ({ eventId, guestId }) => ({
        url: `/events/${eventId}/guests/${guestId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    
    updateMeetingLink: build.mutation({
      query: ({ eventId, meetingLink, platformInstructions }) => ({
        url: `/events/${eventId}/meeting-link`,
        method: "PATCH",
        body: { meetingLink, platformInstructions },
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: "Event", id: eventId }],
    }),
    
    // Admin endpoints - Guests
    getAllGuests: build.query({
      query: (params = {}) => ({
        url: "/events/guests/list",
        method: "GET",
        params,
      }),
      providesTags: ["EventGuest"],
    }),
    
    getGuestById: build.query({
      query: (id: string) => ({ url: `/events/guests/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "EventGuest", id }],
    }),
    
    createGuest: build.mutation({
      query: (data) => ({ url: "/events/guests/create", method: "POST", body: data }),
      invalidatesTags: ["EventGuest"],
    }),
    
    updateGuest: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/events/guests/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "EventGuest", id }, "EventGuest"],
    }),
    
    deleteGuest: build.mutation({
      query: (id: string) => ({ url: `/events/guests/${id}`, method: "DELETE" }),
      invalidatesTags: ["EventGuest"],
    }),
    
    // Admin endpoints - Registrations
    getEventRegistrations: build.query({
      query: ({ eventId, ...params }) => ({
        url: `/events/${eventId}/registrations`,
        method: "GET",
        params,
      }),
      providesTags: ["EventRegistration"],
    }),
    
    getAllRegistrations: build.query({
      query: (params = {}) => ({
        url: "/events/admin/registrations",
        method: "GET",
        params,
      }),
      providesTags: ["EventRegistration"],
    }),
    
    deleteRegistration: build.mutation({
      query: (id: string) => ({
        url: `/events/registrations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EventRegistration", "Event"],
    }),

    updateRegistration: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/events/registrations/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["EventRegistration", "Event"],
    }),

    sendRegistrationEmails: build.mutation({
      query: ({ eventId, subject, content, registrationIds }) => ({
        url: `/events/${eventId}/registrations/send-email`,
        method: "POST",
        body: { subject, content, registrationIds },
      }),
      invalidatesTags: ["EventRegistration"],
    }),

    getEventEmailHistory: build.query({
      query: ({ eventId, ...params }) => ({
        url: `/events/${eventId}/registrations/email-history`,
        method: "GET",
        params,
      }),
      providesTags: ["EventRegistration"],
    }),
  }),
});

export const {
  useGetAllEventsQuery,
  useGetEventByIdQuery,
  useRegisterForEventMutation,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useAddGuestsToEventMutation,
  useRemoveGuestFromEventMutation,
  useUpdateMeetingLinkMutation,
  useGetAllGuestsQuery,
  useGetGuestByIdQuery,
  useCreateGuestMutation,
  useUpdateGuestMutation,
  useDeleteGuestMutation,
  useGetEventRegistrationsQuery,
  useGetAllRegistrationsQuery,
  useDeleteRegistrationMutation,
  useUpdateRegistrationMutation,
  useSendRegistrationEmailsMutation,
  useGetEventEmailHistoryQuery,
} = eventApi;
