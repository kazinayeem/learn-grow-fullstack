import { z } from "zod";

export const enrollSchema = z.object({
  body: z.object({
    studentId: z.string(),
    courseId: z.string(),
  }),
});
export type EnrollInput = z.infer<typeof enrollSchema>["body"];
