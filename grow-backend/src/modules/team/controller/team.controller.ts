import { Request, Response } from "express";
import teamService from "../service/team.service";

class TeamController {
    async getAllTeamMembers(req: Request, res: Response) {
        try {
            const result = await teamService.getAllTeamMembers();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async getHomeTeamMembers(req: Request, res: Response) {
        try {
            const result = await teamService.getHomeTeamMembers();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async getTeamMemberById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await teamService.getTeamMemberById(id);
            if (!result.success) {
                res.status(404).json(result);
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async createTeamMember(req: Request, res: Response) {
        try {
            const { name, role, image, linkedIn, twitter, bio } = req.body;
            const result = await teamService.createTeamMember({
                name,
                role,
                image,
                linkedIn,
                twitter,
                bio,
            });
            if (!result.success) {
                res.status(400).json(result);
            } else {
                res.status(201).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async updateTeamMember(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await teamService.updateTeamMember(id, req.body);
            if (!result.success) {
                res.status(404).json(result);
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async toggleShowHome(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { showOnHome } = req.body;
            const result = await teamService.toggleShowHome(id, showOnHome);
            if (!result.success) {
                res.status(404).json(result);
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async deleteTeamMember(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await teamService.deleteTeamMember(id);
            if (!result.success) {
                res.status(404).json(result);
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async importInstructors(req: Request, res: Response) {
        try {
            const { instructorIds } = req.body;
            const result = await teamService.importInstructors(instructorIds);
            if (!result.success) {
                res.status(400).json(result);
            } else {
                res.status(201).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async getApprovedInstructors(req: Request, res: Response) {
        try {
            const result = await teamService.getApprovedInstructors();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async reorderMembers(req: Request, res: Response) {
        try {
            const { memberOrders } = req.body;
            const result = await teamService.reorderMembers(memberOrders);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async updateMemberPosition(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { position } = req.body;
            const result = await teamService.updateMemberPosition(id, position);
            if (!result.success) {
                res.status(404).json(result);
            } else {
                res.status(200).json(result);
            }
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }
}

export default new TeamController();
