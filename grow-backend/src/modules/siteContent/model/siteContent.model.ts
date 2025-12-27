import { Schema, model } from "mongoose";

export interface ISiteContent {
  page: string; // e.g., 'privacy-policy', 'terms-of-use', 'refund-policy', 'team', etc.
  content: any; // Supports rich HTML string or JSON object
}

const siteContentSchema = new Schema<ISiteContent>(
  {
    page: { type: String, required: true, unique: true, index: true },
    content: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const SiteContent = model<ISiteContent>("SiteContent", siteContentSchema);
