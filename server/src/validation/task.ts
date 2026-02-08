import { TaskStatus, TaskType } from "@prisma/client";
import zod from "zod";

export const taskSchema = zod.object({
  name: zod
    .string("Name is required")
    .trim()
    .regex(/^[a-zA-Z\s_-]+$/, "Name must contain only letters, spaces, underscores and hyphens")
    .min(4, "Name must be at least 4 characters long")
    .max(50, "Name must be at most 50 characters long")
    .optional()
    .default(""),
  type: zod
  .enum([TaskType.critical, TaskType.normal], "Type must be either critical or normal")
  .optional()
  .default(TaskType.normal),
  status: zod
  .enum([TaskStatus.pending, TaskStatus.in_progress, TaskStatus.done, TaskStatus.archived], "Status must be either pending, in_progress, done or archived")
  .optional()
  .default(TaskStatus.pending),
});
