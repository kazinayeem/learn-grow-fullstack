import { Schema, model, Types } from "mongoose";

export interface ICourse {
  title: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  thumbnail?: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  duration: number;
  rating?: number;
  ratingsCount?: number;
  studentsEnrolled?: number;
  instructorId: Types.ObjectId;
  isPublished: boolean;
  isFeatured?: boolean;
  isAdminApproved?: boolean; // For admin approval of published courses
  tags?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    thumbnail: String,
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isAdminApproved: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    learningOutcomes: [String],
    prerequisites: [String],
  },
  { timestamps: true }
);

courseSchema.index({ instructorId: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1, isFeatured: -1 });

export const Course = model<ICourse>("Course", courseSchema);
