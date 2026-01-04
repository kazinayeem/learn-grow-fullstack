import mongoose, { Schema, Document } from "mongoose";

export interface ITicketReply {
  userId: mongoose.Types.ObjectId;
  userRole: "admin" | "manager" | "instructor" | "student";
  message: string;
  createdAt: Date;
}

export interface ITicket extends Document {
  title: string;
  description: string;
  status: "open" | "in_progress" | "solved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "technical" | "billing" | "course" | "account" | "other";
  createdBy: mongoose.Types.ObjectId;
  createdByRole: "admin" | "manager" | "instructor" | "student";
  assignedTo?: mongoose.Types.ObjectId;
  replies: ITicketReply[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

const ticketReplySchema = new Schema<ITicketReply>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userRole: {
    type: String,
    enum: ["admin", "manager", "instructor", "student"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "solved", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["technical", "billing", "course", "account", "other"],
      default: "other",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdByRole: {
      type: String,
      enum: ["admin", "manager", "instructor", "student"],
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    replies: [ticketReplySchema],
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
ticketSchema.index({ createdBy: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
