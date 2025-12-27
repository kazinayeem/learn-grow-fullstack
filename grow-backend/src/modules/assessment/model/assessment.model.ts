import { Schema, model, Types, Document } from "mongoose";

export type AssessmentType = "quiz" | "assignment" | "mid-exam" | "final-exam" | "project";
export type AssessmentStatus = "draft" | "active" | "published";

export interface IAssessment extends Document {
  courseId: Types.ObjectId;
  createdBy: Types.ObjectId;
  type: AssessmentType;
  title: string;
  description?: string;
  questions?: number; // for quizzes/exams
  dueDate?: Date; // for assignments/project
  status: AssessmentStatus;
  submissionsCount: number;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["quiz", "assignment", "mid-exam", "final-exam", "project"], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    questions: { type: Number },
    dueDate: { type: Date },
    status: { type: String, enum: ["draft", "active", "published"], default: "draft" },
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Assessment = model<IAssessment>("Assessment", assessmentSchema);
