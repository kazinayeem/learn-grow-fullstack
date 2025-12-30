import mongoose, { Schema, Document } from "mongoose";

export interface EmailLog extends Document {
  applicationId: mongoose.Types.ObjectId;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  status: "sent" | "failed" | "pending";
  sentAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailLogSchema = new Schema<EmailLog>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication",
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    sentAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup
emailLogSchema.index({ applicationId: 1, createdAt: -1 });

export const EmailLog = mongoose.model<EmailLog>("EmailLog", emailLogSchema);
