import { Schema, model, Types } from "mongoose";

export interface ILesson {
  moduleId: Types.ObjectId;
  title: string;
  description?: string;
  type: "video" | "pdf" | "quiz" | "assignment" | "article";
  contentUrl?: string;
  duration?: number;
  orderIndex: number;
  isPublished?: boolean;
  isFreePreview?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: String,
    type: {
      type: String,
      enum: ["video", "pdf", "quiz", "assignment", "article"],
      required: true,
    },
    contentUrl: String,
    duration: {
      type: Number,
      min: 0,
    },
    orderIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

lessonSchema.index({ moduleId: 1, orderIndex: 1 });

export const Lesson = model<ILesson>("Lesson", lessonSchema);
