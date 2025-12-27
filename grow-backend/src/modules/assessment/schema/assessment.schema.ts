import { z } from "zod";

export const createAssessmentSchema = {
  body: z.object({
    courseId: z.string(),
    type: z.enum(["quiz", "assignment", "mid-exam", "final-exam", "project"]),
    title: z.string().min(3),
    description: z.string().optional(),
    questions: z.number().optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(["draft", "active", "published"]).optional(),
  }),
};

export const updateAssessmentSchema = {
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    questions: z.number().optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(["draft", "active", "published"]).optional(),
  }),
};

export const assessmentIdSchema = {
  params: z.object({ id: z.string() }),
};

export const courseIdParamSchema = {
  params: z.object({ courseId: z.string() }),
};
