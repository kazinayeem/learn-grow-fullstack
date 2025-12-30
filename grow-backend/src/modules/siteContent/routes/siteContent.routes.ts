import express from "express";
import * as controller from "../controller/siteContent.controller";
import { validate } from "@/middleware/validate";
import { upsertSiteContentSchema } from "../schema/siteContent.schema";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = express.Router();

// Public: read content by page key
router.get("/:page", controller.getByPage);

// Admin: upsert content by page key
router.post("/:page", requireAuth, requireRoles("admin"), validate(upsertSiteContentSchema), controller.upsert);
// Also support body-based page (for backward compatibility)
router.post("/", requireAuth, requireRoles("admin"), validate(upsertSiteContentSchema), controller.upsertFromBody);

export default router;
