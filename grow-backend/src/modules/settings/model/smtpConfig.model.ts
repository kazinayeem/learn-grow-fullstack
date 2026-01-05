import mongoose, { Schema, model } from "mongoose";

export interface ISMTPConfig {
  _id?: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const smtpConfigSchema = new Schema<ISMTPConfig>(
  {
    host: { type: String, required: true },
    port: { type: Number, required: true },
    secure: { type: Boolean, default: false },
    user: { type: String, required: true },
    password: { type: String, required: true, select: false }, // Password not returned by default
    fromName: { type: String, required: true },
    fromEmail: { type: String, required: true },
    replyTo: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SMTPConfig = model<ISMTPConfig>("SMTPConfig", smtpConfigSchema);
