import { Schema, model, Types } from "mongoose";

export interface IBlog {
  title: string;
  content: string; // Rich HTML content from Quill
  excerpt: string; // Short summary
  author: Types.ObjectId; // Reference to User
  category: Types.ObjectId; // Reference to BlogCategory
  metaTags?: string[]; // SEO meta tags
  image?: string; // Featured image URL
  slug: string; // URL-friendly title
  isPublished: boolean;
  isApproved?: boolean; // Admin approval flag
  readTime?: number; // Estimated read time in minutes
  viewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    metaTags: [String],
    image: String,
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    readTime: {
      type: Number,
      min: 1,
      max: 60,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Index for better query performance
blogSchema.index({ slug: 1 }, { unique: true, sparse: true });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ isPublished: 1, isApproved: 1 });
blogSchema.index({ createdAt: -1 });

export const Blog = model<IBlog>("Blog", blogSchema);
