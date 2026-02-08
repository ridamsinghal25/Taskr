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
      throw new BadRequestException("Category already exists");
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
      throw new BadRequestException("Category not found");
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
        `Categories with ids ${missingIds.join(", ")} were not found`,
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
}
