import prisma from "../db/db.js";
import { categorySchema } from "../validation/category.js";
import { extractMessagesFromFlatten } from "../lib/zodError.js";
import { BadRequestException } from "../lib/appError.js";

export class CategoryService {
  async createCategory(name: string, userId: string) {
    const result = categorySchema.safeParse({ name });

    if (!result.success) {
      let errorMessage = extractMessagesFromFlatten(result.error);
      throw new BadRequestException(errorMessage);
    }

    const isCategoryAlreadyExists = await prisma.category.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (isCategoryAlreadyExists) {
      throw new BadRequestException("Category already exists with this name");
    }

    return await prisma.category.create({
      data: {
        name,
        userId,
      },
    });
  }

  async updateCategory(categoryId: string, name: string, userId: string) {
    const result = categorySchema.safeParse({ name });

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
      throw new BadRequestException(`Category not found`);
    }

    const isCategoryAlreadyExistsWithSameName = await prisma.category.findFirst(
      {
        where: {
          name,
          userId: userId,
          id: {
            not: categoryId,
          },
        },
      },
    );

    if (isCategoryAlreadyExistsWithSameName) {
      throw new BadRequestException("Category already exists with same name");
    }

    return await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
      },
    });
  }

  async deleteCategory(categoriesIds: string[], userId: string) {
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoriesIds },
        userId,
      },
      select: { id: true },
    });

    const foundIds = new Set(categories.map((c) => c.id));
    const missingIds = categoriesIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new BadRequestException(
        `${categories.length > 1 ? "Categories" : "Category"} with id ${missingIds.join(", ")} were not found`,
      );
    }

    return await prisma.category.deleteMany({
      where: {
        id: {
          in: categoriesIds,
        },
        userId,
      },
    });
  }

  async getCategories(userId: string) {
    const isUserExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!isUserExists) {
      throw new BadRequestException("User not found");
    }

    return await prisma.category.findMany({
      where: {
        userId,
      },
    });
  }

  async getCategoriesById(categoryIds: string[]) {
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        name: true,
      }
    });

    if (!categories.length) {
      throw new BadRequestException(`${categories.length > 1 ? "Categories" : "Category"} not found`);
    }

    return categories;
  }

  async updateCategoryByName(
    categoryName: string,
    newName: string,
    userId: string,
  ) {
    const result = categorySchema.safeParse({ name: newName });

    if (!result.success) {
      const errorMessage = extractMessagesFromFlatten(result.error);
      throw new BadRequestException(errorMessage);
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        name_userId: {
          name: categoryName,
          userId,
        },
      },
    });

    if (!existingCategory) {
      throw new BadRequestException(
        `Category ${categoryName} not found`,
      );
    }

    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: newName,
        userId,
        id: {
          not: existingCategory.id,
        },
      },
    });

    if (duplicateCategory) {
      throw new BadRequestException(
        "Category with this name already exists",
      );
    }

    return await prisma.category.update({
      where: {
        id: existingCategory.id,
      },
      data: {
        name: newName,
      },
    });
  }

  async deleteCategoriesByName(categoryNames: string[], userId: string) {
    const categories = await prisma.category.findMany({
      where: {
        name: {
          in: categoryNames,
        },
        userId,
      },
      select: { id: true, name: true },
    });

    const foundNames = new Set(categories.map((c) => c.name));
    const missingNames = categoryNames.filter((name) => !foundNames.has(name));

    if (missingNames.length > 0) {
      throw new BadRequestException(
        `Categories with names ${missingNames.join(", ")} were not found`,
      );
    }

    return await prisma.category.deleteMany({
      where: {
        id: {
          in: categories.map((c) => c.id),
        },
      },
    });
  }
}
