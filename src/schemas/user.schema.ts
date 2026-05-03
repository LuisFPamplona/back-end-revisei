import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty.").optional(),
  email: z.string().trim().email("Email cannot be empty.").optional(),
  password: z.string().trim().min(6, "Password cannot be empty.").optional(),
  currentPassword: z
    .string()
    .trim()
    .min(6, "Current password is required to update the password.")
    .optional(),
  dailyGoal: z
    .number()
    .int()
    .positive("Daily goal must be an integer greater than 0.")
    .optional(),
});
