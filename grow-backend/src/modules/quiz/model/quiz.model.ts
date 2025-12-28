import { Schema, model, Types, Document } from "mongoose";

export interface IQuizQuestion {
  _id?: Types.ObjectId;
  questionText: string;
  questionImage?: string;
  questionType: "multiple-choice" | "short-answer" | "true-false";
  options?: {
    _id?: Types.ObjectId;
    text: string;
    isCorrect: boolean;
  }[];
  correctAnswer?: string; // for short-answer and true-false
  points: number;
  explanation?: string;
  order: number;
}

export interface IQuiz extends Document {
  assessmentId: Types.ObjectId;
  courseId: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  description?: string;
  questions: IQuizQuestion[];
  duration: number; // in minutes
  passingScore: number; // percentage (0-100)
  totalPoints: number; // sum of all question points
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean; // after submission
  status: "draft" | "active" | "published";
  totalAttempts: number; // 0 = unlimited
  attemptCount: number; // how many students have attempted
  submissionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    questionText: { type: String, required: true },
    questionImage: { type: String },
    questionType: {
      type: String,
      enum: ["multiple-choice", "short-answer", "true-false"],
      default: "multiple-choice",
      required: true,
    },
    options: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    correctAnswer: { type: String }, // for short-answer and true-false
    points: { type: Number, default: 1, required: true, min: 1 },
    explanation: { type: String },
    order: { type: Number, required: true },
  },
  { _id: true }
);

const quizSchema = new Schema<IQuiz>(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    questions: [quizQuestionSchema],
    duration: { type: Number, required: true, min: 1 }, // minutes
    passingScore: { type: Number, default: 60, min: 0, max: 100 },
    totalPoints: { type: Number, required: true, min: 0 },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    status: { type: String, enum: ["draft", "active", "published"], default: "draft" },
    totalAttempts: { type: Number, default: 0 }, // 0 = unlimited
    attemptCount: { type: Number, default: 0 },
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for faster queries
quizSchema.index({ courseId: 1, status: 1 });
quizSchema.index({ createdBy: 1 });

export const Quiz = model<IQuiz>("Quiz", quizSchema);
