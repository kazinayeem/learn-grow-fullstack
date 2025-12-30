import { Request, Response } from "express";
import * as service from "../service/event.service";
import * as notificationService from "../service/event-notification.service";

// ===== EVENT CONTROLLERS =====

export const createEvent = async (req: Request, res: Response) => {
  try {
    req.body.createdBy = req.userId;
    const event = await service.createEvent(req.body);
    
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const result = await service.getAllEvents(req.query);
    
    res.json({
      success: true,
      message: "Events retrieved successfully",
      data: result.events,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve events",
      error: error.message,
    });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await service.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    res.json({
      success: true,
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve event",
      error: error.message,
    });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const event = await service.updateEvent(req.params.id, req.body);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    res.json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await service.deleteEvent(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
};

export const addGuestsToEvent = async (req: Request, res: Response) => {
  try {
    const event = await service.addGuestsToEvent(req.params.id, req.body.guestIds);
    
    res.json({
      success: true,
      message: "Guests added successfully",
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to add guests",
      error: error.message,
    });
  }
};

export const removeGuestFromEvent = async (req: Request, res: Response) => {
  try {
    const event = await service.removeGuestFromEvent(req.params.id, req.params.guestId);
    
    res.json({
      success: true,
      message: "Guest removed successfully",
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to remove guest",
      error: error.message,
    });
  }
};

export const updateMeetingLink = async (req: Request, res: Response) => {
  try {
    const result = await service.updateMeetingLink(
      req.params.id,
      req.body.meetingLink,
      req.body.platformInstructions
    );
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Send notifications if needed
    if (result.shouldNotify) {
      await notificationService.sendMeetingLinkToAllAttendees(req.params.id);
    }
    
    res.json({
      success: true,
      message: result.shouldNotify
        ? "Meeting link updated and notifications sent"
        : "Meeting link updated",
      data: result.event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update meeting link",
      error: error.message,
    });
  }
};

// ===== GUEST CONTROLLERS =====

export const createGuest = async (req: Request, res: Response) => {
  try {
    const guest = await service.createGuest(req.body);
    
    res.status(201).json({
      success: true,
      message: "Guest created successfully",
      data: guest,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create guest",
      error: error.message,
    });
  }
};

export const getAllGuests = async (req: Request, res: Response) => {
  try {
    const result = await service.getAllGuests(req.query);
    
    res.json({
      success: true,
      message: "Guests retrieved successfully",
      data: result.guests,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve guests",
      error: error.message,
    });
  }
};

export const getGuestById = async (req: Request, res: Response) => {
  try {
    const guest = await service.getGuestById(req.params.id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }
    
    res.json({
      success: true,
      message: "Guest retrieved successfully",
      data: guest,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve guest",
      error: error.message,
    });
  }
};

export const updateGuest = async (req: Request, res: Response) => {
  try {
    const guest = await service.updateGuest(req.params.id, req.body);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }
    
    res.json({
      success: true,
      message: "Guest updated successfully",
      data: guest,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update guest",
      error: error.message,
    });
  }
};

export const deleteGuest = async (req: Request, res: Response) => {
  try {
    const guest = await service.deleteGuest(req.params.id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }
    
    res.json({
      success: true,
      message: "Guest deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete guest",
      error: error.message,
    });
  }
};

// ===== REGISTRATION CONTROLLERS =====

export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const { registration, event } = await service.registerForEvent({
      eventId: req.params.id,
      ...req.body,
    });
    
    // Send confirmation email
    await notificationService.sendRegistrationConfirmation(registration, event);
    
    res.status(201).json({
      success: true,
      message: "Registration successful! Confirmation email sent.",
      data: registration,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to register for event",
    });
  }
};

export const getEventRegistrations = async (req: Request, res: Response) => {
  try {
    const result = await service.getEventRegistrations(req.params.id, req.query);
    
    res.json({
      success: true,
      message: "Registrations retrieved successfully",
      data: result.registrations,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve registrations",
      error: error.message,
    });
  }
};

export const getAllRegistrations = async (req: Request, res: Response) => {
  try {
    const result = await service.getAllRegistrations(req.query);
    
    res.json({
      success: true,
      message: "Registrations retrieved successfully",
      data: result.registrations,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve registrations",
      error: error.message,
    });
  }
};

export const deleteRegistration = async (req: Request, res: Response) => {
  try {
    const registration = await service.deleteRegistration(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    
    res.json({
      success: true,
      message: "Registration deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete registration",
      error: error.message,
    });
  }
};

export const updateRegistration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber } = req.body;

    if (!fullName && !email && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required for update",
      });
    }

    const registration = await service.updateRegistration(id, {
      fullName,
      email,
      phoneNumber,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    res.json({
      success: true,
      message: "Registration updated successfully",
      data: registration,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update registration",
      error: error.message,
    });
  }
};

export const sendRegistrationEmail = async (req: Request, res: Response) => {
  try {
    const { subject, content, registrationIds } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: "Subject and content are required",
      });
    }

    const { sent } = await notificationService.sendCustomEmailToRegistrations({
      eventId: req.params.id,
      subject,
      content,
      registrationIds,
    });

    res.json({
      success: true,
      message: "Emails sent successfully",
      data: { sent },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send emails",
    });
  }
};
export const getEmailHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page, limit, search } = req.query;

    const result = await service.getEmailHistory(id, {
      page: page as string,
      limit: limit as string,
      search: search as string,
    });

    res.json({
      success: true,
      message: "Email history retrieved successfully",
      data: result.history,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve email history",
      error: error.message,
    });
  }
};