import zod from "zod";

export const noteSchema = zod.object({
  title: zod
    .string("Title is required")
    .trim()
    .regex(
      /^[a-zA-Z\s_-]+$/,
      "Note title must only contain letters, underscores and hyphens and spaces",
    )
    .min(1, "Note title cannot be empty")
    .max(50, "Note title must be at most 50 characters long")
    .optional()
    .default(""),
  content: zod
    .string("Content is required")
    .trim()
    .min(1, "Note content cannot be empty")
    .max(5000, "Note content must be at most 5000 characters long"),
});
