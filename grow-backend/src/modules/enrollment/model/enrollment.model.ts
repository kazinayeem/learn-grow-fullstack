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
  // Access control fields
  accessDuration?: "1-month" | "2-months" | "3-months" | "lifetime";
  accessStartDate?: Date;
  accessEndDate?: Date; // Null = lifetime access
  purchaseType?: "single" | "combo"; // How user got access (single course or combo)
  comboId?: Types.ObjectId; // If purchased as part of combo
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

    // Access control fields
    accessDuration: {
      type: String,
      enum: ["1-month", "2-months", "3-months", "lifetime"],
      default: "lifetime",
    },
    accessStartDate: {
      type: Date,
      default: () => new Date(),
    },
    accessEndDate: {
      type: Date,
      default: null, // null = lifetime access
    },
    purchaseType: {
      type: String,
      enum: ["single", "combo"],
      default: "single",
    },
    comboId: {
      type: Schema.Types.ObjectId,
      ref: "Combo",
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Index for checking access expiry
enrollmentSchema.index({ accessEndDate: 1 });
enrollmentSchema.index({ studentId: 1, accessEndDate: 1 });

export const Enrollment = model<IEnrollment>("Enrollment", enrollmentSchema);
