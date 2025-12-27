import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "instructor", "guardian"], {
      errorMap: () => ({ message: "Role must be student, instructor, or guardian" }),
    }),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(10, "Phone must be at least 10 characters").optional().or(z.literal("")),
  }).refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "instructor", "guardian"]),
  }).refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }).refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});
