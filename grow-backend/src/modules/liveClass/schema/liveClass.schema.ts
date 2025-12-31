import { z } from "zod";

export const createLiveClassSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255),
    courseId: z.string(),
    scheduledAt: z.string().datetime(),
    duration: z.number().min(15).max(480), // 15 mins to 8 hours
    platform: z.enum(["Zoom", "Meet", "Other"]),
    meetingLink: z.string().url(),
  }),
});

export const updateLiveClassSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    scheduledAt: z.string().datetime().optional(),
    duration: z.number().min(15).max(480).optional(),
    platform: z.enum(["Zoom", "Meet", "Other"]).optional(),
    meetingLink: z.string().url().optional(),
    status: z.enum(["Scheduled", "Completed", "Cancelled"]).optional(),
  }),
});

export const liveClassIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const getCourseClassesSchema = z.object({
  params: z.object({
    courseId: z.string(),
  }),
});
