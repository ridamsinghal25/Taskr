import prisma from "../db/db.js";
import { extractMessagesFromFlatten } from "../lib/zodError.js";
import { BadRequestException } from "../lib/appError.js";
import { noteSchema } from "../validation/note.js";
import { Note } from "@prisma/client";

export class NoteService {
  async createNote(
    title: string,
    content: string,
    categoryId: string,
  ) {
    const result = noteSchema.safeParse({ title, content });

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

    const isNoteAlreadyExists = await prisma.note.findFirst({
      where: {
        title,
        categoryId,
      },
    });

    if (isNoteAlreadyExists) {
      throw new BadRequestException(
        `Note with title ${title} already exists in category ${isCategoryExists.name}`,
      );
    }

    return await prisma.note.create({
      data: {
        title,
        content,
        categoryId,
      },
    });
  }

  async createNoteByCategoryName(categoryName: string, title: string, content: string, userId: string) {
    const result = noteSchema.safeParse({ title, content });

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

    const isNoteAlreadyExists = await prisma.note.findFirst({
      where: {
        title,
        categoryId: isCategoryExists.id,
      },
    });

    if (isNoteAlreadyExists) {
      throw new BadRequestException(
        `Note with title ${title} already exists in category ${categoryName}`,
      );
    }

    return await prisma.note.create({
      data: {
        title,
        content,
        categoryId: isCategoryExists.id,
      },
    });
  }

  async updateNote(noteId: string, note: Pick<Note, "title" | "content">, categoryId: string) {

    const isNoteExists = await prisma.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!isNoteExists) {
      throw new BadRequestException("Note not found");
    }

    const updateTitle = note.title ?? isNoteExists.title;
    const updateContent = note.content ?? isNoteExists.content;

    const result = noteSchema.safeParse({
      title: updateTitle,
      content: updateContent,
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

    if (isNoteExists.categoryId !== categoryId) {
      throw new BadRequestException(
        "Note is not in the category you are trying to update",
      );
    }

    if (note.title && note.title !== isNoteExists.title) {
      const isNoteAlreadyExistsWithSameTitle = await prisma.note.findFirst({
        where: {
          title: note.title,
          categoryId,
          id: {
            not: noteId,
          },
        },
      });

      if (isNoteAlreadyExistsWithSameTitle) {
        throw new BadRequestException(
          "Note with this title already exists in this category",
        );
      }
    }

    return await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        title: note.title ?? isNoteExists.title,
        content: note.content ?? isNoteExists.content,
      },
    });
  }

  async updateNoteByTitle(
    title: string,
    categoryName: string,
    userId: string,
    note: Pick<Note, "title" | "content">,
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

    const existingNote = await prisma.note.findFirst({
      where: {
        title,
        categoryId: category.id,
      },
    });

    if (!existingNote) {
      throw new BadRequestException(
        `Note with title ${title} not found in category ${categoryName}`,
      );
    }

    const updateTitle = note.title ?? existingNote.title;
    const updateContent = note.content ?? existingNote.content;

    const result = noteSchema.safeParse({
      title: updateTitle,
      content: updateContent,
    });

    if (!result.success) {
      const errorMessage = extractMessagesFromFlatten(result.error);
      throw new BadRequestException(errorMessage);
    }

    if (note.title && note.title !== existingNote.title) {
      const duplicateNote = await prisma.note.findFirst({
        where: {
          title: note.title,
          categoryId: category.id,
          id: {
            not: existingNote.id,
          },
        },
      });

      if (duplicateNote) {
        throw new BadRequestException(
          "Note with this title already exists in this category",
        );
      }
    }

    return await prisma.note.update({
      where: {
        id: existingNote.id,
      },
      data: {
        content: note.content ?? existingNote.content,
      },
    });
  }

  async moveNoteToCategory(noteId: string, categoryId: string) {
    const isNoteExists = await prisma.note.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!isNoteExists) {
      throw new BadRequestException("Note not found");
    }

    const isCategoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException("Category not found");
    }

    return await prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        categoryId,
      },
    });
  }

  async moveNoteToCategoryByName(categoryName: string, title: string, newCategoryName: string, userId: string) {
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

    const isNoteExists = await prisma.note.findFirst({
      where: {
        title,
        categoryId: isCategoryExists.id,
      },
    });

    if (!isNoteExists) {
      throw new BadRequestException(`Note with title ${title} not found in category ${categoryName}`);
    }

    return await prisma.note.update({
      where: {
        id: isNoteExists.id,
      },
      data: {
        categoryId: isNewCategoryExists.id,
      },
    });
  }

  async deleteNotes(noteIds: string[], categoryId: string) {
    const isCategoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException("Category not found");
    }

    const isNotesExists = await prisma.note.findMany({
      where: {
        id: {
          in: noteIds,
        },
        categoryId: categoryId,
      },
      select: { id: true },
    });

    const foundIds = new Set(isNotesExists.map((n: { id: string }) => n.id));
    const missingIds = noteIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Some notes were not found in category ${isCategoryExists.name}`,
      );
    }

    return await prisma.note.deleteMany({
      where: {
        id: {
          in: noteIds,
        },
      },
    });
  }

  async deleteNotesByTitle(titles: string[], categoryName: string, userId: string) {
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

    const notes = await prisma.note.findMany({
      where: {
        title: {
          in: titles,
        },
        categoryId: category.id,
      },
      select: { id: true, title: true },
    });

    const foundTitles = new Set(notes.map((n: { title: string }) => n.title));
    const missingTitles = titles.filter((t) => !foundTitles.has(t));

    if (missingTitles.length > 0) {
      throw new BadRequestException(
        `Notes with titles ${missingTitles.join(", ")} were not found in category ${categoryName}`,
      );
    }

    return await prisma.note.deleteMany({
      where: {
        id: {
          in: notes.map((n: { id: string }) => n.id),
        },
      },
    });
  }

  async getNotesByCategoryId(categoryId: string) {
    const isCategoryExists = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!isCategoryExists) {
      throw new BadRequestException("Category not found");
    }

    return await prisma.note.findMany({ where: { categoryId } });
  }

  async getNotesByCategoryName(categoryName: string, userId: string) {
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

    return await prisma.note.findMany({
      where: {
        categoryId: category.id,
      },
    });
  }

  async getNoteById(noteId: string) {
    const isNoteExists = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!isNoteExists) {
      throw new BadRequestException("Note not found");
    }

    return isNoteExists;
  }

  async getNoteByTitle(title: string, categoryName: string, userId: string) {
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

    const note = await prisma.note.findFirst({
      where: {
        title,
        categoryId: category.id,
      },
    });

    if (!note) {
      throw new BadRequestException(
        `Note with title "${title}" not found in category "${categoryName}"`,
      );
    }

    return note;
  }
}
