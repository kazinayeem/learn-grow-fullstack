import { z } from "zod";

export const upsertSiteContentSchema = z.object({
  body: z.object({
    page: z.string().min(2),
    // content can be string (HTML) or object (JSON)
    content: z.union([z.string(), z.record(z.any())]),
  }),
});
