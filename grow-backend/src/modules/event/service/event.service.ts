import { Event, IEvent } from "../model/event.model";
import { EventGuest } from "../model/event-guest.model";
import { EventRegistration } from "../model/event-registration.model";
import { Types } from "mongoose";

// ===== EVENT SERVICES =====

export const createEvent = async (data: Partial<IEvent>) => {
  return Event.create(data);
};

export const getAllEvents = async (filters: any = {}) => {
  const query: any = {};
  
  // Search by title
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  // Filter by type
  if (filters.type) {
    query.type = filters.type;
  }
  
  // Filter by mode
  if (filters.mode) {
    query.mode = filters.mode;
  }
  
  // Filter by status
  if (filters.status) {
    query.status = filters.status;
  }
  
  // Filter by date range
  if (filters.startDate || filters.endDate) {
    query.eventDate = {};
    if (filters.startDate) {
      query.eventDate.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.eventDate.$lte = new Date(filters.endDate);
    }
  }
  
  const page = Math.max(1, parseInt(filters.page || "1"));
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit || "10")));
  const skip = (page - 1) * limit;
  
  const events = await Event.find(query)
    .populate("guests", "fullName role profileImage organization")
    .populate("createdBy", "name email")
    .sort({ eventDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await Event.countDocuments(query);
  
  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getEventById = async (id: string) => {
  return Event.findById(id)
    .populate("guests")
    .populate("createdBy", "name email");
};

export const updateEvent = async (id: string, data: Partial<IEvent>) => {
  return Event.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("guests");
};

export const deleteEvent = async (id: string) => {
  // Also delete all registrations
  await EventRegistration.deleteMany({ event: id });
  return Event.findByIdAndDelete(id);
};

export const addGuestsToEvent = async (eventId: string, guestIds: string[]) => {
  return Event.findByIdAndUpdate(
    eventId,
    { $addToSet: { guests: { $each: guestIds } } },
    { new: true }
  ).populate("guests");
};

export const removeGuestFromEvent = async (eventId: string, guestId: string) => {
  return Event.findByIdAndUpdate(
    eventId,
    { $pull: { guests: guestId } },
    { new: true }
  ).populate("guests");
};

export const updateMeetingLink = async (eventId: string, meetingLink: string, platformInstructions?: string) => {
  const event = await Event.findByIdAndUpdate(
    eventId,
    { meetingLink, platformInstructions },
    { new: true }
  );
  
  if (!event) return null;
  
  // If online event and meeting link added, trigger notification
  if (event.mode === "Online" && meetingLink) {
    // This will be handled by the notification service
    return { event, shouldNotify: true };
  }
  
  return { event, shouldNotify: false };
};

// ===== GUEST SERVICES =====

export const createGuest = async (data: any) => {
  return EventGuest.create(data);
};

export const getAllGuests = async (filters: any = {}) => {
  const query: any = {};
  
  // Search by name
  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: "i" } },
      { organization: { $regex: filters.search, $options: "i" } },
    ];
  }
  
  // Filter by role
  if (filters.role) {
    query.role = filters.role;
  }
  
  const page = Math.max(1, parseInt(filters.page || "1"));
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit || "10")));
  const skip = (page - 1) * limit;
  
  const guests = await EventGuest.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await EventGuest.countDocuments(query);
  
  return {
    guests,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getGuestById = async (id: string) => {
  return EventGuest.findById(id);
};

export const updateGuest = async (id: string, data: any) => {
  return EventGuest.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteGuest = async (id: string) => {
  // Remove guest from all events
  await Event.updateMany(
    { guests: id },
    { $pull: { guests: id } }
  );
  return EventGuest.findByIdAndDelete(id);
};

// ===== REGISTRATION SERVICES =====

export const registerForEvent = async (data: {
  eventId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}) => {
  const event = await Event.findById(data.eventId);
  
  if (!event) {
    throw new Error("Event not found");
  }
  
  if (!event.isRegistrationOpen) {
    throw new Error("Registration is closed for this event");
  }
  
  if (event.registeredCount >= event.maxSeats) {
    throw new Error("Event is full");
  }
  
  // Check registration deadline
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    throw new Error("Registration deadline has passed");
  }
  
  // Create registration
  const registration = await EventRegistration.create({
    event: data.eventId,
    fullName: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
  });
  
  // Increment registered count
  await Event.findByIdAndUpdate(data.eventId, {
    $inc: { registeredCount: 1 },
  });
  
  return { registration, event };
};

export const getEventRegistrations = async (eventId: string, filters: any = {}) => {
  const query: any = { event: eventId };
  
  // Search by name, email, or phone
  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { phoneNumber: { $regex: filters.search, $options: "i" } },
    ];
  }
  
  const page = Math.max(1, parseInt(filters.page || "1"));
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit || "10")));
  const skip = (page - 1) * limit;
  
  const registrations = await EventRegistration.find(query)
    .sort({ registeredAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await EventRegistration.countDocuments(query);
  
  return {
    registrations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAllRegistrations = async (filters: any = {}) => {
  const query: any = {};
  
  // Search
  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { phoneNumber: { $regex: filters.search, $options: "i" } },
    ];
  }
  
  const page = Math.max(1, parseInt(filters.page || "1"));
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit || "10")));
  const skip = (page - 1) * limit;
  
  const registrations = await EventRegistration.find(query)
    .populate("event", "title type eventDate mode")
    .sort({ registeredAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await EventRegistration.countDocuments(query);
  
  return {
    registrations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getRegistrationsByEmail = async (email: string) => {
  return EventRegistration.find({ email }).populate("event");
};

export const updateRegistration = async (id: string, data: { fullName?: string; email?: string; phoneNumber?: string }) => {
  return EventRegistration.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteRegistration = async (id: string) => {
  const registration = await EventRegistration.findById(id);
  if (registration) {
    await Event.findByIdAndUpdate(registration.event, {
      $inc: { registeredCount: -1 },
    });
  }
  return EventRegistration.findByIdAndDelete(id);
};

export const markNotificationSent = async (registrationIds: string[]) => {
  return EventRegistration.updateMany(
    { _id: { $in: registrationIds } },
    { notificationSent: true }
  );
};
export const getEmailHistory = async (eventId: string, filters: any = {}) => {
  const query: any = { event: eventId };

  // Search by name or email
  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  const page = Math.max(1, parseInt(filters.page || "1"));
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit || "10")));
  const skip = (page - 1) * limit;

  // Get registrations with email history (only those with emails sent)
  const registrationsWithHistory = await EventRegistration.find({
    ...query,
    emailHistory: { $exists: true, $ne: [] },
  })
    .sort({ "emailHistory.0.sentAt": -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await EventRegistration.countDocuments({
    ...query,
    emailHistory: { $exists: true, $ne: [] },
  });

  return {
    history: registrationsWithHistory,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};