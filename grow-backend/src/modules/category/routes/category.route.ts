import express from "express";
import * as controller from "../controller/category.controller";
import * as schema from "../schema/category.schema";
import { validate } from "@/middleware/validate";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = express.Router();

router.get("/get-all-category", controller.getAllCategories);

router.get(
  "/get-single-category/:id",
  validate(schema.categoryIdSchema),
  controller.getCategoryById
);

router.post(
  "/create-category",
  requireAuth,
  requireRoles("admin", "instructor"),
  validate(schema.createCategorySchema),
  controller.createCategory
);

router.patch(
  "/update-category/:id",
  requireAuth,
  requireRoles("admin"),
  validate(schema.updateCategorySchema),
  controller.updateCategory
);

router.delete(
  "/delete-category/:id",
  requireAuth,
  requireRoles("admin"),
  validate(schema.categoryIdSchema),
  controller.deleteCategory
);

export default router;
