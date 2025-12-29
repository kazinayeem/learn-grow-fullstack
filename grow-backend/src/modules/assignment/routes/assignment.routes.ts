import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import * as assignmentController from "../controller/assignment.controller";
import * as assignmentSchema from "../schema/assignment.schema";

const router = Router();

// Create assignment (instructor only)
router.post(
  "/create",
  requireAuth,
  validate(assignmentSchema.createAssignmentSchema),
  assignmentController.createAssignment
);

// Get assignments by course
router.get(
  "/course/:courseId",
  requireAuth,
  validate(assignmentSchema.courseIdSchema),
  assignmentController.getAssignmentsByCourse
);

// Get assignment by ID
router.get(
  "/:id",
  requireAuth,
  validate(assignmentSchema.assignmentIdSchema),
  assignmentController.getAssignmentById
);

// Update assignment (instructor only)
router.patch(
  "/:id",
  requireAuth,
  validate(assignmentSchema.updateAssignmentSchema),
  assignmentController.updateAssignment
);

// Delete assignment (instructor only)
router.delete(
  "/:id",
  requireAuth,
  validate(assignmentSchema.assignmentIdSchema),
  assignmentController.deleteAssignment
);

// Submit assignment (student)
router.post(
  "/:id/submit",
  requireAuth,
  validate(assignmentSchema.submitAssignmentSchema),
  assignmentController.submitAssignment
);

// Get all submissions for an assignment (instructor only)
router.get(
  "/:id/submissions",
  requireAuth,
  validate(assignmentSchema.assignmentIdSchema),
  assignmentController.getAssignmentSubmissions
);

// Get my submission (student)
router.get(
  "/:id/my-submission",
  requireAuth,
  validate(assignmentSchema.assignmentIdSchema),
  assignmentController.getMySubmission
);

// Grade submission (instructor only)
router.patch(
  "/submission/:id/grade",
  requireAuth,
  validate(assignmentSchema.gradeSubmissionSchema),
  assignmentController.gradeSubmission
);

export const assignmentRoutes = router;
