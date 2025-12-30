import { Schema, model, Types } from "mongoose";

export interface IEnrollment {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  progress: number;
  completionPercentage?: number;
  isCompleted: boolean;
  completedLessons: Types.ObjectId[];
  completedModules: Types.ObjectId[];
  completedAssignments: Types.ObjectId[];
  completedQuizzes: Types.ObjectId[];
  completedProjects: Types.ObjectId[];
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

    // Detailed Progress Tracking
    completedLessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    completedModules: [{ type: Schema.Types.ObjectId, ref: "Module" }],
    completedAssignments: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
    completedQuizzes: [{ type: Schema.Types.ObjectId, ref: "Quiz" }],
    completedProjects: [{ type: Schema.Types.ObjectId, ref: "Assignment" }],
  },
  { timestamps: true }
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>("Enrollment", enrollmentSchema);
