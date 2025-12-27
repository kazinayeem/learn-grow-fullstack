import { Request, Response } from "express";
import * as service from "../service/siteContent.service";

export const getByPage = async (req: Request, res: Response) => {
  try {
    const { page } = req.params;
    const result = await service.getSiteContent(page);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to load content" });
  }
};

export const upsert = async (req: Request, res: Response) => {
  try {
    const { page, content } = req.body as { page: string; content: any };
    const result = await service.upsertSiteContent(page, content);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to save content" });
  }
};
