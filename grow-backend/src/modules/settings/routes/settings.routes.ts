import express from "express";
import * as controller from "../controller/settings.controller";
import * as smtpController from "../controller/smtp.controller";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = express.Router();

router.get("/commission", controller.getCommission);
router.patch("/commission", requireAuth, requireRoles("admin"), controller.updateCommission);

// SMTP settings (admin only)
router.get("/smtp", requireAuth, requireRoles("admin"), smtpController.getSMTPConfig);
router.put("/smtp", requireAuth, requireRoles("admin"), smtpController.updateSMTPConfig);
router.post("/smtp/test", requireAuth, requireRoles("admin"), smtpController.testSMTPConnection);

export default router;
