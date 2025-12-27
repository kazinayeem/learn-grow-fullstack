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
}

const liveClassSchema = new Schema<ILiveClass>({
  title: String,
  courseId: { type: Schema.Types.ObjectId, ref: "Course" },
  instructorId: { type: Schema.Types.ObjectId, ref: "User" },
  scheduledAt: Date,
  duration: Number,
  platform: { type: String, enum: ["Zoom", "Meet", "Other"] },
  meetingLink: String,
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled",
  },
});

export const LiveClass = model<ILiveClass>("LiveClass", liveClassSchema);
