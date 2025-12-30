import { Schema, model, Types, Document } from "mongoose";

export interface IAssignment extends Document {
  assessmentId: Types.ObjectId;
  courseId: Types.ObjectId;
  createdBy: Types.ObjectId;
  assessmentType: "assignment" | "project";
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  maxScore: number;
  attachments?: string[];
  status: "draft" | "published";
  submissionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssignmentSubmission extends Document {
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  submissionLink: string;
  submittedAt: Date;
  score?: number;
  feedback?: string;
  status: "submitted" | "graded";
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assessmentType: { type: String, enum: ["assignment", "project"], default: "assignment" },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructions: { type: String },
    dueDate: { type: Date, required: true },
    maxScore: { type: Number, required: true, default: 100 },
    attachments: [{ type: String }],
    status: { type: String, enum: ["draft", "published"], default: "published" },
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    submissionLink: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    score: { type: Number, min: 0 },
    feedback: { type: String },
    status: { type: String, enum: ["submitted", "graded"], default: "submitted" },
  },
  { timestamps: true }
);

assignmentSchema.index({ courseId: 1, status: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Assignment = model<IAssignment>("Assignment", assignmentSchema);
export const AssignmentSubmission = model<IAssignmentSubmission>("AssignmentSubmission", assignmentSubmissionSchema);
