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
  sendOrderEmail,
  getStudentOrdersForGuardian,
  emailOrderAction,
} from "../controller/order.controller";
import { requireAuth, requireRoles } from "../../../middleware/auth";
import { validateGuardianStudentAccess } from "../../../middleware/guardian-validation";

const router = express.Router();

// Student routes (require authentication)
router.post("/", requireAuth, createOrder);
router.get("/my", requireAuth, getUserOrders);
router.get("/subscription/check", requireAuth, checkActiveSubscription);
router.get("/purchased-courses", requireAuth, getUserPurchasedCourses);
router.get("/course/:courseId/students", requireAuth, getEnrolledStudents);

// Guardian routes - allow both guardian and student to view student data
// (student views own data, guardian views linked student's data)
// Add validation to ensure guardians can only access their linked students
router.get("/student-data", requireAuth, validateGuardianStudentAccess, getStudentOrdersForGuardian);

// Unauthenticated email action route (approve/reject via signed token)
router.get("/email-action/:token", emailOrderAction);

// Get list of guardian's children
router.get("/guardian/children", requireAuth, async (req, res) => {
  try {
    const { User } = await import("../../user/model/user.model");
    const { GuardianProfile } = await import("../../user/model/guardianProfile.model");
    
    if (req.userRole !== "guardian") {
      return res.status(403).json({ success: false, message: "Only guardians can access this endpoint" });
    }
    
    // Query GuardianProfile to get authoritative student links
    const guardianProfiles = await GuardianProfile.find({ userId: req.userId })
      .populate({
        path: "studentId",
        select: "name email _id role",
      })
      .lean();
    
    if (!guardianProfiles || guardianProfiles.length === 0) {
      return res.json({
        success: true,
        data: {
          guardianId: req.userId,
          children: []
        }
      });
    }
    
    // Extract student data from GuardianProfile records
    const children = guardianProfiles.map((profile: any) => ({
      _id: profile.studentId?._id,
      name: profile.studentId?.name,
      email: profile.studentId?.email,
      role: profile.studentId?.role,
      relationship: profile.relationship
    }));
    
    res.json({
      success: true,
      data: {
        guardianId: req.userId,
        children: children
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin routes
router.get("/", requireAuth, requireRoles("admin", "manager"), getAllOrders);
router.get("/:id", requireAuth, requireRoles("admin", "manager"), getOrderById);
router.patch("/:id/approve", requireAuth, requireRoles("admin", "manager"), approveOrder);
router.patch("/:id/reject", requireAuth, requireRoles("admin", "manager"), rejectOrder);
router.patch("/:id/extend", requireAuth, requireRoles("admin", "manager"), async (req, res) => {
  try {
    const { id } = req.params;
    const { months } = req.body;

    if (!months || months < 1 || months > 12) {
      return res.status(400).json({ success: false, message: "Invalid months. Must be between 1 and 12." });
    }

    const { Order } = await import("../model/order.model");
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.planType !== "quarterly") {
      return res.status(400).json({ success: false, message: "Only quarterly subscriptions can be extended" });
    }

    if (!order.endDate) {
      return res.status(400).json({ success: false, message: "Order has no end date" });
    }

    // Extend the end date
    const newEndDate = new Date(order.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + Number(months));
    
    order.endDate = newEndDate;
    await order.save();

    res.json({
      success: true,
      message: `Subscription extended by ${months} month(s)`,
      data: order,
    });
  } catch (error: any) {
    console.error("Extend subscription error:", error);
    res.status(500).json({ success: false, message: "Failed to extend subscription", error: error.message });
  }
});

// Extend single-course order by days (admin)
router.patch("/:id/extend-days", requireAuth, requireRoles("admin", "manager"), async (req, res) => {
  try {
    const { id } = req.params;
    const { days } = req.body;

    if (!days || days < 1 || days > 30) {
      return res.status(400).json({ success: false, message: "Invalid days. Must be between 1 and 30." });
    }

    const { Order } = await import("../model/order.model");
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.planType !== "single") {
      return res.status(400).json({ success: false, message: "Only single-course orders can be extended by days" });
    }

    if (!order.endDate) {
      return res.status(400).json({ success: false, message: "Order has no end date" });
    }

    if (order.paymentStatus !== "approved") {
      return res.status(400).json({ success: false, message: "Only approved orders can be extended" });
    }

    const newEndDate = new Date(order.endDate);
    newEndDate.setDate(newEndDate.getDate() + Number(days));

    order.endDate = newEndDate;
    await order.save();

    res.json({
      success: true,
      message: `Access extended by ${days} day(s)`,
      data: order,
    });
  } catch (error: any) {
    console.error("Extend days error:", error);
    res.status(500).json({ success: false, message: "Failed to extend access", error: error.message });
  }
});

router.post("/send-email", sendOrderEmail);

// Debug endpoint - admin only
router.get("/debug/enrollments/:studentId", requireAuth, requireRoles("admin"), async (req, res) => {
  try {
    const { Enrollment } = await import("../../enrollment/model/enrollment.model");
    const { User } = await import("../../user/model/user.model");
    
    const enrollments = await Enrollment.find({ studentId: req.params.studentId })
      .populate("courseId", "title _id")
      .populate("studentId", "name email _id");
    
    const student = await User.findById(req.params.studentId).select("name email _id role");
    
    res.json({
      success: true,
      student: {
        _id: student?._id,
        name: student?.name,
        email: student?.email,
        role: student?.role
      },
      enrollmentCount: enrollments.length,
      enrollments: enrollments.map(e => ({
        _id: e._id,
        studentId: (e.studentId as any)?._id || (e as any).studentId,
        courseId: (e.courseId as any)?._id || (e as any).courseId,
        courseTitle: (e.courseId as any)?.title,
        progress: (e as any).progress,
        createdAt: (e as any).createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
