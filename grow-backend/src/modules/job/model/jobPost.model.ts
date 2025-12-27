import { Schema, model } from "mongoose";

export interface ISalaryRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface IJobPost {
  title: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Temporary";
  department: string;
  location: string;
  salaryRange?: ISalaryRange;
  description: string;
  requirements: string[];
  isPublished: boolean;
  isRemote: boolean;
  postedAt: Date;
  expiresAt?: Date;
}

const salaryRangeSchema = new Schema<ISalaryRange>(
  {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: "USD" },
  },
  { _id: false }
);

const jobPostSchema = new Schema<IJobPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Temporary"],
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    salaryRange: {
      type: salaryRangeSchema,
      required: false,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
    },
    requirements: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: "At least one requirement is needed",
      },
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for better query performance
jobPostSchema.index({ isPublished: 1, postedAt: -1 });
jobPostSchema.index({ department: 1 });
jobPostSchema.index({ jobType: 1 });

export const JobPost = model<IJobPost>("JobPost", jobPostSchema);
