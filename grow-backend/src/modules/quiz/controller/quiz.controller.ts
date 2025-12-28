import { Request, Response } from "express";
import * as service from "../service/quiz.service";

export const create = async (req: Request, res: Response) => {
  try {
    const { courseId, title, description, questions, duration, passingScore, shuffleQuestions, shuffleOptions, showCorrectAnswers, totalAttempts } = req.body;
    const userId = req.userId!;

    const result = await service.createQuiz({
      courseId,
      createdBy: userId,
      title,
      description,
      questions,
      duration,
      passingScore,
      shuffleQuestions,
      shuffleOptions,
      showCorrectAnswers,
      totalAttempts,
    });

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create quiz",
    });
  }
};

export const listByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query;
    const userId = req.userId!;

    const result = await service.getQuizzes(courseId, userId, {
      status: status as string | undefined,
    });

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch quizzes",
    });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await service.getQuizById(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch quiz",
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const result = await service.updateQuiz(id, userId, req.body);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(result.message === "You don't have permission to update this quiz" ? 403 : 400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update quiz",
    });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const result = await service.deleteQuiz(id, userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(result.message === "You don't have permission to delete this quiz" ? 403 : 400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete quiz",
    });
  }
};

export const publish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId!;

    const result = await service.publishQuiz(id, userId, status);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(result.message === "You don't have permission to update this quiz" ? 403 : 400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to publish quiz",
    });
  }
};
