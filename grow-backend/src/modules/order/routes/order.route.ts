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
  getEnrolledStudents,
} from "../controller/order.controller";
import { requireAuth, requireRoles } from "../../../middleware/auth";

const router = express.Router();

// Student routes (require authentication)
router.post("/", requireAuth, createOrder);
router.get("/my", requireAuth, getUserOrders);
router.get("/subscription/check", requireAuth, checkActiveSubscription);
router.get("/purchased-courses", requireAuth, getUserPurchasedCourses);
router.get("/course/:courseId/students", requireAuth, getEnrolledStudents);

// Admin routes
router.get("/", requireAuth, requireRoles("admin", "manager"), getAllOrders);
router.get("/:id", requireAuth, requireRoles("admin", "manager"), getOrderById);
router.patch("/:id/approve", requireAuth, requireRoles("admin", "manager"), approveOrder);
router.patch("/:id/reject", requireAuth, requireRoles("admin", "manager"), rejectOrder);

export default router;
