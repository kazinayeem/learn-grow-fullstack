import { Router } from "express";
import * as controller from "../controller/event.controller";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = Router();

// ===== PUBLIC ROUTES (No Authentication Required) =====

// Get all events (public)
router.get("/", controller.getAllEvents);

// Get event by ID (public)
router.get("/:id", controller.getEventById);

// Register for event (public - no login)
router.post("/:id/register", controller.registerForEvent);

// ===== ADMIN ROUTES =====

// Event management
router.post(
  "/create",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.createEvent
);

router.patch(
  "/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.updateEvent
);

router.delete(
  "/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.deleteEvent
);

// Guest management for events
router.post(
  "/:id/guests",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.addGuestsToEvent
);

router.delete(
  "/:id/guests/:guestId",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.removeGuestFromEvent
);

// Meeting link (triggers auto-notification)
router.patch(
  "/:id/meeting-link",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.updateMeetingLink
);

// Registration management
router.get(
  "/:id/registrations",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.getEventRegistrations
);

router.post(
  "/:id/registrations/send-email",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.sendRegistrationEmail
);

router.get(
  "/:id/registrations/email-history",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.getEmailHistory
);

router.delete(
  "/registrations/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.deleteRegistration
);

router.patch(
  "/registrations/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.updateRegistration
);

// ===== GUEST ROUTES =====

// Public guest listing
router.get("/guests/list", controller.getAllGuests);

// Admin guest management
router.post(
  "/guests/create",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.createGuest
);

router.get(
  "/guests/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.getGuestById
);

router.patch(
  "/guests/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.updateGuest
);

router.delete(
  "/guests/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.deleteGuest
);

export default router;
