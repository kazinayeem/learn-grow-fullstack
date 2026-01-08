import { Schema, model } from "mongoose";

export interface IContact {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const contactSchema = new Schema<IContact>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ subject: "text", message: "text" });

export const Contact = model<IContact>("Contact", contactSchema);
