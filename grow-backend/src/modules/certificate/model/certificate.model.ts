import mongoose, { Schema, Document } from "mongoose";

export interface ICertificate extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  certificateId: string; // Unique certificate ID
  issuedAt: Date;
  completionDate: Date;
  qrCode: string; // QR code data URL
  verificationUrl: string;
  studentName: string;
  courseName: string;
  courseInstructor: string;
  grade?: string;
  isValid: boolean;
}

const certificateSchema = new Schema<ICertificate>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    verificationUrl: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    courseInstructor: {
      type: String,
      required: true,
    },
    grade: {
      type: String,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for quick lookup
certificateSchema.index({ studentId: 1, courseId: 1 });

export const Certificate = mongoose.model<ICertificate>("Certificate", certificateSchema);
