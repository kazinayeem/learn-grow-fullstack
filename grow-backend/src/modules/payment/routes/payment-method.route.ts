import { Router } from "express";
import * as controller from "../controller/payment-method.controller";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = Router();

// ===== PUBLIC ROUTES =====

// Get all active payment methods (for users)
router.get("/", controller.getAllPaymentMethods);

// ===== ADMIN ROUTES =====

// Get payment method by ID
router.get("/:id", requireAuth, requireRoles("admin"), controller.getPaymentMethodById);

// Create payment method
router.post("/", requireAuth, requireRoles("admin"), controller.createPaymentMethod);

// Update payment method
router.patch("/:id", requireAuth, requireRoles("admin"), controller.updatePaymentMethod);

// Delete payment method
router.delete("/:id", requireAuth, requireRoles("admin"), controller.deletePaymentMethod);

// Toggle active status
router.patch("/:id/toggle", requireAuth, requireRoles("admin"), controller.togglePaymentMethod);

// Reorder payment methods
router.post("/reorder", requireAuth, requireRoles("admin"), controller.reorderPaymentMethods);

export default router;
