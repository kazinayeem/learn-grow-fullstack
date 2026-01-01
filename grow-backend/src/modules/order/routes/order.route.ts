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
} from "../controller/order.controller";
import { requireAuth, requireRoles } from "../../../middleware/auth";

const router = express.Router();

// Student routes (require authentication)
router.post("/", requireAuth, createOrder);
router.get("/my", requireAuth, getUserOrders);
router.get("/subscription/check", requireAuth, checkActiveSubscription);
router.get("/purchased-courses", requireAuth, getUserPurchasedCourses);
router.get("/course/:courseId/students", requireAuth, getEnrolledStudents);

// Guardian routes - allow both guardian and student to view student data
// (student views own data, guardian views linked student's data)
router.get("/student-data", requireAuth, getStudentOrdersForGuardian);

// Get list of guardian's children
router.get("/guardian/children", requireAuth, async (req, res) => {
  try {
    const { User } = await import("../../user/model/user.model");
    
    if (req.userRole !== "guardian") {
      return res.status(403).json({ success: false, message: "Only guardians can access this endpoint" });
    }
    
    const guardian = await User.findById(req.userId).populate('children', 'name email _id role');
    
    if (!guardian) {
      return res.status(404).json({ success: false, message: "Guardian not found" });
    }
    
    res.json({
      success: true,
      data: {
        guardianId: guardian._id,
        guardianName: guardian.name,
        children: (guardian.children || []).map((child: any) => ({
          _id: child._id,
          name: child.name,
          email: child.email,
          role: child.role
        }))
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
