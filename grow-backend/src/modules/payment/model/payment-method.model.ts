import { Schema, model } from "mongoose";

export interface IPaymentMethod {
  name: string;
  accountNumber: string;
  paymentNote: string;
  isActive: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    paymentNote: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for ordering
paymentMethodSchema.index({ order: 1 });

export const PaymentMethod = model<IPaymentMethod>(
  "PaymentMethod",
  paymentMethodSchema
);
