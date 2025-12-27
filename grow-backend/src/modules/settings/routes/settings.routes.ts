import express from "express";
import * as controller from "../controller/settings.controller";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = express.Router();

router.get("/commission", controller.getCommission);
router.patch("/commission", requireAuth, requireRoles("admin"), controller.updateCommission);

export default router;
