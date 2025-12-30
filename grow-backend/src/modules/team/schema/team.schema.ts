import { z } from "zod";

export const createTeamMemberSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name is required and must be at least 2 characters"),
        role: z.string().min(2, "Role is required and must be at least 2 characters"),
        image: z.string().min(1, "Image is required"),
        linkedIn: z.string().optional().default(""),
        twitter: z.string().optional().default(""),
        bio: z.string().optional().default(""),
    }),
});

export const updateTeamMemberSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").optional(),
        role: z.string().min(2, "Role must be at least 2 characters").optional(),
        image: z.string().optional(),
        linkedIn: z.string().optional(),
        twitter: z.string().optional(),
        bio: z.string().optional(),
        showOnHome: z.boolean().optional(),
    }),
});

export const importInstructorSchema = z.object({
    body: z.object({
        instructorIds: z.array(z.string()).min(1, "At least one instructor ID is required"),
    }),
});

export const toggleShowHomeSchema = z.object({
    body: z.object({
        showOnHome: z.boolean(),
    }),
});
