import { Schema, model } from "mongoose";

export interface ISettings {
  key: string; // singleton key, e.g., 'global'
  platformCommissionPercent: number; // 0..100
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    platformCommissionPercent: { type: Number, required: true, default: 20, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const Settings = model<ISettings>("Settings", settingsSchema);
