import { Schema, model, Types } from "mongoose";

export interface IUser {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: "admin" | "instructor" | "student" | "guardian";
  profileImage?: string;
  children?: Types.ObjectId[];
  otp?: string;
  otpExpiresAt?: Date;
  refreshToken?: string;
  googleId?: string;
  isVerified?: boolean;
  verificationToken?: string;
  isApproved?: boolean; // For instructor approval by super admin
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["admin", "instructor", "student", "guardian"],
      default: "student",
      required: true,
    },
    profileImage: String,
    children: [{ type: Schema.Types.ObjectId, ref: "User" }],
    otp: String,
    otpExpiresAt: Date,
    refreshToken: String,
    googleId: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    isApproved: {
      type: Boolean,
      default: function (this: any) {
        // Auto-approve for non-instructor roles; guard against null doc during upserts
        const role = this?.role ?? "student";
        return role !== "instructor";
      },
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
