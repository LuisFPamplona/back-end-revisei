import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "Name and source must be provided"),
  source: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Name and source must be provided"),
});

export const updateSubjectSchema = z.object({
  name: z.string().trim().min(1, "Name or source must be provided"),
  source: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Name or source must be provided"),
});
