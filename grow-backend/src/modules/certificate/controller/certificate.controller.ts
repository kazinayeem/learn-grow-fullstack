import { Request, Response } from "express";
import * as certificateService from "../service/certificate.service";

export const generateCertificate = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId; // From auth middleware

    const result = await certificateService.generateCertificate(studentId, courseId, req);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in generateCertificate controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCertificate = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    const result = await certificateService.getCertificate(studentId, courseId, req);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in getCertificate controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.params;

    const result = await certificateService.verifyCertificate(certificateId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in verifyCertificate controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getStudentCertificates = async (req: Request, res: Response) => {
  try {
    const studentId = req.userId;

    const result = await certificateService.getStudentCertificates(studentId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error in getStudentCertificates controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
