import { z } from "zod";

export const upsertSiteContentSchema = z.object({
  body: z.object({
    page: z.string().min(2, "Page must be at least 2 characters"),
    // content can be string (HTML) or object (JSON)
    content: z.union([z.string(), z.record(z.string(), z.unknown())]),
  }),
});
