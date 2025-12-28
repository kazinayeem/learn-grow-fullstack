import { Schema, model, Types } from "mongoose";

export interface IEvent {
  title: string;
  type: "Workshop" | "Seminar" | "Competition" | "Bootcamp" | "Webinar";
  shortDescription: string;
  detailedDescription: string;
  bannerImage?: string;
  
  // Date & Time
  eventDate: Date;
  startTime: string;
  endTime: string;
  registrationDeadline?: Date;
  
  // Event Mode
  mode: "Online" | "Offline";
  
  // Offline details
  venueName?: string;
  venueAddress?: string;
  googleMapLink?: string;
  
  // Online details
  platformType?: "Zoom" | "Google Meet" | "Microsoft Teams" | "Custom";
  meetingLink?: string;
  platformInstructions?: string;
  
  // Seats & Status
  maxSeats: number;
  registeredCount: number;
  isRegistrationOpen: boolean;
  status: "Upcoming" | "Ongoing" | "Completed";
  
  // Guests
  guests: Types.ObjectId[];
  
  // Metadata
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["Workshop", "Seminar", "Competition", "Bootcamp", "Webinar"],
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: 300,
    },
    detailedDescription: {
      type: String,
      required: true,
    },
    bannerImage: String,
    
    // Date & Time
    eventDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    registrationDeadline: Date,
    
    // Mode
    mode: {
      type: String,
      enum: ["Online", "Offline"],
      required: true,
    },
    
    // Offline
    venueName: String,
    venueAddress: String,
    googleMapLink: String,
    
    // Online
    platformType: {
      type: String,
      enum: ["Zoom", "Google Meet", "Microsoft Teams", "Custom"],
    },
    meetingLink: String,
    platformInstructions: String,
    
    // Seats
    maxSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isRegistrationOpen: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed"],
      default: "Upcoming",
    },
    
    // Guests
    guests: [{
      type: Schema.Types.ObjectId,
      ref: "EventGuest",
    }],
    
    // Admin
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for search and filtering
eventSchema.index({ title: "text" });
eventSchema.index({ type: 1 });
eventSchema.index({ mode: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ createdBy: 1 });

export const Event = model<IEvent>("Event", eventSchema);
