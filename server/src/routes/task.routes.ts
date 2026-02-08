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

    
taskRouter.route("/:taskId")
    .patch(asyncHandler(TaskController.updateTask))
    .get(asyncHandler(TaskController.getTaskById))


taskRouter.route("/:taskId/move").post(asyncHandler(TaskController.moveTaskToCategory));



export default taskRouter;
