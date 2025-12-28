import { Schema, model, Types } from "mongoose";

export interface IGuardianProfile {
  userId: Types.ObjectId;
  studentId: Types.ObjectId;
  relationship?: string; // e.g., "Father", "Mother", "Brother", "Sister", "Uncle", etc.
  phone?: string;
  address?: string;
}

const guardianProfileSchema = new Schema<IGuardianProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    relationship: String,
    phone: String,
    address: String,
  },
  { timestamps: true }
);

// Ensure unique relationship: one guardian per student
guardianProfileSchema.index({ studentId: 1, userId: 1 }, { unique: true });

export const GuardianProfile = model<IGuardianProfile>(
  "GuardianProfile",
  guardianProfileSchema
);
