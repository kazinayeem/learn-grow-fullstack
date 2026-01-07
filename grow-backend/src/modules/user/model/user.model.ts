import { Schema, model, Types } from "mongoose";

export interface IUser {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: "admin" | "manager" | "instructor" | "student" | "guardian";
  profileImage?: string;
  isBlocked?: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  refreshToken?: string;
  googleId?: string;
  isNewGoogleUser?: boolean;
  isVerified?: boolean;
  verificationToken?: string;
  isApproved?: boolean; // For instructor approval by super admin
  bio?: string;
  expertise?: string[];
  qualification?: string;
  institution?: string;
  yearsOfExperience?: number;
  children?: Types.ObjectId[]; // Guardian's students
  guardians?: Types.ObjectId[]; // Student's guardians
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, sparse: true, index: true }, // Index but NOT unique
    email: { type: String, sparse: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["admin", "manager", "instructor", "student", "guardian"],
      default: "student",
      required: true,
    },
    profileImage: String,
    isBlocked: { type: Boolean, default: false },
    otp: String,
    otpExpiresAt: Date,
    refreshToken: String,
    googleId: { type: String, sparse: true, index: true }, // Index but NOT unique
    isNewGoogleUser: { type: Boolean, default: false },
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
    bio: String,
    expertise: [String],
    qualification: String,
    institution: String,
    yearsOfExperience: Number,
    children: [{ type: Schema.Types.ObjectId, ref: "User" }],
    guardians: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// unique: true on email field already creates the sparse unique index

export const User = model<IUser>("User", userSchema);
