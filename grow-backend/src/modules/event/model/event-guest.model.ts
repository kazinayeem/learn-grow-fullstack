import { Schema, model, Types } from "mongoose";

export interface IEventGuest {
  fullName: string;
  role: "Guest" | "Host" | "Speaker" | "Mentor" | "Judge";
  email?: string;
  phoneNumber?: string;
  bio?: string;
  profileImage?: string;
  organization?: string;
  designation?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventGuestSchema = new Schema<IEventGuest>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["Guest", "Host", "Speaker", "Mentor", "Judge"],
      required: true,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    profileImage: String,
    organization: String,
    designation: String,
    linkedinUrl: String,
    twitterUrl: String,
    websiteUrl: String,
  },
  { timestamps: true }
);

export const EventGuest = model<IEventGuest>("EventGuest", eventGuestSchema);
