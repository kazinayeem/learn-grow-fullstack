import express from "express";
import * as controller from "../controller/course.controller";
import * as schema from "../schema/course.schema";
import { validate } from "@/middleware/validate";
import { requireAuth, requireRoles, requireApprovedInstructor, optionalAuth } from "@/middleware/auth";

const router = express.Router();

// ===== COURSE ROUTES =====

router.post(
  "/create-course",
  requireAuth,
  requireRoles("admin", "instructor"),
  requireApprovedInstructor,
  validate(schema.createCourseSchema),
  controller.createCourse
);

router.get("/get-all-courses", controller.getAllCourses);

router.get("/get-published-courses", controller.getPublishedCourses);

router.get("/get-featured-courses", controller.getFeaturedCourses);

router.get(
  "/get-course/:id",
  optionalAuth,
  validate(schema.courseIdSchema),
  controller.getCourseById
);

router.patch(
  "/update-course/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.updateCourseSchema),
  controller.updateCourse
);

router.delete(
  "/delete-course/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.courseIdSchema),
  controller.deleteCourse
);

router.get(
  "/get-instructor-courses/:instructorId",
  controller.getCoursesByInstructor
);

router.get(
  "/get-category-courses/:category",
  controller.getCoursesByCategory
);

// ===== MODULE ROUTES =====

router.post(
  "/create-module",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.createModuleSchema),
  controller.createModule
);

router.get(
  "/get-modules/:courseId",
  controller.getModulesByCourse
);

router.get(
  "/get-module/:id",
  validate(schema.moduleIdSchema),
  controller.getModuleById
);

router.patch(
  "/update-module/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.updateModuleSchema),
  controller.updateModule
);

router.delete(
  "/delete-module/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.moduleIdSchema),
  controller.deleteModule
);

// ===== LESSON ROUTES =====

router.post(
  "/create-lesson",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.createLessonSchema),
  controller.createLesson
);

router.get(
  "/get-lessons/:moduleId",
  controller.getLessonsByModule
);

router.get(
  "/get-lesson/:id",
  validate(schema.lessonIdSchema),
  controller.getLessonById
);

router.patch(
  "/update-lesson/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.updateLessonSchema),
  controller.updateLesson
);

router.delete(
  "/delete-lesson/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.lessonIdSchema),
  controller.deleteLesson
);

router.post(
  "/complete-lesson/:id",
  requireAuth,
  validate(schema.lessonIdSchema),
  controller.completeLesson
);

router.get("/get-free-lessons", controller.getFreeLessons);

// ===== COURSE PUBLISHING & APPROVAL ROUTES =====

router.patch(
  "/publish-course/:id",
  requireAuth,
  requireRoles("instructor"),
  controller.publishCourse
);

router.patch(
  "/unpublish-course/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  controller.unpublishCourse
);

router.patch(
  "/approve-course/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.approveCourse
);

router.patch(
  "/reject-course/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.rejectCourseApproval
);

router.get(
  "/pending-approval-courses",
  requireAuth,
  requireRoles("admin", "manager"),
  controller.getPendingApprovalCourses
);

// ===== COURSE REGISTRATION ROUTES =====

router.patch(
  "/set-registration-open/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.setRegistrationOpenSchema),
  controller.setRegistrationOpen
);

router.patch(
  "/set-registration-deadline/:id",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.setRegistrationDeadlineSchema),
  controller.setRegistrationDeadline
);

router.patch(
  "/admin/set-registration/:id",
  requireAuth,
  requireRoles("admin", "manager"),
  validate(schema.adminSetRegistrationSchema),
  controller.adminSetRegistration
);

export default router;
