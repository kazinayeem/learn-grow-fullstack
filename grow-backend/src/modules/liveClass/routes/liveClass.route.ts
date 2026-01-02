import express from "express";
import * as controller from "../controller/liveClass.controller";
import * as schema from "../schema/liveClass.schema";
import { validate } from "@/middleware/validate";
import { requireAuth, requireRoles, optionalAuth } from "@/middleware/auth";

const router = express.Router();

// Public routes (specific routes first, then generic)
router.get("/upcoming", controller.getUpcomingClasses);
router.get("/all", optionalAuth, controller.getAllLiveClasses);

// Admin routes (before generic :id routes)
router.get(
  "/admin/pending",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.getPendingLiveClasses
);

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

// Special :id routes (before generic :id route)
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

// Generic :id routes (must be last)
router.get("/:id", validate(schema.liveClassIdSchema), controller.getLiveClassById);

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

// Course route (generic, after specific routes)
router.get("/course/:courseId", validate(schema.getCourseClassesSchema), controller.getLiveClassesByCourse);

export const liveClassRoutes = router;
