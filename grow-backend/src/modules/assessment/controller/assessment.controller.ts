import { Request, Response } from "express";
import * as service from "../service/assessment.service";

export const create = async (req: Request, res: Response) => {
  try {
    const data = await service.createAssessment(req.body, req.userId!);
    res.status(201).json({ success: true, message: "Assessment created", data });
  } catch (error: any) {
    res.status(error.message === "Unauthorized" ? 403 : 500).json({ success: false, message: error.message });
  }
};

export const byCourse = async (req: Request, res: Response) => {
  try {
    const data = await service.getAssessmentsByCourse(req.params.courseId, req.userId!, req.userRole!);
    res.json({ success: true, message: "Assessments retrieved", data });
  } catch (error: any) {
    res.status(error.message === "Unauthorized" ? 403 : 500).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const data = await service.updateAssessment(req.params.id, req.body, req.userId!, req.userRole!);
    res.json({ success: true, message: "Assessment updated", data });
  } catch (error: any) {
    res.status(error.message === "Unauthorized" ? 403 : 500).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await service.deleteAssessment(req.params.id, req.userId!, req.userRole!);
    res.json({ success: true, message: "Assessment deleted" });
  } catch (error: any) {
    res.status(error.message === "Unauthorized" ? 403 : 500).json({ success: false, message: error.message });
  }
};
