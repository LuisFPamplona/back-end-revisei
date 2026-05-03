import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Email is required."),
  password: z.string().trim().min(6, "Password is required."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email is required."),
  password: z.string().trim().min(6, "Password is required."),
});
