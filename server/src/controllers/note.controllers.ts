import type { Request, Response } from "express";
import { NoteService } from "../services/note.services.js";
import { ApiResponse } from "../lib/ApiResponse.js";
import { BadRequestException } from "../lib/appError.js";

const noteService = new NoteService();

export class NoteController {
  static async createNote(req: Request, res: Response) {
    const { title, content } = req.body;
    const { categoryId } = req.query as { categoryId: string };

    if (!title) {
      throw new BadRequestException("title is required");
    }

    if (!content) {
      throw new BadRequestException("content is required");
    }

    if (!categoryId) {
      throw new BadRequestException("categoryId is required");
    }

    const note = await noteService.createNote(title, content, categoryId);

    return res
      .status(201)
      .json(new ApiResponse(201, note, "Note created successfully"));
  }

  static async createNoteByCategoryName(req: Request, res: Response) {
    const { title, content } = req.body;
    const { categoryName } = req.params as { categoryName: string };

    if (!req.user || !req.user.id) {
      throw new BadRequestException("User not found");
    }

    if (!categoryName) {
      throw new BadRequestException("Category name is required");
    }

    if (!title) {
      throw new BadRequestException("Note title is required");
    }

    if (!content) {
      throw new BadRequestException("Note content is required");
    }

    const note = await noteService.createNoteByCategoryName(categoryName, title, content, req.user.id);

    return res
      .status(201)
      .json(new ApiResponse(201, note, "Note created successfully"));
  }

  static async updateNote(req: Request, res: Response) {
    const { categoryId } = req.query as { categoryId: string };
    const { noteId } = req.params as { noteId: string };
    const { title, content } = req.body;

    if (!noteId) {
      throw new BadRequestException("note id is required");
    }

    if (!categoryId) {
      throw new BadRequestException("category id is required");
    }

    const updated = await noteService.updateNote(noteId, { title, content }, categoryId);

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Note updated successfully"));
  }

  static async moveNoteToCategory(req: Request, res: Response) {
    const { noteId } = req.params as { noteId: string };
    const { categoryId } = req.query as { categoryId: string };

    if (!noteId) {
      throw new BadRequestException("note id is required");
    }

    if (!categoryId) {
      throw new BadRequestException("categoryId is required");
    }

    const moved = await noteService.moveNoteToCategory(noteId, categoryId);

    return res
      .status(200)
      .json(new ApiResponse(200, moved, "Note moved successfully"));
  }

  static async moveNoteToCategoryByName(req: Request, res: Response) {
    const { categoryName, title } = req.params as { categoryName: string; title: string };
    const { newCategoryName } = req.body as { newCategoryName: string };

    if (!req.user || !req.user.id) {
      throw new BadRequestException("User not found");
    }

    if (!categoryName) {
      throw new BadRequestException("category name is required");
    }

    if (!title) {
      throw new BadRequestException("note title is required");
    }

    if (!newCategoryName) {
      throw new BadRequestException("new category name is required");
    }

    const moved = await noteService.moveNoteToCategoryByName(categoryName, title, newCategoryName, req.user.id);

    return res
      .status(200)
      .json(new ApiResponse(200, moved, "Note moved successfully"));
  }

  static async deleteNotes(req: Request, res: Response) {
    const { noteIds } = req.body;
    const { categoryId } = req.query as { categoryId: string };

    if (!noteIds) {
      throw new BadRequestException("note ids are required");
    }

    if (!categoryId) {
      throw new BadRequestException("categoryId is required");
    }

    const result = await noteService.deleteNotes(noteIds, categoryId);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Notes deleted successfully"));
  }

  static async getNotesByCategoryId(req: Request, res: Response) {
    const { categoryId } = req.query as { categoryId: string };

    if (!categoryId) {
      throw new BadRequestException("categoryId is required");
    }

    const notes = await noteService.getNotesByCategoryId(categoryId);

    return res
      .status(200)
      .json(new ApiResponse(200, notes, "Notes fetched successfully"));
  }

  static async getNoteById(req: Request, res: Response) {
    const { noteId } = req.params as { noteId: string };

    if (!noteId) {
      throw new BadRequestException("note id is required");
    }

    const note = await noteService.getNoteById(noteId);

    return res
      .status(200)
      .json(new ApiResponse(200, note, "Note fetched successfully"));
  }

  static async deleteNotesByTitle(req: Request, res: Response) {
    const { titles } = req.body as { titles: string[] };
    const { categoryName } = req.params as { categoryName: string };

    if (!req.user || !req.user.id) {
      throw new BadRequestException("User not found");
    }

    if (!titles) {
      throw new BadRequestException("note titles are required");
    }

    if (!Array.isArray(titles) || titles.length === 0) {
      throw new BadRequestException("note titles must be a non-empty array");
    }

    if (!categoryName) {
      throw new BadRequestException("category name is required");
    }

    const result = await noteService.deleteNotesByTitle(titles, categoryName, req.user.id);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Notes deleted successfully"));
  }

  static async getNotesByCategoryName(req: Request, res: Response) {
    const { categoryName } = req.params as { categoryName: string };

    if (!req.user || !req.user.id) {
      throw new BadRequestException("User not found");
    }

    if (!categoryName) {
      throw new BadRequestException("category name is required");
    }

    const notes = await noteService.getNotesByCategoryName(categoryName, req.user.id);

    return res
      .status(200)
      .json(new ApiResponse(200, notes, "Notes fetched successfully"));
  }

  static async updateNoteByTitle(req: Request, res: Response) {
    const { title, categoryName } = req.params as { title: string; categoryName: string };
    const { title: newTitle, content } = req.body;

    if (!req.user || !req.user.id) {
      throw new BadRequestException("User not found");
    }

    if (!title) {
      throw new BadRequestException("note title is required");
    }

    if (!categoryName) {
      throw new BadRequestException("category name is required");
    }

    const updated = await noteService.updateNoteByTitle(title, categoryName, req.user.id, { title: newTitle, content });

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Note updated successfully"));
  }

  static async getNoteByTitle(req: Request, res: Response) {
    const { title, categoryName } = req.params as { title: string; categoryName: string };

    if (!req.user || !req.user.id) {
      throw new BadRequestException("User not found");
    }

    if (!title) {
      throw new BadRequestException("note title is required");
    }

    if (!categoryName) {
      throw new BadRequestException("category name is required");
    }

    const note = await noteService.getNoteByTitle(title, categoryName, req.user.id);

    return res
      .status(200)
      .json(new ApiResponse(200, note, "Note fetched successfully"));
  }
}
