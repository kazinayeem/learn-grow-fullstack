import { Request, Response } from "express";
import * as assignmentService from "../service/assignment.service";

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const result = await assignmentService.createAssignment({
      ...req.body,
      createdBy: userId,
    });

    return res.status(result.success ? 201 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAssignmentsByCourse = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { courseId } = req.params;
    const { status } = req.query;

    const result = await assignmentService.getAssignments(
      courseId,
      userId,
      status ? { status: status as string } : undefined
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await assignmentService.getAssignmentById(id);

    return res.status(result.success ? 200 : 404).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const result = await assignmentService.updateAssignment(id, userId, req.body);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const result = await assignmentService.deleteAssignment(id, userId);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { submissionLink } = req.body;

    if (!submissionLink) {
      return res.status(400).json({
        success: false,
        message: "Submission link is required",
      });
    }

    const result = await assignmentService.submitAssignment(id, userId, submissionLink);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getAssignmentSubmissions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const result = await assignmentService.getAssignmentSubmissions(id, userId);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getMySubmission = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const result = await assignmentService.getMySubmission(id, userId);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const gradeSubmission = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { score, feedback } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: "Score is required",
      });
    }

    const result = await assignmentService.gradeSubmission(id, userId, score, feedback);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
