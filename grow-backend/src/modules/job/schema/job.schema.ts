import { z } from "zod";

const salaryRangeSchema = z
  .object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
    currency: z.string().default("USD").optional(),
  })
  .refine(
    (data) => {
      if (data.min && data.max) {
        return data.min <= data.max;
      }
      return true;
    },
    {
      message: "Minimum salary must be less than or equal to maximum salary",
    }
  )
  .optional();

export const createJobPostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    jobType: z.enum(["Full-time", "Part-time", "Contract", "Internship", "Temporary"]),
    department: z.string().min(2).max(100),
    location: z.string().min(2).max(200),
    salaryRange: salaryRangeSchema,
    description: z.string().min(20),
    requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
    isPublished: z.boolean().optional().default(false),
    isRemote: z.boolean().optional().default(false),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const updateJobPostSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid job post ID"),
  }),
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    jobType: z.enum(["Full-time", "Part-time", "Contract", "Internship", "Temporary"]).optional(),
    department: z.string().min(2).max(100).optional(),
    location: z.string().min(2).max(200).optional(),
    salaryRange: salaryRangeSchema,
    description: z.string().min(20).optional(),
    requirements: z.array(z.string()).min(1).optional(),
    isPublished: z.boolean().optional(),
    isRemote: z.boolean().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const jobPostIdSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid job post ID"),
  }),
});

export const getJobPostsQuerySchema = z.object({
  query: z.object({
    department: z.string().optional(),
    jobType: z.string().optional(),
    isRemote: z.string().optional(),
    isPublished: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
