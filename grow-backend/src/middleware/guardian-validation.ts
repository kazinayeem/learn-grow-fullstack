import { Request, Response, NextFunction } from "express";
import { GuardianProfile } from "@/modules/user/model/guardianProfile.model";
import { StudentProfile } from "@/modules/user/model/studentProfile.model";
import mongoose from "mongoose";

/**
 * Middleware to validate guardian-student relationship
 * Ensures a guardian can only access data for their linked students
 * 
 * Usage:
 *   router.get("/student-data", requireAuth, validateGuardianStudentAccess, handler)
 * 
 * Query parameter: studentId (optional)
 * If not provided, defaults to guardian's first linked student
 */
export const validateGuardianStudentAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { studentId: queryStudentId } = req.query;

    // Only validate for guardians
    if (userRole !== "guardian") {
      return next();
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    // Get guardian's linked students from GuardianProfile
    const guardianProfiles = await GuardianProfile.find({ userId }).select("studentId");

    if (!guardianProfiles || guardianProfiles.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No linked students found for this guardian",
      });
    }

    const linkedStudentIds = guardianProfiles.map((gp: any) => 
      gp.studentId?.toString() || gp.studentId
    ).filter(Boolean);

    // If studentId is provided in query, validate it
    if (queryStudentId && typeof queryStudentId === "string") {
      const studentIdStr = queryStudentId.toString();
      
      // Verify the studentId is valid MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(studentIdStr)) {
        return res.status(400).json({
          success: false,
          message: "Invalid studentId format",
        });
      }

      if (!linkedStudentIds.includes(studentIdStr)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this student's data. This student is not linked to your guardian account.",
        });
      }

      // Attach validated studentId to request
      (req as any).validatedStudentId = studentIdStr;
    } else {
      // Default to first linked student
      if (linkedStudentIds.length === 0) {
        return res.status(403).json({
          success: false,
          message: "No valid linked students found for this guardian",
        });
      }
      (req as any).validatedStudentId = linkedStudentIds[0];
    }

    // Attach all linked student IDs for reference
    (req as any).guardianLinkedStudentIds = linkedStudentIds;

    next();
  } catch (error: any) {
    console.error("Guardian-student validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate guardian-student relationship",
      error: error.message,
    });
  }
};

/**
 * Middleware to validate student-guardian relationship (reverse)
 * Ensures a student can only access their own data or data about their guardians
 */
export const validateStudentGuardianAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { guardianId: queryGuardianId } = req.query;

    // Only validate for students
    if (userRole !== "student") {
      return next();
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    // Get student's linked guardians from StudentProfile
    const studentProfile = await StudentProfile.findOne({ userId }).select("guardianId");

    if (queryGuardianId && typeof queryGuardianId === "string") {
      const guardianIdStr = queryGuardianId.toString();

      // Verify the guardianId is valid MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(guardianIdStr)) {
        return res.status(400).json({
          success: false,
          message: "Invalid guardianId format",
        });
      }

      // Check if this guardian is linked to the student
      if (!studentProfile?.guardianId || studentProfile.guardianId.toString() !== guardianIdStr) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this guardian's data. This guardian is not linked to your account.",
        });
      }

      (req as any).validatedGuardianId = guardianIdStr;
    } else {
      // Default to student's linked guardian if exists
      if (studentProfile?.guardianId) {
        (req as any).validatedGuardianId = studentProfile.guardianId.toString();
      }
    }

    next();
  } catch (error: any) {
    console.error("Student-guardian validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate student-guardian relationship",
      error: error.message,
    });
  }
};

/**
 * Middleware to ensure enrollments only fetch data for authorized students
 * Prevents guardians from accessing other students' data through enrollments
 */
export const validateEnrollmentAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { studentId: queryStudentId } = req.body;

    // Only validate for guardians
    if (userRole !== "guardian") {
      return next();
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in request",
      });
    }

    // If trying to access enrollment for a specific student, validate
    if (queryStudentId && typeof queryStudentId === "string") {
      const studentIdStr = queryStudentId.toString();

      // Verify the studentId is valid MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(studentIdStr)) {
        return res.status(400).json({
          success: false,
          message: "Invalid studentId format",
        });
      }

      // Check guardian-student relationship
      const guardianProfile = await GuardianProfile.findOne({
        userId,
        studentId: studentIdStr,
      }).lean();

      if (!guardianProfile) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access enrollments for this student",
        });
      }

      (req as any).validatedStudentId = studentIdStr;
    }

    next();
  } catch (error: any) {
    console.error("Enrollment access validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate enrollment access",
      error: error.message,
    });
  }
};
