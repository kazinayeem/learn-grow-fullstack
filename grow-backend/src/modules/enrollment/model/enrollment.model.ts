import { Schema, model, Types } from "mongoose";

export interface IEnrollment {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  progress: number;
  completionPercentage?: number;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    progress: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>("Enrollment", enrollmentSchema);
