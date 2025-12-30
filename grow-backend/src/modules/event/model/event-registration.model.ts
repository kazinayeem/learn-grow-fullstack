import { Schema, model, Types } from "mongoose";

export interface IEventRegistration {
  event: Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber: string;
  registeredAt: Date;
  notificationSent: boolean;
  emailHistory: Array<{
    subject: string;
    content: string;
    sentAt: Date;
    status: "success" | "failed";
    failureReason?: string;
  }>;
}

const eventRegistrationSchema = new Schema<IEventRegistration>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    emailHistory: [
      {
        subject: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["success", "failed"],
          default: "success",
        },
        failureReason: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound unique index - one email per event
eventRegistrationSchema.index({ event: 1, email: 1 }, { unique: true });

// Indexes for search
eventRegistrationSchema.index({ fullName: "text", email: "text" });
eventRegistrationSchema.index({ event: 1 });

export const EventRegistration = model<IEventRegistration>(
  "EventRegistration",
  eventRegistrationSchema
);
