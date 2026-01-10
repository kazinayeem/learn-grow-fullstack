import { Schema, model, Types } from "mongoose";

export interface ICombo {
  name: string;
  description?: string;
  courses: Types.ObjectId[]; // Max 3 courses
  price: number;
  discountPrice?: number;
  duration: "1-month" | "2-months" | "3-months" | "lifetime";
  featured?: boolean;
  isActive: boolean;
  createdBy: Types.ObjectId; // Admin who created the combo
  thumbnail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const comboSchema = new Schema<ICombo>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    courses: {
      type: [Schema.Types.ObjectId],
      ref: "Course",
      required: true,
      validate: {
        validator: function (v: Types.ObjectId[]) {
          return v.length > 0 && v.length <= 100;
        },
        message: "Combo must contain between 1 and 100 courses",
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    duration: {
      type: String,
      enum: ["1-month", "2-months", "3-months", "lifetime"],
      required: true,
      default: "lifetime",
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnail: String,
  },
  { timestamps: true }
);

// Index for quick lookups
comboSchema.index({ isActive: 1, createdAt: -1 });
comboSchema.index({ createdBy: 1 });

export const Combo = model<ICombo>("Combo", comboSchema);
