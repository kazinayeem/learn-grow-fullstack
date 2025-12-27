import { Request, Response } from "express";
import * as service from "../service/settings.service";

export const getCommission = async (_req: Request, res: Response) => {
  try {
    const result = await service.getCommission();
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to get commission" });
  }
};

export const updateCommission = async (req: Request, res: Response) => {
  try {
    const { platformCommissionPercent } = req.body as { platformCommissionPercent: number };
    const result = await service.updateCommission(Number(platformCommissionPercent));
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to update commission" });
  }
};
