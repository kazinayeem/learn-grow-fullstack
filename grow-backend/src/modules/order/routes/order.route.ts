import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  approveOrder,
  rejectOrder,
  checkActiveSubscription,
  getUserPurchasedCourses,
} from "../controller/order.controller";
import { requireAuth, requireRoles } from "../../../middleware/auth";

const router = express.Router();

// Student routes (require authentication)
router.post("/", requireAuth, createOrder);
router.get("/my", requireAuth, getUserOrders);
router.get("/subscription/check", requireAuth, checkActiveSubscription);
router.get("/purchased-courses", requireAuth, getUserPurchasedCourses);

// Admin routes
router.get("/", requireAuth, requireRoles("admin"), getAllOrders);
router.get("/:id", requireAuth, requireRoles("admin"), getOrderById);
router.patch("/:id/approve", requireAuth, requireRoles("admin"), approveOrder);
router.patch("/:id/reject", requireAuth, requireRoles("admin"), rejectOrder);

export default router;
