import { Schema, model, Types } from "mongoose";

export interface IBlogCategory {
  name: string;
  slug: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const blogCategorySchema = new Schema<IBlogCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 2,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

blogCategorySchema.index({ slug: 1 });

export const BlogCategory = model<IBlogCategory>("BlogCategory", blogCategorySchema);
