import express from "express";
import * as controller from "../controller/user.controller";
import * as schema from "../schema/user.schema";
import { validate } from "@/middleware/validate";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = express.Router();

// Public routes
router.post("/send-otp", validate(schema.sendOtpSchema), controller.sendOtp);
router.post("/verify-otp", validate(schema.verifyOtpSchema), controller.verifyOtp);
router.post("/register", validate(schema.registerSchema), controller.register);
router.post("/login", validate(schema.loginSchema), controller.login);
router.post("/refresh-token", validate(schema.refreshTokenSchema), controller.refreshToken);
router.post("/select-role/:userId", controller.selectRoleForGoogleUser); // For new Google OAuth users
router.post("/forgot-password", validate(schema.forgotPasswordSchema), controller.forgotPassword); // Request password reset
router.post("/verify-forgot-password-otp", validate(schema.verifyForgotPasswordOtpSchema), controller.verifyForgotPasswordOtp); // Verify OTP for password reset
router.post("/reset-password", validate(schema.resetPasswordSchema), controller.resetPassword); // Reset password with OTP
// Public: approved instructors list for Team/Experts page
router.get("/instructors/approved", controller.getApprovedInstructorsPublic);

// Protected routes
router.post("/logout", requireAuth, controller.logout);
router.get("/profile", requireAuth, controller.getProfile);
router.patch("/profile", requireAuth, validate(schema.updateProfileSchema), controller.updateProfile);
router.patch("/profile/photo", requireAuth, validate(schema.updateProfilePhotoSchema), controller.updateProfilePhoto);
router.get("/instructor-stats", requireAuth, requireRoles("instructor"), controller.getInstructorDashboardStats);
router.get("/instructor/students", requireAuth, requireRoles("instructor"), controller.getInstructorStudents);
router.get("/instructor/students/:id", requireAuth, requireRoles("instructor"), controller.getInstructorStudentById);
router.post("/change-password", requireAuth, validate(schema.changePasswordSchema), controller.changePassword);
router.post("/send-password-change-otp", requireAuth, validate(schema.sendPasswordChangeOtpSchema), controller.sendPasswordChangeOtp);
router.post("/verify-password-change-otp", requireAuth, validate(schema.verifyPasswordChangeOtpSchema), controller.verifyPasswordChangeOtp);
router.patch("/update-phone", requireAuth, validate(schema.updatePhoneNumberSchema), controller.updatePhoneNumber);

// Admin routes for instructor approval
router.get("/instructors", requireAuth, requireRoles("admin", "manager"), controller.getAllInstructors);
router.patch("/instructors/:instructorId/approve", requireAuth, requireRoles("admin", "manager"), controller.approveInstructor);
router.patch("/instructors/:instructorId/reject", requireAuth, requireRoles("admin", "manager"), controller.rejectInstructor);

// Admin routes for user management with pagination/CRUD
router.get("/admin/dashboard/stats", requireAuth, requireRoles("admin", "manager"), controller.getAdminDashboardStats);
router.get("/admin", requireAuth, requireRoles("admin", "manager"), controller.listUsers);
router.post("/admin", requireAuth, requireRoles("admin"), controller.createUserAdmin);
router.get("/admin/:id", requireAuth, requireRoles("admin", "manager"), controller.getUserByIdAdmin);
router.put("/admin/:id", requireAuth, requireRoles("admin"), controller.updateUserAdmin);
router.patch("/admin/:id/role", requireAuth, requireRoles("admin"), controller.updateUserRoleAdmin);
router.delete("/admin/:id", requireAuth, requireRoles("admin"), controller.deleteUserAdmin);

export default router;
