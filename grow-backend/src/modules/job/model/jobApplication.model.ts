import { Schema, model } from "mongoose";

export interface IJobApplication {
  jobId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  email: string;
  fullName: string;
  phone: string;
  resumeUrl: string;
  linkedinProfile?: string;
  additionalInfo?: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
  appliedAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "JobPost",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    linkedinProfile: {
      type: String,
      default: null,
    },
    additionalInfo: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
jobApplicationSchema.index({ jobId: 1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ appliedAt: -1 });
jobApplicationSchema.index({ jobId: 1, status: 1 });

export const JobApplication = model<IJobApplication>(
  "JobApplication",
  jobApplicationSchema
);
