import { Types } from "mongoose";
import { Assignment, AssignmentSubmission, IAssignment } from "../model/assignment.model";
import { Assessment } from "@/modules/assessment/model/assessment.model";
import { User } from "@/modules/user/model/user.model";

interface CreateAssignmentInput {
  courseId: string;
  createdBy: string;
  assessmentType?: "assignment" | "project";
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  maxScore?: number;
  attachments?: string[];
}

export const createAssignment = async (input: CreateAssignmentInput) => {
  try {
    const assessment = await Assessment.create({
      courseId: input.courseId,
      createdBy: input.createdBy,
      type: input.assessmentType || "assignment",
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      status: "published",
      submissionsCount: 0,
    });

    const assignment = await Assignment.create({
      assessmentId: assessment._id,
      courseId: input.courseId,
      createdBy: input.createdBy,
      assessmentType: input.assessmentType || "assignment",
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      dueDate: input.dueDate,
      maxScore: input.maxScore || 100,
      attachments: input.attachments || [],
      status: "published",
      submissionsCount: 0,
    });

    return {
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create assignment",
    };
  }
};

export const getAssignments = async (
  courseId: string,
  userId: string,
  filters?: { status?: string }
) => {
  try {
    const query: any = { courseId: new Types.ObjectId(courseId) };
    
    const user = await User.findById(userId);
    
    if (filters?.status) {
      query.status = filters.status;
    } else if (user && (user.role === "instructor" || user.role === "admin")) {
      query.createdBy = new Types.ObjectId(userId);
    } else {
      query.status = "published";
    }

    const assignments = await Assignment.find(query).sort({ createdAt: -1 });

    // Count submissions for each assignment
    const assignmentsWithCounts = await Promise.all(
      assignments.map(async (assignment) => {
        const submissionCount = await AssignmentSubmission.countDocuments({
          assignmentId: assignment._id,
        });
        
        return {
          ...assignment.toObject(),
          submissionsCount: submissionCount,
        };
      })
    );

    return {
      success: true,
      message: "Assignments retrieved",
      data: assignmentsWithCounts,
    };
  } catch (error: any) {
    console.error("Get assignments error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch assignments",
    };
  }
};

export const getAssignmentById = async (assignmentId: string) => {
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return {
        success: false,
        message: "Assignment not found",
      };
    }

    return {
      success: true,
      message: "Assignment retrieved",
      data: assignment,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch assignment",
    };
  }
};

export const updateAssignment = async (
  assignmentId: string,
  createdBy: string,
  updates: Partial<IAssignment>
) => {
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return {
        success: false,
        message: "Assignment not found",
      };
    }

    if (assignment.createdBy.toString() !== createdBy) {
      return {
        success: false,
        message: "You don't have permission to update this assignment",
      };
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      updates,
      { new: true }
    );

    if (updates.title || updates.description || updates.dueDate) {
      await Assessment.findByIdAndUpdate(
        assignment.assessmentId,
        {
          title: updates.title || assignment.title,
          description: updates.description || assignment.description,
          dueDate: updates.dueDate || assignment.dueDate,
        },
        { new: true }
      );
    }

    return {
      success: true,
      message: "Assignment updated successfully",
      data: updatedAssignment,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update assignment",
    };
  }
};

export const deleteAssignment = async (assignmentId: string, createdBy: string) => {
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return {
        success: false,
        message: "Assignment not found",
      };
    }

    if (assignment.createdBy.toString() !== createdBy) {
      return {
        success: false,
        message: "You don't have permission to delete this assignment",
      };
    }

    await Assignment.findByIdAndDelete(assignmentId);
    await Assessment.findByIdAndDelete(assignment.assessmentId);
    await AssignmentSubmission.deleteMany({ assignmentId });

    return {
      success: true,
      message: "Assignment deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete assignment",
    };
  }
};

export const submitAssignment = async (
  assignmentId: string,
  studentId: string,
  submissionLink: string
) => {
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return {
        success: false,
        message: "Assignment not found",
      };
    }

    const existingSubmission = await AssignmentSubmission.findOne({
      assignmentId,
      studentId,
    });

    if (existingSubmission) {
      existingSubmission.submissionLink = submissionLink;
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = "submitted";
      await existingSubmission.save();

      return {
        success: true,
        message: "Assignment resubmitted successfully",
        data: existingSubmission,
      };
    }

    const submission = await AssignmentSubmission.create({
      assignmentId,
      studentId,
      submissionLink,
      status: "submitted",
    });

    await Assignment.findByIdAndUpdate(assignmentId, {
      $inc: { submissionsCount: 1 },
    });

    await Assessment.findByIdAndUpdate(assignment.assessmentId, {
      $inc: { submissionsCount: 1 },
    });

    return {
      success: true,
      message: "Assignment submitted successfully",
      data: submission,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to submit assignment",
    };
  }
};

export const getAssignmentSubmissions = async (
  assignmentId: string,
  instructorId: string
) => {
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return {
        success: false,
        message: "Assignment not found",
      };
    }

    if (assignment.createdBy.toString() !== instructorId) {
      return {
        success: false,
        message: "You don't have permission to view submissions",
      };
    }

    const submissions = await AssignmentSubmission.find({ assignmentId })
      .populate("studentId", "name email profileImage")
      .sort({ submittedAt: -1 });

    return {
      success: true,
      message: "Submissions retrieved",
      data: submissions,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch submissions",
    };
  }
};

export const getMySubmission = async (assignmentId: string, studentId: string) => {
  try {
    const submission = await AssignmentSubmission.findOne({
      assignmentId,
      studentId,
    });

    return {
      success: true,
      message: submission ? "Submission found" : "No submission yet",
      data: submission,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch submission",
    };
  }
};

export const gradeSubmission = async (
  submissionId: string,
  instructorId: string,
  score: number,
  feedback?: string
) => {
  try {
    const submission = await AssignmentSubmission.findById(submissionId).populate("assignmentId");
    if (!submission) {
      return {
        success: false,
        message: "Submission not found",
      };
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return {
        success: false,
        message: "Assignment not found",
      };
    }

    if (assignment.createdBy.toString() !== instructorId) {
      return {
        success: false,
        message: "You don't have permission to grade this submission",
      };
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = "graded";
    await submission.save();

    return {
      success: true,
      message: "Submission graded successfully",
      data: submission,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to grade submission",
    };
  }
};
