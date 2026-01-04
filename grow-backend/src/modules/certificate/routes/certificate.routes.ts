import express from "express";
import * as controller from "../controller/certificate.controller";
import { requireAuth } from "@/middleware/auth";

const router = express.Router();

// Generate certificate for completed course
router.post("/generate/:courseId", requireAuth, controller.generateCertificate);

// Get student's certificate for a specific course
router.get("/course/:courseId", requireAuth, controller.getCertificate);

// Get all certificates for logged-in student
router.get("/my-certificates", requireAuth, controller.getStudentCertificates);

// Verify certificate (public endpoint)
router.get("/verify/:certificateId", controller.verifyCertificate);

export default router;
