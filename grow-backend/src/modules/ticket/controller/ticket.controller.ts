import { Request, Response } from "express";
import { Ticket } from "../model/ticket.model.js";
import { User } from "../../user/model/user.model.js";

// Create ticket
export const createTicket = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, category } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || "medium",
      category: category || "other",
      createdBy: userId,
      createdByRole: user.role,
      status: "open",
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("replies.userId", "name email role");

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: populatedTicket,
    });
  } catch (error: any) {
    console.error("Create ticket error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create ticket",
    });
  }
};

// Get all tickets (admin/manager)
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { status, priority, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};

    // Role-based filtering
    if (user.role === "manager") {
      query.assignedTo = userId;
    } else if (user.role === "instructor" || user.role === "student") {
      query.createdBy = userId;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("replies.userId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Ticket.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Get tickets error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tickets",
    });
  }
};

// Get single ticket
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const ticket = await Ticket.findById(id)
      .populate("createdBy", "name email role profileImage")
      .populate("assignedTo", "name email role profileImage")
      .populate("replies.userId", "name email role profileImage");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Check access rights
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hasAccess =
      user.role === "admin" ||
      ticket.createdBy._id.toString() === userId ||
      ticket.assignedTo?._id.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error("Get ticket error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch ticket",
    });
  }
};

// Add reply to ticket
export const addReply = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.replies.push({
      userId: userId as any,
      userRole: user.role as any,
      message,
      createdAt: new Date(),
    });

    await ticket.save();

    const updatedTicket = await Ticket.findById(id)
      .populate("createdBy", "name email role profileImage")
      .populate("assignedTo", "name email role profileImage")
      .populate("replies.userId", "name email role profileImage");

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: updatedTicket,
    });
  } catch (error: any) {
    console.error("Add reply error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add reply",
    });
  }
};

// Update ticket status
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only admin and manager can update status
    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const updateData: any = { status };
    if (status === "closed") {
      updateData.closedAt = new Date();
    }

    const ticket = await Ticket.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("replies.userId", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error: any) {
    console.error("Update ticket status error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update ticket status",
    });
  }
};

// Assign ticket to manager
export const assignTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can assign tickets",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { assignedTo },
      { new: true }
    )
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .populate("replies.userId", "name email role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });
  } catch (error: any) {
    console.error("Assign ticket error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to assign ticket",
    });
  }
};

// Delete ticket (admin only)
export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete tickets",
      });
    }

    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete ticket error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete ticket",
    });
  }
};

// Get ticket statistics
export const getTicketStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let query: any = {};
    if (user.role === "manager") {
      query.assignedTo = userId;
    } else if (user.role === "instructor" || user.role === "student") {
      query.createdBy = userId;
    }

    const [open, inProgress, solved, closed, total] = await Promise.all([
      Ticket.countDocuments({ ...query, status: "open" }),
      Ticket.countDocuments({ ...query, status: "in_progress" }),
      Ticket.countDocuments({ ...query, status: "solved" }),
      Ticket.countDocuments({ ...query, status: "closed" }),
      Ticket.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        open,
        inProgress,
        solved,
        closed,
        total,
      },
    });
  } catch (error: any) {
    console.error("Get ticket stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch ticket statistics",
    });
  }
};
