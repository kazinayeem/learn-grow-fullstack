import { z } from "zod";

export const applyForJobSchema = z.object({
  body: z.object({
    jobId: z.string().length(24, "Invalid job ID"),
    email: z.string().email("Invalid email"),
    fullName: z.string().min(2).max(100),
    phone: z.string().min(7).max(20),
    resumeUrl: z.string().url("Invalid resume URL"),
    linkedinProfile: z.string().url("Invalid LinkedIn URL").optional(),
    additionalInfo: z.string().max(2000).optional(),
  }),
});

export const getApplicationsSchema = z.object({
  query: z.object({
    jobId: z.string().optional(),
    status: z.enum(["pending", "reviewed", "shortlisted", "rejected", "accepted"]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid application ID"),
  }),
  body: z.object({
    status: z.enum(["pending", "reviewed", "shortlisted", "rejected", "accepted"]),
  }),
});

export const applicationIdSchema = z.object({
  params: z.object({
    id: z.string().length(24, "Invalid application ID"),
  }),
});
