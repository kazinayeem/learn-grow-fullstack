import { Schema, model, Types } from "mongoose";

export interface IStudentProfile {
  userId: Types.ObjectId;
  school?: string;
  classLevel?: string;
  guardianId?: Types.ObjectId;
}

const studentProfileSchema = new Schema<IStudentProfile>({
  userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
  school: String,
  classLevel: String,
  guardianId: { type: Schema.Types.ObjectId, ref: "User" },
});

export const StudentProfile = model<IStudentProfile>(
  "StudentProfile",
  studentProfileSchema
);
