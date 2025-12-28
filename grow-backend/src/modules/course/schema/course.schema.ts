import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20),
    category: z.string().min(2), // Can be category name (string) or ObjectId
    type: z.enum(["live", "recorded"]).default("recorded"),
    price: z.number().min(0),
    discountPrice: z.number().min(0).optional(),
    thumbnail: z.string().optional(),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]),
    language: z.string().optional().default("English"),
    duration: z.number().min(0),
    isRegistrationOpen: z.boolean().optional().default(false),
    registrationDeadline: z.string().optional(),
    tags: z.array(z.string()).optional(),
    learningOutcomes: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
    instructorId: z.string().length(24, "Invalid instructor ID").optional(),
    isPublished: z.boolean().optional().default(false),
    isFeatured: z.boolean().optional().default(false),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid course ID"),
  }),
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(20).optional(),
    category: z.string().min(2).optional(), // Can be category name (string) or ObjectId
    type: z.enum(["live", "recorded"]).optional(),
    price: z.number().min(0).optional(),
    discountPrice: z.number().min(0).optional(),
    thumbnail: z.string().optional(),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
    language: z.string().optional(),
    duration: z.number().min(0).optional(),
    isRegistrationOpen: z.boolean().optional(),
    registrationDeadline: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    learningOutcomes: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const courseIdSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid course ID"),
  }),
});

export const createModuleSchema = z.object({
  body: z.object({
    courseId: z.string().length(24, "Invalid course ID"),
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    orderIndex: z.number().min(0),
  }),
});

export const updateModuleSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid module ID"),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    orderIndex: z.number().min(0).optional(),
  }),
});

export const moduleIdSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid module ID"),
  }),
});

export const createLessonSchema = z.object({
  body: z.object({
    moduleId: z.string().length(24, "Invalid module ID"),
    title: z.string().min(3).max(200),
    description: z.string().optional(),
    type: z.enum(["video", "pdf", "quiz", "assignment"]),
    contentUrl: z.string().optional(),
    duration: z.number().min(0).optional(),
    orderIndex: z.number().min(0),
    isPreview: z.boolean().optional().default(false),
    isFree: z.boolean().optional().default(false),
  }),
});

export const updateLessonSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid lesson ID"),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().optional(),
    type: z.enum(["video", "pdf", "quiz", "assignment"]).optional(),
    contentUrl: z.string().optional(),
    duration: z.number().min(0).optional(),
    orderIndex: z.number().min(0).optional(),
    isPreview: z.boolean().optional(),
    isFree: z.boolean().optional(),
  }),
});

export const lessonIdSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid lesson ID"),
  }),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>["body"];

// Registration control schemas
export const setRegistrationOpenSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid course ID"),
  }),
  body: z.object({
    isRegistrationOpen: z.boolean(),
  }),
});

export const setRegistrationDeadlineSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid course ID"),
  }),
  body: z.object({
    registrationDeadline: z.string().nullable().optional(),
  }),
});

export const adminSetRegistrationSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid course ID"),
  }),
  body: z.object({
    isRegistrationOpen: z.boolean().optional(),
    registrationDeadline: z.string().nullable().optional(),
  }),
});
