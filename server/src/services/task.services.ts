import { Prisma, Task, TaskStatus, TaskType } from "@prisma/client";
import prisma from "../db/db.js";
import { config } from "../config/app.config.js";
import { imageKitClient } from "../lib/imagekit.js";
import { extractMessagesFromFlatten } from "../lib/zodError.js";
import { BadRequestException } from "../lib/appError.js";
import { taskAttachmentsSchema, taskSchema } from "../validation/task.js";

const IMAGEKIT_BULK_DELETE_LIMIT = 100;

function collectAttachmentFileIdsFromJson(attachments: unknown): string[] {
  if (!Array.isArray(attachments)) {
    return [];
  }
  const ids = new Set<string>();
  for (const item of attachments) {
    if (
      item &&
      typeof item === "object" &&
      "fileId" in item &&
      typeof (item as { fileId: unknown }).fileId === "string"
    ) {
      const id = (item as { fileId: string }).fileId.trim();
      if (id) {
        ids.add(id);
      }
    }
  }
  return [...ids];
}

async function deleteImageKitFilesByIds(fileIds: string[]): Promise<void> {
  if (fileIds.length === 0 || !config.IMAGEKIT_PRIVATE_KEY) {
    return;
  }
  for (let i = 0; i < fileIds.length; i += IMAGEKIT_BULK_DELETE_LIMIT) {
    const chunk = fileIds.slice(i, i + IMAGEKIT_BULK_DELETE_LIMIT);
    await imageKitClient.files.bulk.delete({ fileIds: chunk });
  }
}

function attachmentsAsArray(raw: unknown): { url: string; fileId: string }[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }
  const parsed = taskAttachmentsSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

export type TaskPayload = Pick<Task, "name" | "type" | "status"> & {
  attachments?: { url: string; fileId: string }[];
};

export class TaskService {
  async createTask(
    name: string,
    type: TaskType,
    status: TaskStatus,
    categoryId: string,
    attachments?: { url: string; fileId: string }[],
  ) {
    const result = taskSchema.safeParse({
      name,
      type,
      status,
      attachments: attachments ?? [],
    });

    if (!result.success) {
      let errorMessage = extractMessagesFromFlatten(result.error);
      throw new BadRequestException(errorMessage);
    }

    const isCategoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException("Category not found");
    }

    const isTaskAlreadyExists = await prisma.task.findFirst({
      where: {
        name,
        categoryId,
      },
    });

    if (isTaskAlreadyExists) {
      throw new BadRequestException(
        `Task with name ${name} already exists in category ${isCategoryExists.name}`,
      );
    }

    return await prisma.task.create({
      data: {
        name,
        type,
        status,
        categoryId,
        attachments:
          result.data.attachments.length > 0
            ? (result.data.attachments as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      },
    });
  }

  async createTaskByCategoryName(
    categoryName: string,
    name: string,
    type: TaskType,
    status: TaskStatus,
    userId: string,
    attachments?: { url: string; fileId: string }[],
  ) {
    const result = taskSchema.safeParse({
      name,
      type,
      status,
      attachments: attachments ?? [],
    });

    if (!result.success) {
      let errorMessage = extractMessagesFromFlatten(result.error);
      throw new BadRequestException(errorMessage);
    }

    const isCategoryExists = await prisma.category.findUnique({
      where: {
        name_userId: {
          name: categoryName,
          userId,
        },
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException(`Category ${categoryName} not found`);
    }

    const isTaskAlreadyExists = await prisma.task.findFirst({
      where: {
        name,
        categoryId: isCategoryExists.id,
      },
    });

    if (isTaskAlreadyExists) {
      throw new BadRequestException(
        `Task with name ${name} already exists in category ${categoryName}`,
      );
    }

    return await prisma.task.create({
      data: {
        name,
        type,
        status,
        categoryId: isCategoryExists.id,
        attachments:
          result.data.attachments.length > 0
            ? (result.data.attachments as Prisma.InputJsonValue)
            : Prisma.JsonNull,
      },
    });
  }

  async updateTask(taskId: string, task: TaskPayload, categoryId: string) {
    const isTaskExists = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!isTaskExists) {
      throw new BadRequestException("Task not found");
    }

    const attachmentsForParse =
      task.attachments !== undefined
        ? task.attachments
        : attachmentsAsArray(isTaskExists.attachments);

    const result = taskSchema.safeParse({
      name: task.name ?? isTaskExists.name,
      type: task.type ?? isTaskExists.type,
      status: task.status ?? isTaskExists.status,
      attachments: attachmentsForParse,
    });

    if (!result.success) {
      let errorMessage = extractMessagesFromFlatten(result.error);
      throw new BadRequestException(errorMessage);
    }

    const isCategoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException("Category not found");
    }

    if (isTaskExists.categoryId !== categoryId) {
      throw new BadRequestException(
        "Task is not in the category you are trying to update",
      );
    }

    const isTaskAlreadyExistsWithSameNameInThisCategory =
      await prisma.task.findFirst({
        where: {
          name: task.name ?? isTaskExists.name,
          categoryId,
          id: {
            not: taskId,
          },
        },
      });

    if (isTaskAlreadyExistsWithSameNameInThisCategory) {
      throw new BadRequestException(
        "Task with this name already exists in this category",
      );
    }

    return await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        name: task.name ?? isTaskExists.name,
        type: task.type ?? isTaskExists.type,
        status: task.status ?? isTaskExists.status,
        ...(task.attachments !== undefined
          ? {
              attachments:
                task.attachments.length > 0
                  ? (task.attachments as Prisma.InputJsonValue)
                  : Prisma.JsonNull,
            }
          : {}),
      },
    });
  }

  async updateTaskByName(
    taskName: string,
    categoryName: string,
    userId: string,
    task: TaskPayload,
  ) {
    const category = await prisma.category.findUnique({
      where: {
        name_userId: {
          name: categoryName,
          userId,
        },
      },
    });

    if (!category) {
      throw new BadRequestException(`Category ${categoryName} not found`);
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        name: taskName,
        categoryId: category.id,
      },
    });

    if (!existingTask) {
      throw new BadRequestException(
        `Task ${taskName} not found in category ${categoryName}`,
      );
    }

    if (existingTask.categoryId !== category.id) {
      throw new BadRequestException(
        `Task ${taskName} is not in category ${categoryName}`,
      );
    }

    const attachmentsForParse =
      task.attachments !== undefined
        ? task.attachments
        : attachmentsAsArray(existingTask.attachments);

    const newName = task.name ?? existingTask.name;

    const result = taskSchema.safeParse({
      name: newName,
      type: task.type ?? existingTask.type,
      status: task.status ?? existingTask.status,
      attachments: attachmentsForParse,
    });

    if (!result.success) {
      const errorMessage = extractMessagesFromFlatten(result.error);
      throw new BadRequestException(errorMessage);
    }

    const duplicateTask = await prisma.task.findFirst({
      where: {
        name: newName,
        categoryId: category.id,
        id: {
          not: existingTask.id,
        },
      },
    });

    if (duplicateTask) {
      throw new BadRequestException(
        "Task with this name already exists in this category",
      );
    }

    return await prisma.task.update({
      where: {
        id: existingTask.id,
      },
      data: {
        name: newName,
        type: task.type ?? existingTask.type,
        status: task.status ?? existingTask.status,
        ...(task.attachments !== undefined
          ? {
              attachments:
                task.attachments.length > 0
                  ? (task.attachments as Prisma.InputJsonValue)
                  : Prisma.JsonNull,
            }
          : {}),
      },
    });
  }

  async moveTaskToCategory(taskId: string, categoryId: string) {
    const isTaskExists = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!isTaskExists) {
      throw new BadRequestException("Task not found");
    }

    const isCategoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException("Category not found");
    }

    return await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        categoryId,
      },
    });
  }

  async moveTaskToCategoryByName(categoryName: string, taskName: string, newCategoryName: string, userId: string) {

    const isNewCategoryExists = await prisma.category.findUnique({
      where: {
        name_userId: {
          name: newCategoryName,
          userId,
        },
      },
    });

    if (!isNewCategoryExists) {
      throw new BadRequestException(`Category ${newCategoryName} not found`);
    }

    const isCategoryExists = await prisma.category.findUnique({
      where: {
        name_userId: {
          name: categoryName,
          userId,
        },
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException(`Category ${categoryName} not found`);
    }

    const isTaskExists = await prisma.task.findFirst({
      where: {
        name: taskName,
        category: {
          name: categoryName,
          userId,
        },
      },
    });

    if (!isTaskExists) {
      throw new BadRequestException(`Task ${taskName} not found in category ${categoryName}`);
    }

    return await prisma.task.update({
      where: {
        id: isTaskExists.id,
      },
      data: {
        categoryId: isNewCategoryExists.id,
      },
    });
  }

  async deleteTask(taskIds: string[], categoryId: string) {
    const isCategoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException("Category not found");
    }

    const isTasksExists = await prisma.task.findMany({
      where: {
        id: {
          in: taskIds,
        },
        categoryId: categoryId,
      },
      select: { id: true, name: true, attachments: true },
    });

    const foundIds = new Set(isTasksExists.map((t) => t.id));
    const missingIds = taskIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Some tasks were not found in category ${isCategoryExists.name}`,
      );
    }

    const fileIds = isTasksExists.flatMap((t) =>
      collectAttachmentFileIdsFromJson(t.attachments),
    );
    await deleteImageKitFilesByIds(fileIds);

    return await prisma.task.deleteMany({
      where: {
        id: {
          in: taskIds,
        },
      },
    });
  }

  async deleteTaskByName(taskNames: string[], categoryName: string, userId: string) {
    const category = await prisma.category.findUnique({
      where: {
        name_userId: {
          name: categoryName,
          userId,
        },
      },
    });

    if (!category) {
      throw new BadRequestException(
        `Category "${categoryName}" not found for this user`,
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        name: {
          in: taskNames,
        },
        categoryId: category.id,
      },
      select: { id: true, name: true, attachments: true },
    });

    const foundNames = new Set(tasks.map((t) => t.name));
    const missingNames = taskNames.filter((name) => !foundNames.has(name));

    if (missingNames.length > 0) {
      throw new BadRequestException(
        `Tasks with names ${missingNames.join(", ")} were not found in category ${categoryName}`,
      );
    }

    const fileIds = tasks.flatMap((t) =>
      collectAttachmentFileIdsFromJson(t.attachments),
    );
    await deleteImageKitFilesByIds(fileIds);

    return await prisma.task.deleteMany({
      where: {
        id: {
          in: tasks.map((t) => t.id),
        },
      },
    });
  }

  async getTasksByCategoryId(categoryId: string) {
    const isCategoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException("Category not found");
    }

    return await prisma.task.findMany({ where: { categoryId } });
  }

  // async getRecentTasks(userId: string, limit = 100, offset = 0) {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = now.getMonth();
  //   const date = now.getDate();

  //   const dayRanges = [0, 1, 2, 3, 4, 5, 6, 7].map((daysAgo) => ({
  //     updatedAt: {
  //       gte: new Date(year, month, date - daysAgo, 0, 0, 0, 0),
  //       lte: new Date(year, month, date - daysAgo, 23, 59, 59, 999),
  //     },
  //   }));

  //   return await prisma.task.findMany({
  //     where: {
  //       status: { not: TaskStatus.archived },
  //       OR: dayRanges,
  //       category: {
  //         userId,
  //       },
  //     },
  //     orderBy: {
  //       updatedAt: "desc",
  //     },
  //     take: limit,
  //     skip: offset,
  //   });
  // }

  async getRecentTasks(userId: string, limit = 100, offset = 0) {
    return await prisma.task.findMany({
      where: {
        status: TaskStatus.pending,
        category: {
          userId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      skip: offset,
    });
  }

  async getTasksByCategoryName(categoryName: string, userId: string) {
    // Verify the category exists and belongs to the user
    const category = await prisma.category.findUnique({
      where: {
        name_userId: {
          name: categoryName,
          userId,
        },
      },
    });

    if (!category) {
      throw new BadRequestException(
        `Category "${categoryName}" not found for this user`,
      );
    }

    // Fetch all tasks in this category
    return await prisma.task.findMany({
      where: {
        categoryId: category.id,
      },
    });
  }

  async getTaskById(taskId: string) {
    const isTaskExists = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!isTaskExists) {
      throw new BadRequestException("Task not found");
    }

    return isTaskExists;
  }

  async getTaskByName(taskName: string, categoryName: string, userId: string) {
    // First, verify the category exists and belongs to the user
    const category = await prisma.category.findUnique({
      where: {
        name_userId: {
          name: categoryName,
          userId,
        },
      },
    });

    if (!category) {
      throw new BadRequestException(
        `Category "${categoryName}" not found for this user`,
      );
    }

    // Find the task by name within the user's category
    const task = await prisma.task.findFirst({
      where: {
        name: taskName,
        categoryId: category.id,
      },
    });

    if (!task) {
      throw new BadRequestException(
        `Task "${taskName}" not found in category "${categoryName}"`,
      );
    }

    return task;
  }
}
