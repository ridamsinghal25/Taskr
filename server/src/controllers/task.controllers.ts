import type { Request, Response } from "express";
import { TaskService } from "../services/task.services.js";
import { ApiResponse } from "../lib/ApiResponse.js";
import { BadRequestException } from "../lib/appError.js";

const taskService = new TaskService();

export class TaskController {
  static async createTask(req: Request, res: Response) {
    const { name, type, status } = req.body;
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

    const task = await taskService.createTask(name, type, status, categoryId);

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
}
