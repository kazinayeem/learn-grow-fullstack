import express from "express";
import { requireAuth } from "../../../middleware/auth.js";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  addReply,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
  getTicketStats,
} from "../controller/ticket.controller.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Create ticket
router.post("/", createTicket);

// Get all tickets (role-based filtering)
router.get("/", getAllTickets);

// Get ticket statistics
router.get("/stats", getTicketStats);

// Get single ticket
router.get("/:id", getTicketById);

// Add reply to ticket
router.post("/:id/reply", addReply);

// Update ticket status
router.patch("/:id/status", updateTicketStatus);

// Assign ticket to manager (admin only)
router.patch("/:id/assign", assignTicket);

// Delete ticket (admin only)
router.delete("/:id", deleteTicket);

export default router;
