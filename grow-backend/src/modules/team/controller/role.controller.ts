import { Request, Response } from "express";
import roleService from "../service/role.service";

class RoleController {
    async getAllRoles(req: Request, res: Response) {
        try {
            const result = await roleService.getAllRoles();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async getRoleById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await roleService.getRoleById(id);
            if (!result.success) {
                res.status(404).json(result);
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async createRole(req: Request, res: Response) {
        try {
            const { name } = req.body;
            const result = await roleService.createRole({ name });
            if (!result.success) {
                res.status(400).json(result);
            } else {
                res.status(201).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async updateRole(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await roleService.updateRole(id, req.body);
            if (!result.success) {
                res.status(404).json(result);
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async reorderRoles(req: Request, res: Response) {
        try {
            const { roleOrders } = req.body;
            const result = await roleService.reorderRoles(roleOrders);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async deleteRole(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await roleService.deleteRole(id);
            if (!result.success) {
                res.status(400).json(result);
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async seedDefaultRoles(req: Request, res: Response) {
        try {
            const result = await roleService.seedDefaultRoles();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }
}

export default new RoleController();
