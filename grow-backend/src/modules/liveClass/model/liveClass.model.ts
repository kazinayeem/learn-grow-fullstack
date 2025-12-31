import { Schema, model, Types } from "mongoose";

export interface ILiveClass {
  title: string;
  courseId: Types.ObjectId;
  instructorId: Types.ObjectId;
  scheduledAt: Date;
  duration: number;
  platform: "Zoom" | "Meet" | "Other";
  meetingLink: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  isApproved: boolean;
  recordedLink?: string;
}

const liveClassSchema = new Schema<ILiveClass>({
  title: String,
  courseId: { type: Schema.Types.ObjectId, ref: "Course" },
  instructorId: { type: Schema.Types.ObjectId, ref: "User" },
  scheduledAt: Date,
  duration: Number,
  platform: { type: String, enum: ["Zoom", "Meet", "Other"] },
  meetingLink: String,
  recordedLink: { type: String, default: null },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled",
  },
  isApproved: { type: Boolean, default: false },
}, { 
  timestamps: true 
});

export const LiveClass = model<ILiveClass>("LiveClass", liveClassSchema);
