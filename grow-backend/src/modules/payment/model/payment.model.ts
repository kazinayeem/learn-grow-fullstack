import { Schema, model, Types } from "mongoose";

export interface IPayment {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  amount: number;
  currency: string;
  transactionId?: string;
  status: "Pending" | "Paid" | "Failed";
  paymentDate?: Date;
  paymentMethod: "Credit Card" | "PayPal" | "Bank Transfer";
}

const paymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  courseId: { type: Schema.Types.ObjectId, ref: "Course" },
  amount: Number,
  currency: { type: String, default: "BDT" },
  transactionId: String,
  status: { type: String, enum: ["Pending", "Paid", "Failed"] },
  paymentMethod: {
    type: String,
    enum: ["Credit Card", "PayPal", "Bank Transfer"],
  },

  paymentDate: Date,
});

export const Payment = model<IPayment>("Payment", paymentSchema);
