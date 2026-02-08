import prisma from "../db/db.js";
import { extractMessagesFromFlatten } from "../lib/zodError.js";
import { BadRequestException } from "../lib/appError.js";
import { Task, TaskStatus, TaskType } from "@prisma/client";
import { taskSchema } from "../validation/task.js";

export class TaskService {
  async createTask(
    name: string,
    type: TaskType,
    status: TaskStatus,
    categoryId: string,
  ) {
    const result = taskSchema.safeParse({ name, type, status });

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
        "Task already with this name already exists in this category",
      );
    }

    return await prisma.task.create({
      data: {
        name,
        type,
        status,
        categoryId,
      },
    });
  }

  async updateTask(taskId: string, task: Partial<Task>, categoryId: string) {
    const result = taskSchema.safeParse({
      name: task.name,
      type: task.type,
      status: task.status,
    });

    if (!result.success) {
      let errorMessage = extractMessagesFromFlatten(result.error);
      throw new BadRequestException(errorMessage);
    }

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
      select: { id: true },
    });

    const foundIds = new Set(isTasksExists.map((t) => t.id));
    const missingIds = taskIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Tasks with ids ${missingIds.join(", ")} were not found`,
      );
    }

    return await prisma.task.deleteMany({
      where: {
        id: {
          in: taskIds,
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

  async getTaskById(taskId: string) {
    const isTaskExists = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!isTaskExists) {
      throw new BadRequestException("Task not found");
    }

    return isTaskExists;
  }
}
