import express from "express";
import * as controller from "../controller/liveClass.controller";
import * as schema from "../schema/liveClass.schema";
import { validate } from "@/middleware/validate";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = express.Router();

// Public routes
router.get("/upcoming", controller.getUpcomingClasses);
router.get("/all", controller.getAllLiveClasses);
router.get("/course/:courseId", validate(schema.getCourseClassesSchema), controller.getLiveClassesByCourse);
router.get("/:id", validate(schema.liveClassIdSchema), controller.getLiveClassById);

// Protected routes - Instructor and Manager
router.post(
  "/create",
  requireAuth,
  requireRoles("instructor", "manager", "admin"),
  validate(schema.createLiveClassSchema),
  controller.createLiveClass
);

router.get(
  "/instructor/my-classes",
  requireAuth,
  requireRoles("instructor", "manager", "admin"),
  controller.getLiveClassesByInstructor
);

router.patch(
  "/:id",
  requireAuth,
  requireRoles("instructor", "manager", "admin"),
  validate(schema.liveClassIdSchema),
  controller.updateLiveClass
);

router.delete(
  "/:id",
  requireAuth,
  requireRoles("instructor", "manager", "admin"),
  validate(schema.liveClassIdSchema),
  controller.deleteLiveClass
);

// Admin/Manager routes for approval
router.patch(
  "/:id/approve",
  requireAuth,
  requireRoles("admin", "manager"),
  validate(schema.liveClassIdSchema),
  controller.approveLiveClass
);

router.patch(
  "/:id/reject",
  requireAuth,
  requireRoles("admin", "manager"),
  validate(schema.liveClassIdSchema),
  controller.rejectLiveClass
);

router.patch(
  "/:id/recorded-link",
  requireAuth,
  requireRoles("instructor", "manager", "admin"),
  validate(schema.liveClassIdSchema),
  controller.updateRecordedLink
);

router.get(
  "/admin/pending",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.getPendingLiveClasses
);

export const liveClassRoutes = router;
