import { z } from "zod";

export const createAssignmentSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, "Course ID is required"),
    assessmentType: z.enum(["assignment", "project", "mid-term", "final"]).optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    instructions: z.string().optional(),
    dueDate: z.string().or(z.date()),
    maxScore: z.number().min(1).optional(),
    attachments: z.array(z.string()).optional(),
  }),
});

export const updateAssignmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Assignment ID is required"),
  }),
  body: z.object({
    assessmentType: z.enum(["assignment", "project", "mid-term", "final"]).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    instructions: z.string().optional(),
    dueDate: z.string().or(z.date()).optional(),
    maxScore: z.number().min(1).optional(),
    attachments: z.array(z.string()).optional(),
    status: z.enum(["draft", "published"]).optional(),
  }),
});

export const assignmentIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Assignment ID is required"),
  }),
});

export const courseIdSchema = z.object({
  params: z.object({
    courseId: z.string().min(1, "Course ID is required"),
  }),
});

export const submitAssignmentSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Assignment ID is required"),
  }),
  body: z.object({
    submissionLink: z.string().url("Valid URL is required"),
  }),
});

export const gradeSubmissionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Submission ID is required"),
  }),
  body: z.object({
    score: z.number().min(0, "Score must be positive"),
    feedback: z.string().optional(),
  }),
});
