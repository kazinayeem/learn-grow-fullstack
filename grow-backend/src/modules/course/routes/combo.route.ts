import express from "express";
import * as controller from "../controller/combo.controller";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = express.Router();

// ===== COMBO ROUTES (Admin only for most operations) =====

/**
 * Create a new combo
 * POST /api/course/combo/create
 */
router.post(
  "/create",
  requireAuth,
  requireRoles("admin"),
  controller.createCombo
);

/**
 * Get all active combos
 * GET /api/combo/list
 */
router.get("/list", controller.getActiveCombos);

/**
 * Get all combos (admin panel - includes inactive)
 * GET /api/combo/all
 */
router.get("/all", requireAuth, requireRoles("admin"), controller.getAllCombos);

/**
 * Get combo by ID
 * GET /api/combo/:comboId
 */
router.get("/:comboId", controller.getComboById);

/**
 * Update combo (Admin only)
 * PATCH /api/course/combo/:comboId
 */
router.patch(
  "/:comboId",
  requireAuth,
  requireRoles("admin"),
  controller.updateCombo
);

/**
 * Disable/Delete combo (Admin only)
 * DELETE /api/course/combo/:comboId
 */
router.delete(
  "/:comboId",
  requireAuth,
  requireRoles("admin"),
  controller.disableCombo
);

/**
 * Toggle combo active status (Admin only)
 * PATCH /api/combo/:comboId/toggle-status
 */
router.patch(
  "/:comboId/toggle-status",
  requireAuth,
  requireRoles("admin"),
  controller.toggleComboStatus
);

/**
 * Delete combo permanently (Admin only)
 * DELETE /api/combo/:comboId/permanent
 */
router.delete(
  "/:comboId/permanent",
  requireAuth,
  requireRoles("admin"),
  controller.deleteCombo
);

/**
 * Enroll user in combo (triggered after payment approval)
 * POST /api/course/combo/enroll
 */
router.post(
  "/enroll",
  requireAuth,
  controller.enrollInCombo
);

/**
 * Extend user's combo access (Admin only)
 * POST /api/course/combo/extend-access
 */
router.post(
  "/extend-access",
  requireAuth,
  requireRoles("admin"),
  controller.extendComboAccess
);

/**
 * Get user's combo purchases
 * GET /api/course/combo/my-combos
 */
router.get(
  "/my/purchases",
  requireAuth,
  controller.getUserComboPurchases
);

export default router;
