import { Request, Response } from "express";
import { getSystemStatus } from "../service/status.service";

export const status = async (_req: Request, res: Response) => {
  try {
    const result = await getSystemStatus();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to get status" });
  }
};
