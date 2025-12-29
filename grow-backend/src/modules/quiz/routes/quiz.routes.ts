import express from "express";
import { validate } from "@/middleware/validate";
import { requireAuth, requireRoles } from "@/middleware/auth";
import * as schema from "../schema/quiz.schema";
import * as controller from "../controller/quiz.controller";

const router = express.Router();

// Create quiz
router.post(
  "/create",
  requireAuth,
  requireRoles("instructor", "admin"),
  validate(schema.createQuizSchema),
  controller.create
);

// Get quizzes by course
router.get(
  "/course/:courseId",
  requireAuth,
  validate(schema.courseIdSchema),
  controller.listByCourse
);

// Get quiz by ID
router.get(
  "/:id",
  requireAuth,
  validate(schema.quizIdSchema),
  controller.getById
);

// Update quiz
router.patch(
  "/:id",
  requireAuth,
  requireRoles("instructor", "admin"),
  validate(schema.updateQuizSchema),
  controller.update
);

// Publish/unpublish quiz
router.patch(
  "/:id/publish",
  requireAuth,
  requireRoles("instructor", "admin"),
  validate(schema.publishQuizSchema),
  controller.publish
);

// Delete quiz
router.delete(
  "/:id",
  requireAuth,
  requireRoles("instructor", "admin"),
  validate(schema.quizIdSchema),
  controller.remove
);

export default router;
