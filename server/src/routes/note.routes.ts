import { Router } from "express";
import { NoteController } from "../controllers/note.controllers.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const noteRouter = Router();

noteRouter.use(verifyToken);

noteRouter
  .route("/")
  .post(asyncHandler(NoteController.createNote))
  .get(asyncHandler(NoteController.getNotesByCategoryId))
  .delete(asyncHandler(NoteController.deleteNotes));

noteRouter
  .route("/:categoryName/create-note")
  .post(asyncHandler(NoteController.createNoteByCategoryName));

noteRouter
  .route("/:categoryName/:title/move-note")
  .patch(asyncHandler(NoteController.moveNoteToCategoryByName));

noteRouter
  .route("/:categoryName/get-notes")
  .get(asyncHandler(NoteController.getNotesByCategoryName));

noteRouter
  .route("/:categoryName/:title/get-note")
  .get(asyncHandler(NoteController.getNoteByTitle));

noteRouter
  .route("/:categoryName/:title/update-note")
  .patch(asyncHandler(NoteController.updateNoteByTitle));

noteRouter
  .route("/:categoryName/delete-notes")
  .delete(asyncHandler(NoteController.deleteNotesByTitle));

noteRouter
  .route("/:noteId")
  .patch(asyncHandler(NoteController.updateNote))
  .get(asyncHandler(NoteController.getNoteById));

noteRouter
  .route("/:noteId/move")
  .post(asyncHandler(NoteController.moveNoteToCategory));

export default noteRouter;
