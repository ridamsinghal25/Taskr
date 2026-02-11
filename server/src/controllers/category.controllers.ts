import type { Request, Response } from "express";
import { CategoryService } from "../services/category.services.js";
import { ApiResponse } from "../lib/ApiResponse.js";
import { BadRequestException, UnauthorizedException } from "../lib/appError.js";

const categoryService = new CategoryService();


function requireUserId(req: Request): string {
  const userId = (req as any)?.user?.id;

  if (!userId) throw new UnauthorizedException("User not found");
  
  return userId;
}

export class CategoryController {
  static async createCategory(req: Request, res: Response) {

    const userId = requireUserId(req);
    const { name } = req.body;

    if (!name) {
        throw new BadRequestException("name is required");
    }

    const category = await categoryService.createCategory(name, userId);

    return res
      .status(201)
      .json(new ApiResponse(201, category, "Category created successfully"));
  }

  static async updateCategory(req: Request, res: Response) {
    const { categoryId } = req.params as { categoryId: string };
    const { name } = req.body;
    const userId = requireUserId(req);

    if (!categoryId){
        throw new BadRequestException("categoryId is required");
    }

    if (!name) {
        throw new BadRequestException("Category name is required");
    }

    const updated = await categoryService.updateCategory(categoryId, name, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Category updated"));
  }

  static async deleteCategories(req: Request, res: Response) {
    const userId = requireUserId(req);
    const { categoryIds } = req.body;

    if (!categoryIds) {
        throw new BadRequestException("Category IDs are required");
    }

    const result = await categoryService.deleteCategory(categoryIds, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Categories deleted"));
  }

  static async getCategories(req: Request, res: Response) {
    const userId = requireUserId(req);

    const categories = await categoryService.getCategories(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, categories, "Categories fetched"));
  }

  static async getCategoriesById(req: Request, res: Response) {
    const { categoryIds } = req.body

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      throw new BadRequestException("categoryIds are required");
    }

    const categories = await categoryService.getCategoriesById(categoryIds);
  
    return res
      .status(200)
      .json(new ApiResponse(200, categories, "Categories fetched succesfully"));
  }
  
  static async getCategoriesByName(req: Request, res: Response) {
    const { categoryNames } = req.body as { categoryNames: string[] };

    const userId = requireUserId(req);

    if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
      throw new BadRequestException("categoryNames are required");
    }

    const categories = await categoryService.getCategoriesByName(categoryNames, userId);
  
    return res
      .status(200)
      .json(new ApiResponse(200, categories, "Categories fetched succesfully"));
  }

  static async updateCategoryByName(req: Request, res: Response) {
    const { categoryName } = req.params as { categoryName: string };
    const { name } = req.body;
    const userId = requireUserId(req);

    if (!categoryName) {
      throw new BadRequestException("category name is required");
    }

    if (!name) {
      throw new BadRequestException("Category name is required");
    }

    const updated = await categoryService.updateCategoryByName(categoryName, name, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Category updated successfully"));
  }

  static async deleteCategoriesByName(req: Request, res: Response) {
    const { categories } = req.body as { categories: string[] };
    const userId = requireUserId(req);

    if (!categories) {
      throw new BadRequestException("category names are required");
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      throw new BadRequestException("category names must be a non-empty array");
    }

    const result = await categoryService.deleteCategoriesByName(categories, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Categories deleted successfully"));
  }
}
