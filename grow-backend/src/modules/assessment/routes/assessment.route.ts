import express from "express";
import { validate } from "@/middleware/validate";
import { requireAuth, requireRoles } from "@/middleware/auth";
import * as schema from "../schema/assessment.schema";
import * as controller from "../controller/assessment.controller";

const router = express.Router();

router.post(
  "/create",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.createAssessmentSchema),
  controller.create
);

router.get(
  "/by-course/:courseId",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.courseIdParamSchema),
  controller.byCourse
);

router.patch(
  "/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.updateAssessmentSchema),
  controller.update
);

router.delete(
  "/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.assessmentIdSchema),
  controller.remove
);

export default router;
