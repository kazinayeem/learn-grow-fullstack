import express from "express";
import * as controller from "../controller/siteContent.controller";
import { validate } from "@/middleware/validate";
import { upsertSiteContentSchema } from "../schema/siteContent.schema";
import { requireAuth, requireRoles } from "@/middleware/auth";

const router = express.Router();

// Public: read content by page key
router.get("/:page", controller.getByPage);

// Admin: upsert content
router.post("/", requireAuth, requireRoles("admin"), validate(upsertSiteContentSchema), controller.upsert);

export default router;
