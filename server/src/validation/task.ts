import { TaskStatus, TaskType } from "@prisma/client";
import zod from "zod";

export const taskAttachmentSchema = zod.object({
  url: zod.url({
    message: "Attachment url must be a valid URL",
  }),
  fileId: zod.string().min(1, "Attachment fileId is required"),
});

export const taskAttachmentsSchema = zod.array(taskAttachmentSchema);

export const taskSchema = zod.object({
  name: zod
    .string("Name is required")
    .trim()
    .min(4, "Task name must be at least 4 characters long")
    .max(500, "Task name must be at most 500 characters long")
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
  attachments: taskAttachmentsSchema.optional().default([]),
});
