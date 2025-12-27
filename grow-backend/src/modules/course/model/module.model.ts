import { Schema, model, Types } from "mongoose";

export interface IModule {
  courseId: Types.ObjectId;
  title: string;
  description?: string;
  orderIndex: number;
  isPublished?: boolean;
  resources?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const moduleSchema = new Schema<IModule>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: String,
    orderIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    resources: String,
  },
  { timestamps: true }
);

moduleSchema.index({ courseId: 1, orderIndex: 1 });

export const Module = model<IModule>("Module", moduleSchema);
