import { Router } from "express";
import roleController from "../controller/role.controller";
import { requireAuth, requireRoles } from "../../../middleware/auth";

const router = Router();

// Public routes
router.get("/", roleController.getAllRoles);

// Admin routes
router.post("/", requireAuth, requireRoles("admin"), roleController.createRole);
router.patch("/:id", requireAuth, requireRoles("admin"), roleController.updateRole);
router.post("/reorder", requireAuth, requireRoles("admin"), roleController.reorderRoles);
router.delete("/:id", requireAuth, requireRoles("admin"), roleController.deleteRole);
router.post("/seed", requireAuth, requireRoles("admin"), roleController.seedDefaultRoles);

export default router;
