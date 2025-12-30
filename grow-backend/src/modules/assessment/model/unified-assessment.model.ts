import { Schema, model, Types, Document } from "mongoose";

export type AssessmentType = "quiz" | "assignment" | "mid-exam" | "final-exam" | "project";
export type AssessmentStatus = "draft" | "published";
export type QuestionType = "multiple-choice" | "short-answer" | "true-false" | "essay";

// Question interface for quiz/exam types
export interface IQuestion {
  _id?: Types.ObjectId;
  questionText: string;
  questionImage?: string;
  questionType: QuestionType;
  options?: {
    _id?: Types.ObjectId;
    text: string;
    isCorrect: boolean;
  }[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
  order: number;
}

// Unified Assessment Model
export interface IUnifiedAssessment extends Document {
  courseId: Types.ObjectId;
  createdBy: Types.ObjectId;
  type: AssessmentType;
  title: string;
  description: string;
  instructions?: string;
  
  // For quiz/exam types
  questions?: IQuestion[];
  duration?: number; // in minutes
  passingScore?: number; // percentage
  totalPoints?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showCorrectAnswers?: boolean;
  
  // For assignment/project types
  dueDate?: Date;
  maxScore?: number;
  attachments?: string[];
  allowLateSubmission?: boolean;
  
  // Common fields
  status: AssessmentStatus;
  totalAttempts?: number; // 0 = unlimited
  submissionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Submission Model for all assessment types
export interface IAssessmentSubmission extends Document {
  assessmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  
  // For quiz/exam submissions
  answers?: {
    questionId: Types.ObjectId;
    answer: string | string[]; // string for text, array for multiple choice
    isCorrect?: boolean;
    pointsEarned?: number;
  }[];
  
  // For assignment/project submissions
  submissionLink?: string;
  submissionText?: string;
  submissionFiles?: string[];
  
  // Common fields
  submittedAt: Date;
  score?: number;
  percentage?: number;
  feedback?: string;
  status: "submitted" | "graded" | "in-progress";
  attemptNumber?: number;
  timeSpent?: number; // in minutes
  
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    questionText: { type: String, required: true },
    questionImage: { type: String },
    questionType: {
      type: String,
      enum: ["multiple-choice", "short-answer", "true-false", "essay"],
      default: "multiple-choice",
      required: true,
    },
    options: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    correctAnswer: { type: String },
    points: { type: Number, default: 1, required: true, min: 1 },
    explanation: { type: String },
    order: { type: Number, required: true },
  },
  { _id: true }
);

const unifiedAssessmentSchema = new Schema<IUnifiedAssessment>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["quiz", "assignment", "mid-exam", "final-exam", "project"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructions: { type: String },
    
    // Quiz/Exam fields
    questions: [questionSchema],
    duration: { type: Number, min: 1 },
    passingScore: { type: Number, min: 0, max: 100 },
    totalPoints: { type: Number, min: 0 },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    
    // Assignment/Project fields
    dueDate: { type: Date },
    maxScore: { type: Number, min: 1 },
    attachments: [{ type: String }],
    allowLateSubmission: { type: Boolean, default: false },
    
    // Common fields
    status: { type: String, enum: ["draft", "published"], default: "published" },
    totalAttempts: { type: Number, default: 0 },
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const assessmentSubmissionSchema = new Schema<IAssessmentSubmission>(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: "UnifiedAssessment", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    
    // Quiz/Exam answers
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, required: true },
        answer: { type: Schema.Types.Mixed, required: true },
        isCorrect: { type: Boolean },
        pointsEarned: { type: Number },
      },
    ],
    
    // Assignment/Project submission
    submissionLink: { type: String },
    submissionText: { type: String },
    submissionFiles: [{ type: String }],
    
    // Common fields
    submittedAt: { type: Date, default: Date.now },
    score: { type: Number, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    status: { type: String, enum: ["submitted", "graded", "in-progress"], default: "submitted" },
    attemptNumber: { type: Number, default: 1 },
    timeSpent: { type: Number },
  },
  { timestamps: true }
);

// Indexes
unifiedAssessmentSchema.index({ courseId: 1, type: 1, status: 1 });
unifiedAssessmentSchema.index({ createdBy: 1 });
assessmentSubmissionSchema.index({ assessmentId: 1, studentId: 1 });

export const UnifiedAssessment = model<IUnifiedAssessment>("UnifiedAssessment", unifiedAssessmentSchema);
export const AssessmentSubmission = model<IAssessmentSubmission>("AssessmentSubmission", assessmentSubmissionSchema);
