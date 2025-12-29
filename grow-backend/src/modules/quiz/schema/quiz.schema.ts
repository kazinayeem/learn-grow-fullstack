import { z } from "zod";

export const questionSchema = z.object({
  questionText: z.string().min(5, "Question must be at least 5 characters"),
  questionImage: z.string().optional(),
  questionType: z.enum(["multiple-choice", "short-answer", "true-false"]),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text required"),
        isCorrect: z.boolean(),
      })
    )
    .optional(),
  correctAnswer: z.string().optional(),
  points: z.number().min(1, "Points must be at least 1"),
  explanation: z.string().optional(),
  order: z.number().min(0),
});

export const createQuizSchema = z.object({
  body: z.object({
    courseId: z.string(),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    questions: z.array(questionSchema).min(1, "At least one question required"),
    duration: z.number().min(0, "Duration must be at least 0 minutes"),
    passingScore: z.number().min(0).max(100).default(60),
    shuffleQuestions: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    showCorrectAnswers: z.boolean().default(true),
    totalAttempts: z.number().default(0),
  }),
});

export const updateQuizSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    questions: z.array(questionSchema).optional(),
    duration: z.number().min(0).optional(),
    passingScore: z.number().min(0).max(100).optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    showCorrectAnswers: z.boolean().optional(),
    status: z.enum(["draft", "active", "published"]).optional(),
    totalAttempts: z.number().optional(),
  }),
});

export const quizIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const courseIdSchema = z.object({
  params: z.object({
    courseId: z.string(),
  }),
});

export const publishQuizSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(["published", "draft", "active"]),
  }),
});
