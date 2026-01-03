/**
 * Guardian-Student Relationship Utility Functions
 * 
 * This module provides utility functions to safely query guardian-student relationships
 * and prevent data leakage between different guardians and students.
 */

import { GuardianProfile } from "@/modules/user/model/guardianProfile.model";
import { StudentProfile } from "@/modules/user/model/studentProfile.model";
import { User } from "@/modules/user/model/user.model";
import mongoose from "mongoose";

/**
 * Get all students linked to a guardian
 * 
 * @param guardianId - The guardian's user ID
 * @returns Array of student IDs and their details
 */
export async function getGuardianLinkedStudents(guardianId: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(guardianId)) {
      return {
        success: false,
        message: "Invalid guardianId format",
        students: [],
      };
    }

    const guardianProfiles = await GuardianProfile.find({ userId: guardianId })
      .populate({
        path: "studentId",
        select: "name email phone role isVerified createdAt",
      })
      .lean();

    if (!guardianProfiles || guardianProfiles.length === 0) {
      return {
        success: true,
        message: "Guardian has no linked students",
        students: [],
      };
    }

    const students = guardianProfiles
      .filter((gp: any) => gp.studentId) // Filter out invalid references
      .map((gp: any) => ({
        ...gp.studentId,
        relationship: gp.relationship,
        guardianProfileId: gp._id,
      }));

    return {
      success: true,
      message: `Found ${students.length} linked student(s)`,
      students,
    };
  } catch (error: any) {
    console.error("Error getting guardian linked students:", error);
    return {
      success: false,
      message: error.message || "Failed to get linked students",
      students: [],
    };
  }
}

/**
 * Validate that a guardian can access a specific student's data
 * Returns true if the student is linked to the guardian
 * 
 * @param guardianId - The guardian's user ID
 * @param studentId - The student's user ID to check access for
 * @returns Validation result
 */
export async function validateGuardianCanAccessStudent(
  guardianId: string,
  studentId: string
): Promise<{ authorized: boolean; reason?: string }> {
  try {
    if (!mongoose.Types.ObjectId.isValid(guardianId)) {
      return { authorized: false, reason: "Invalid guardianId format" };
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return { authorized: false, reason: "Invalid studentId format" };
    }

    const guardianProfile = await GuardianProfile.findOne({
      userId: guardianId,
      studentId: studentId,
    }).lean();

    if (!guardianProfile) {
      return {
        authorized: false,
        reason: "Student is not linked to this guardian",
      };
    }

    return { authorized: true };
  } catch (error: any) {
    console.error("Error validating guardian-student access:", error);
    return {
      authorized: false,
      reason: error.message || "Validation failed",
    };
  }
}

/**
 * Get a guardian's primary (first) linked student
 * 
 * @param guardianId - The guardian's user ID
 * @returns The primary student's ID
 */
export async function getGuardianPrimaryStudent(guardianId: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(guardianId)) {
      return {
        success: false,
        message: "Invalid guardianId format",
        studentId: null,
      };
    }

    const guardianProfile = await GuardianProfile.findOne({ userId: guardianId })
      .select("studentId")
      .lean();

    if (!guardianProfile || !guardianProfile.studentId) {
      return {
        success: false,
        message: "Guardian has no linked student",
        studentId: null,
      };
    }

    return {
      success: true,
      studentId: guardianProfile.studentId.toString(),
    };
  } catch (error: any) {
    console.error("Error getting guardian primary student:", error);
    return {
      success: false,
      message: error.message || "Failed to get primary student",
      studentId: null,
    };
  }
}

/**
 * Get all guardians linked to a student
 * 
 * @param studentId - The student's user ID
 * @returns Array of guardian IDs and their details
 */
export async function getStudentLinkedGuardians(studentId: string) {
  try {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid studentId format",
        guardians: [],
      };
    }

    const studentProfile = await StudentProfile.findOne({ userId: studentId })
      .populate({
        path: "guardianId",
        select: "name email phone role isVerified createdAt",
      })
      .lean();

    if (!studentProfile || !studentProfile.guardianId) {
      return {
        success: true,
        message: "Student has no linked guardian",
        guardians: [],
      };
    }

    return {
      success: true,
      message: "Found linked guardian",
      guardians: [studentProfile.guardianId],
    };
  } catch (error: any) {
    console.error("Error getting student linked guardians:", error);
    return {
      success: false,
      message: error.message || "Failed to get linked guardians",
      guardians: [],
    };
  }
}

/**
 * Validate that a student's data request is authorized
 * Checks if the student exists and the requester has access
 * 
 * @param studentId - The student's user ID
 * @param requesterId - The user making the request (can be student, guardian, or admin)
 * @param requesterRole - The role of the requester
 * @returns Validation result
 */
export async function validateStudentDataAccess(
  studentId: string,
  requesterId: string,
  requesterRole: string
): Promise<{ authorized: boolean; reason?: string }> {
  try {
    // Admin can access all data
    if (requesterRole === "admin" || requesterRole === "manager") {
      return { authorized: true };
    }

    // Student can only access their own data
    if (requesterRole === "student") {
      if (studentId === requesterId) {
        return { authorized: true };
      }
      return {
        authorized: false,
        reason: "Students can only access their own data",
      };
    }

    // Guardian can only access their linked students' data
    if (requesterRole === "guardian") {
      const validation = await validateGuardianCanAccessStudent(requesterId, studentId);
      return validation;
    }

    return {
      authorized: false,
      reason: `Role '${requesterRole}' is not authorized to access student data`,
    };
  } catch (error: any) {
    console.error("Error validating student data access:", error);
    return {
      authorized: false,
      reason: error.message || "Access validation failed",
    };
  }
}

/**
 * Ensure guardian-student relationship consistency
 * This function checks and fixes any discrepancies between User.children/guardians arrays
 * and GuardianProfile/StudentProfile collections
 * 
 * @param guardianId - The guardian's user ID
 * @param studentId - The student's user ID
 * @returns Sync result
 */
export async function syncGuardianStudentRelationship(
  guardianId: string,
  studentId: string
) {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(guardianId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      return {
        success: false,
        message: "Invalid guardianId or studentId format",
      };
    }

    // Ensure GuardianProfile exists
    const guardianProfile = await GuardianProfile.findOneAndUpdate(
      { userId: guardianId, studentId: studentId },
      { userId: guardianId, studentId: studentId },
      { upsert: true, new: true }
    );

    // Ensure StudentProfile exists
    const studentProfile = await StudentProfile.findOneAndUpdate(
      { userId: studentId },
      { userId: studentId, guardianId: guardianId },
      { upsert: true, new: true }
    );

    // Ensure User records have the relationship in children/guardians arrays
    const guardian = await User.findById(guardianId);
    const student = await User.findById(studentId);

    if (guardian && student) {
      // Add student to guardian's children if not already there
      const guardianChildren = (guardian.children || []).map(id => id.toString());
      if (!guardianChildren.includes(student._id.toString())) {
        guardian.children = [...(guardian.children || []), student._id] as any;
        await guardian.save();
      }

      // Add guardian to student's guardians if not already there
      const studentGuardians = (student.guardians || []).map(id => id.toString());
      if (!studentGuardians.includes(guardian._id.toString())) {
        student.guardians = [...(student.guardians || []), guardian._id] as any;
        await student.save();
      }
    }

    return {
      success: true,
      message: "Guardian-student relationship synced",
      data: {
        guardianProfileId: guardianProfile._id,
        studentProfileId: studentProfile._id,
      },
    };
  } catch (error: any) {
    console.error("Error syncing guardian-student relationship:", error);
    return {
      success: false,
      message: error.message || "Failed to sync relationship",
    };
  }
}
