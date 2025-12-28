import express from "express";
import * as controller from "../controller/blog.controller";
import { requireAuth, requireRoles, optionalAuth } from "@/middleware/auth";

const router = express.Router();

// ===== BLOG ROUTES =====

// Create blog (authenticated: student, instructor, admin)
router.post(
  "/create",
  requireAuth,
  requireRoles("student", "instructor", "admin"),
  controller.createBlog
);

// Get all blogs (public - only published & approved, with optional filters)
router.get("/", optionalAuth, controller.getAllBlogs);

// Get blog by ID (public)
router.get("/:id", controller.getBlogById);

// Get blog by slug (public)
router.get("/slug/:slug", controller.getBlogBySlug);

// Update blog (authenticated: owner or admin)
router.patch(
  "/:id",
  requireAuth,
  requireRoles("student", "instructor", "admin"),
  controller.updateBlog
);

// Delete blog (authenticated: owner or admin)
router.delete(
  "/:id",
  requireAuth,
  requireRoles("student", "instructor", "admin"),
  controller.deleteBlog
);

// ===== ADMIN ROUTES =====

// Get pending approval blogs
router.get(
  "/admin/pending-approval",
  requireAuth,
  requireRoles("admin"),
  controller.getApprovalPendingBlogs
);

// Approve blog
router.patch(
  "/admin/approve/:id",
  requireAuth,
  requireRoles("admin"),
  controller.approveBlog
);

// Reject blog
router.patch(
  "/admin/reject/:id",
  requireAuth,
  requireRoles("admin"),
  controller.rejectBlog
);

// ===== CATEGORY ROUTES =====

// Create category (authenticated users)
router.post(
  "/category/create",
  requireAuth,
  requireRoles("student", "instructor", "admin"),
  controller.createCategory
);

// Get all categories (public)
router.get("/category/list", controller.getAllCategories);

// Update category (admin only)
router.patch(
  "/category/:id",
  requireAuth,
  requireRoles("admin"),
  controller.updateCategory
);

// Delete category (admin only)
router.delete(
  "/category/:id",
  requireAuth,
  requireRoles("admin"),
  controller.deleteCategory
);

export default router;
