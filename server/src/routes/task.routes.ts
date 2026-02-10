import { Router } from "express";
import { TaskController } from "../controllers/task.controllers.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const taskRouter = Router();

taskRouter.use(verifyToken);

taskRouter.route("/")
    .post(asyncHandler(TaskController.createTask))
    .get(asyncHandler(TaskController.getTasksByCategoryId))
    .delete(asyncHandler(TaskController.deleteTasks))

taskRouter.route("/:categoryName/create-task")
    .post(asyncHandler(TaskController.createTaskByCategoryName))

taskRouter.route("/:categoryName/:taskName/move-task")
    .patch(asyncHandler(TaskController.moveTaskToCategoryByName))

taskRouter.route("/:categoryName/get-tasks")
    .get(asyncHandler(TaskController.getTasksByCategoryName))

taskRouter.route("/:categoryName/:taskName/get-task")
    .get(asyncHandler(TaskController.getTaskByName))

taskRouter.route("/:categoryName/:taskName/update-task")
    .patch(asyncHandler(TaskController.updateTaskByName))

taskRouter.route("/:categoryName/delete-tasks")
    .delete(asyncHandler(TaskController.deleteTasksByName))
    
taskRouter.route("/:taskId")
    .patch(asyncHandler(TaskController.updateTask))
    .get(asyncHandler(TaskController.getTaskById))


taskRouter.route("/:taskId/move").post(asyncHandler(TaskController.moveTaskToCategory));



export default taskRouter;
