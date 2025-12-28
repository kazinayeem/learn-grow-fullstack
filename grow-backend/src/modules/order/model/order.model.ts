import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  planType: "single" | "quarterly" | "kit" | "school";
  courseId?: mongoose.Types.ObjectId;
  paymentMethodId: mongoose.Types.ObjectId;
  transactionId: string;
  senderNumber: string;
  paymentNote?: string;
  paymentStatus: "pending" | "approved" | "rejected";
  deliveryAddress?: {
    name: string;
    phone: string;
    fullAddress: string;
    city: string;
    postalCode: string;
  };
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planType: {
      type: String,
      enum: ["single", "quarterly", "kit", "school"],
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: function (this: IOrder) {
        return this.planType === "single";
      },
    },
    paymentMethodId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    senderNumber: {
      type: String,
      required: true,
      trim: true,
    },
    paymentNote: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    deliveryAddress: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      fullAddress: { type: String, trim: true },
      city: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for checking active subscriptions
orderSchema.index({ userId: 1, planType: 1, isActive: 1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

// Check if subscription is still valid (auto-expire)
orderSchema.methods.checkAndUpdateExpiry = function () {
  if (this.planType === "quarterly" && this.endDate && this.isActive) {
    const now = new Date();
    if (now > this.endDate) {
      this.isActive = false;
      return this.save();
    }
  }
  return Promise.resolve(this);
};

export const Order = mongoose.model<IOrder>("Order", orderSchema);
