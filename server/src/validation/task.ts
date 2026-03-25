import { TaskStatus, TaskType } from "@prisma/client";
import zod from "zod";

export const taskSchema = zod.object({
  name: zod
    .string("Name is required")
    .trim()
    .regex(/^[a-zA-Z0-9\s_\-()\[\]{}&.,'":!?/@#%$§]+$/, "Task name contains invalid characters")
    .min(4, "Task name must be at least 4 characters long")
    .max(100, "Task name must be at most 50 characters long")
    .optional()
    .default(""),
  type: zod
  .enum([TaskType.critical, TaskType.normal], "Task type must be either critical or normal")
  .optional()
  .default(TaskType.normal),
  status: zod
  .enum([TaskStatus.pending, TaskStatus.in_progress, TaskStatus.done, TaskStatus.archived], "Task status must be either pending, in_progress, done or archived")
  .optional()
  .default(TaskStatus.pending),
});
