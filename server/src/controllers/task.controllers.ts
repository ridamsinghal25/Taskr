import type { TaskStatus, TaskType } from "@prisma/client";
import type { Request, Response } from "express";
import { TaskService } from "../services/task.services.js";
import { ApiResponse } from "../lib/ApiResponse.js";
import { BadRequestException } from "../lib/appError.js";

const taskService = new TaskService();

export class TaskController {
  static async createTask(req: Request, res: Response) {
    const { name, type, status, attachments } = req.body as {
      name: string;
      type: TaskType;
      status: TaskStatus;
      attachments?: { url: string; fileId: string }[];
    };
    const { categoryId } = req.query as { categoryId: string };

    if (!name){ 
        throw new BadRequestException("name is required");
    }

    if (!type){ 
        throw new BadRequestException("type is required");
    }

    if (!status){ 
        throw new BadRequestException("status is required");
    }

    if (!categoryId){ 
        throw new BadRequestException("categoryId is required");
    }

    const task = await taskService.createTask(
      name,
      type,
      status,
      categoryId,
      attachments,
    );

    return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
  }

  static async createTaskByCategoryName(req: Request, res: Response) {
    const { name, type, status, attachments } = req.body as {
      name: string;
      type: TaskType;
      status: TaskStatus;
      attachments?: { url: string; fileId: string }[];
    };
    const { categoryName } = req.params as { categoryName: string };

    if (!req.user || !req.user.id){ 
        throw new BadRequestException("User not found");
    }

    if (!categoryName){ 
        throw new BadRequestException("Category name is required");
    }
    
    if (!name){ 
        throw new BadRequestException("Task name is required");
    }

    if (!type){ 
        throw new BadRequestException("Task type is required");
    }
    
    if (!status){ 
        throw new BadRequestException("Task status is required");
    }

    const task = await taskService.createTaskByCategoryName(
      categoryName,
      name,
      type,
      status,
      req.user.id,
      attachments,
    );

    return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
  }

  static async updateTask(req: Request, res: Response) {
    const { categoryId } = req.query as { categoryId: string };
    const { taskId } = req.params as { taskId: string };

    if (!taskId){ 
        throw new BadRequestException("task id is required");
    }

    if (!categoryId){ 
        throw new BadRequestException("category id is required");
    }

    const updated = await taskService.updateTask(taskId, req.body, categoryId);

    return res
    .status(200)
    .json(new ApiResponse(200, updated, "Task updated successfully"));
  }

  static async moveTaskToCategory(req: Request, res: Response) {
    const { taskId } = req.params as { taskId: string };
    const { categoryId } = req.query as { categoryId: string };

    if (!taskId){ 
        throw new BadRequestException("task id is required");
    }

    if (!categoryId){ 
        throw new BadRequestException("categoryId is required");
    }

    const moved = await taskService.moveTaskToCategory(taskId, categoryId);

    return res
    .status(200)
    .json(new ApiResponse(200, moved, "Task moved successfully"));
  }

  static async moveTaskToCategoryByName(req: Request, res: Response) {
    const { categoryName, taskName } = req.params as { categoryName: string, taskName: string };
    const {newCategoryName} = req.body as {newCategoryName: string};
    
    if (!req.user || !req.user.id){ 
        throw new BadRequestException("User not found");
    }

    if (!categoryName){ 
        throw new BadRequestException("category name is required");
    }
    
    if (!taskName){ 
        throw new BadRequestException("task name is required");
    }

    if (!newCategoryName){ 
        throw new BadRequestException("new category name is required");
    }

    const moved = await taskService.moveTaskToCategoryByName(categoryName, taskName, newCategoryName, req.user.id);

    return res
    .status(200)
    .json(new ApiResponse(200, moved, "Task moved successfully"));
  }

  static async deleteTasks(req: Request, res: Response) {
    const { taskIds } = req.body;
    const {categoryId} = req.query as {categoryId: string};

    if (!taskIds){ 
        throw new BadRequestException("task ids are required");
    }

    if (!categoryId){ 
        throw new BadRequestException("categoryId is required");
    }

    const result = await taskService.deleteTask(taskIds, categoryId);

    return res
    .status(200)
    .json(new ApiResponse(200, result, "Tasks deleted successfully"));
  }

  static async getRecentTasks(req: Request, res: Response) {
    if (!req.user?.id) {
      throw new BadRequestException("User not found");
    }

    const limitParam = req.query.limit as string | undefined;
    const offsetParam = req.query.offset as string | undefined;

    const limit = limitParam !== undefined ? Number(limitParam) : 100;
    const offset = offsetParam !== undefined ? Number(offsetParam) : 0;

    if (!Number.isInteger(limit) || limit < 1) {
      throw new BadRequestException("limit must be a positive integer");
    }

    if (!Number.isInteger(offset) || offset < 0) {
      throw new BadRequestException("offset must be a non-negative integer");
    }
    
    const tasks = await taskService.getRecentTasks(req.user.id, limit, offset);

    return res
      .status(200)
      .json(new ApiResponse(200, tasks, "Recent tasks fetched"));
  }

  static async getTasksByCategoryId(req: Request, res: Response) {
    const { categoryId } = req.query as { categoryId: string };

    if (!categoryId){ 
        throw new BadRequestException("categoryId is required");
    }

    const tasks = await taskService.getTasksByCategoryId(categoryId);

    return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
  }

  static async getTaskById(req: Request, res: Response) {
    const { taskId } = req.params as { taskId: string };

    if (!taskId){ 
        throw new BadRequestException("task id is required");
    }

    const task = await taskService.getTaskById(taskId);

    return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetched successfully"));
  }

  static async deleteTasksByName(req: Request, res: Response) {
    const { tasks } = req.body as { tasks: string[] };
    const {categoryName} = req.params as {categoryName: string};

    if (!req.user || !req.user.id){ 
        throw new BadRequestException("User not found");
    }

    if (!tasks){ 
        throw new BadRequestException("task names are required");
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
        throw new BadRequestException("task names must be a non-empty array");
    }

    if (!categoryName){ 
        throw new BadRequestException("category name is required");
    }

    const result = await taskService.deleteTaskByName(tasks, categoryName, req.user.id);

    return res
    .status(200)
    .json(new ApiResponse(200, result, "Tasks deleted successfully"));
  }

  static async getTasksByCategoryName(req: Request, res: Response) {
    const { categoryName } = req.params as { categoryName: string };

    if (!req.user || !req.user.id){ 
        throw new BadRequestException("User not found");
    }

    if (!categoryName){ 
        throw new BadRequestException("category name is required");
    }

    const tasks = await taskService.getTasksByCategoryName(categoryName, req.user.id);

    return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
  }

  static async getTaskByName(req: Request, res: Response) {
    const { taskName, categoryName } = req.params as { taskName: string, categoryName: string };

    if (!req.user || !req.user.id){ 
        throw new BadRequestException("User not found");
    }

    if (!taskName){ 
        throw new BadRequestException("task name is required");
    }

    if (!categoryName){ 
        throw new BadRequestException("category name is required");
    }

    const task = await taskService.getTaskByName(taskName, categoryName, req.user.id);

    return res
    .status(200)
    .json(new ApiResponse(200, task, "Task fetched successfully"));
  }

  static async updateTaskByName(req: Request, res: Response) {
    const { taskName, categoryName } = req.params as { taskName: string, categoryName: string };
    const task = req.body;

    if (!req.user || !req.user.id){ 
        throw new BadRequestException("User not found");
    }

    if (!taskName){ 
        throw new BadRequestException("task name is required");
    }

    if (!categoryName){ 
        throw new BadRequestException("category name is required");
    }

    const updated = await taskService.updateTaskByName(taskName, categoryName, req.user.id, task);

    return res
    .status(200)
    .json(new ApiResponse(200, updated, "Task updated successfully"));
  }
}
