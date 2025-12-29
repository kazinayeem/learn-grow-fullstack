import { Types } from "mongoose";
import { Quiz, IQuiz } from "../model/quiz.model";
import { Assessment } from "@/modules/assessment/model/assessment.model";
import { User } from "@/modules/user/model/user.model";

interface CreateQuizInput {
  courseId: string;
  createdBy: string;
  assessmentType?: "quiz" | "mid-exam" | "final-exam";
  title: string;
  description?: string;
  questions: any[];
  duration: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showCorrectAnswers?: boolean;
  totalAttempts?: number;
}

export const createQuiz = async (input: CreateQuizInput) => {
  try {
    // First create the assessment
    const assessment = await Assessment.create({
      courseId: input.courseId,
      createdBy: input.createdBy,
      type: input.assessmentType || "quiz",
      title: input.title,
      description: input.description,
      questions: input.questions.length,
      status: "published",
      submissionsCount: 0,
    });

    // Calculate total points
    const totalPoints = input.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    // Create the quiz with assessment reference
    const quiz = await Quiz.create({
      assessmentId: assessment._id,
      courseId: input.courseId,
      createdBy: input.createdBy,
      assessmentType: input.assessmentType || "quiz",
      title: input.title,
      description: input.description,
      questions: input.questions.map((q, idx) => ({
        ...q,
        order: idx,
      })),
      duration: input.duration,
      passingScore: input.passingScore || 60,
      totalPoints,
      shuffleQuestions: input.shuffleQuestions || false,
      shuffleOptions: input.shuffleOptions || false,
      showCorrectAnswers: input.showCorrectAnswers !== false,
      totalAttempts: input.totalAttempts || 0,
      status: "published",
    });

    return {
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create quiz",
    };
  }
};

export const getQuizzes = async (
  courseId: string,
  userId: string,
  filters?: { status?: string }
) => {
  try {
    // Build query - convert courseId to ObjectId for proper matching
    const query: any = { courseId: new Types.ObjectId(courseId) };
    
    // Get user to check role
    const user = await User.findById(userId);
    
    // If status filter is provided, use it
    if (filters?.status) {
      query.status = filters.status;
    } else if (user && (user.role === "instructor" || user.role === "admin")) {
      // Instructor/Admin: show their own quizzes (all statuses)
      query.createdBy = new Types.ObjectId(userId);
    } else {
      // Student: only show published quizzes
      query.status = "published";
    }

    const quizzes = await Quiz.find(query).sort({ createdAt: -1 });

    return {
      success: true,
      message: "Quizzes retrieved",
      data: quizzes,
    };
  } catch (error: any) {
    console.error("Get quizzes error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch quizzes",
    };
  }
};

export const getQuizById = async (quizId: string) => {
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return {
        success: false,
        message: "Quiz not found",
      };
    }

    return {
      success: true,
      message: "Quiz retrieved",
      data: quiz,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch quiz",
    };
  }
};

export const updateQuiz = async (
  quizId: string,
  createdBy: string,
  updates: Partial<IQuiz>
) => {
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return {
        success: false,
        message: "Quiz not found",
      };
    }

    // Verify ownership
    if (quiz.createdBy.toString() !== createdBy) {
      return {
        success: false,
        message: "You don't have permission to update this quiz",
      };
    }

    // Calculate total points if questions are updated
    let totalPoints = quiz.totalPoints;
    if (updates.questions) {
      totalPoints = updates.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      updates.totalPoints = totalPoints;
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updates, { new: true });

    // Update corresponding assessment
    if (updates.title || updates.description || updates.questions) {
      await Assessment.findByIdAndUpdate(
        quiz.assessmentId,
        {
          title: updates.title || quiz.title,
          description: updates.description || quiz.description,
          questions: updates.questions?.length || quiz.questions.length,
        },
        { new: true }
      );
    }

    return {
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update quiz",
    };
  }
};

export const deleteQuiz = async (quizId: string, createdBy: string) => {
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return {
        success: false,
        message: "Quiz not found",
      };
    }

    // Verify ownership
    if (quiz.createdBy.toString() !== createdBy) {
      return {
        success: false,
        message: "You don't have permission to delete this quiz",
      };
    }

    // Delete quiz
    await Quiz.findByIdAndDelete(quizId);

    // Delete corresponding assessment
    await Assessment.findByIdAndDelete(quiz.assessmentId);

    return {
      success: true,
      message: "Quiz deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete quiz",
    };
  }
};

export const publishQuiz = async (
  quizId: string,
  createdBy: string,
  status: "published" | "draft" | "active"
) => {
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return {
        success: false,
        message: "Quiz not found",
      };
    }

    // Verify ownership
    if (quiz.createdBy.toString() !== createdBy) {
      return {
        success: false,
        message: "You don't have permission to update this quiz",
      };
    }

    // Validate quiz has questions
    if (!quiz.questions || quiz.questions.length === 0) {
      return {
        success: false,
        message: "Quiz must have at least one question",
      };
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { status },
      { new: true }
    );

    // Update assessment status
    await Assessment.findByIdAndUpdate(quiz.assessmentId, { status }, { new: true });

    return {
      success: true,
      message: `Quiz ${status} successfully`,
      data: updatedQuiz,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to publish quiz",
    };
  }
};
