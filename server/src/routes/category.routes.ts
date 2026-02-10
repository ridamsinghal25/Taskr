import { Router } from "express";
import { CategoryController } from "../controllers/category.controllers.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const categoryRouter = Router();

categoryRouter.use(verifyToken);

categoryRouter
    .route("/")
    .post(asyncHandler(CategoryController.createCategory))
    .get(asyncHandler(CategoryController.getCategories))
    .delete(asyncHandler(CategoryController.deleteCategories))

categoryRouter.route("/by-ids")
    .post(asyncHandler(CategoryController.getCategoriesById));

categoryRouter.route("/:categoryName/update-category")
    .patch(asyncHandler(CategoryController.updateCategoryByName));

categoryRouter.route("/delete-categories-by-name")
    .delete(asyncHandler(CategoryController.deleteCategoriesByName));

categoryRouter.route("/:categoryId")
    .patch(asyncHandler(CategoryController.updateCategory))

export default categoryRouter;
