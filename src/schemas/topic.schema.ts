import { z } from "zod";

export const createTopicSchema = z.object({
  title: z.string().trim().min(1, "Title must be provided."),
});

export const updateTopicSchema = z
  .object({
    title: z.string().trim().optional(),
    status: z.string().trim().optional(),
    completedAt: z.string().trim().optional(),
    seconds: z.coerce.number().int().nonnegative().optional().default(0),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.status !== undefined ||
      data.completedAt !== undefined,
    {
      message: "Title, status or completedAt must be provided.",
    },
  );
