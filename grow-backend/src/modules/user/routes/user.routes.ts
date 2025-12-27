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
// Public: approved instructors list for Team/Experts page
router.get("/instructors/approved", controller.getApprovedInstructorsPublic);

// Protected routes
router.post("/logout", requireAuth, controller.logout);
router.get("/profile", requireAuth, controller.getProfile);
router.post("/change-password", requireAuth, validate(schema.changePasswordSchema), controller.changePassword);

// Admin routes for instructor approval
router.get("/instructors", requireAuth, requireRoles("admin"), controller.getAllInstructors);
router.patch("/instructors/:instructorId/approve", requireAuth, requireRoles("admin"), controller.approveInstructor);
router.patch("/instructors/:instructorId/reject", requireAuth, requireRoles("admin"), controller.rejectInstructor);

// Admin routes for user management with pagination/CRUD
router.get("/admin", requireAuth, requireRoles("admin"), controller.listUsers);
router.post("/admin", requireAuth, requireRoles("admin"), controller.createUserAdmin);
router.get("/admin/:id", requireAuth, requireRoles("admin"), controller.getUserByIdAdmin);
router.put("/admin/:id", requireAuth, requireRoles("admin"), controller.updateUserAdmin);
router.patch("/admin/:id/role", requireAuth, requireRoles("admin"), controller.updateUserRoleAdmin);
router.delete("/admin/:id", requireAuth, requireRoles("admin"), controller.deleteUserAdmin);

export default router;
