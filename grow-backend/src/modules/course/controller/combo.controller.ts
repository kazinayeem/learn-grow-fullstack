import { Request, Response } from "express";
import * as comboService from "../service/combo.service";
import { parsePagination } from "@/utils/pagination";

/**
 * Create a new combo (Admin only)
 */
export const createCombo = async (req: Request, res: Response) => {
  try {
    const { name, courses, price, duration, description, discountPrice, thumbnail, featured } = req.body;
    const adminId = req.userId;

    // Validate required fields
    if (!name || !courses || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, courses, price, duration",
      });
    }

    const result = await comboService.createComboService(
      name,
      courses,
      price,
      duration,
      adminId!,
      description,
      discountPrice,
      thumbnail,
      featured
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create combo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create combo",
      error: error.message,
    });
  }
};

/**
 * Get all active combos
 */
export const getActiveCombos = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pagination = parsePagination({ page, limit });

    const result = await comboService.getActiveCombosService(
      pagination.page,
      pagination.limit
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Get combos error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch combos",
      error: error.message,
    });
  }
};

/**
 * Get all combos (admin panel - includes inactive)
 */
export const getAllCombos = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pagination = parsePagination({ page, limit });

    const result = await comboService.getAllCombosService(
      pagination.page,
      pagination.limit
    );

    return res.json(result);
  } catch (error: any) {
    console.error("Get all combos error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch combos",
      error: error.message,
    });
  }
};

/**
 * Get combo by ID
 */
export const getComboById = async (req: Request, res: Response) => {
  try {
    const { comboId } = req.params;

    const result = await comboService.getComboByIdService(comboId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Get combo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch combo",
      error: error.message,
    });
  }
};

/**
 * Update combo (Admin only)
 */
export const updateCombo = async (req: Request, res: Response) => {
  try {
    const { comboId } = req.params;
    const updates = req.body;

    const result = await comboService.updateComboService(comboId, updates);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Update combo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update combo",
      error: error.message,
    });
  }
};

/**
 * Disable combo (Admin only)
 */
export const disableCombo = async (req: Request, res: Response) => {
  try {
    const { comboId } = req.params;

    const result = await comboService.disableComboService(comboId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Disable combo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to disable combo",
      error: error.message,
    });
  }
};

/**
 * Toggle combo active status (Admin only)
 */
export const toggleComboStatus = async (req: Request, res: Response) => {
  try {
    const { comboId } = req.params;

    const result = await comboService.toggleComboStatusService(comboId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Toggle combo status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle combo status",
      error: error.message,
    });
  }
};

/**
 * Delete combo permanently (Admin only)
 */
export const deleteCombo = async (req: Request, res: Response) => {
  try {
    const { comboId } = req.params;

    const result = await comboService.deleteComboService(comboId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Delete combo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete combo",
      error: error.message,
    });
  }
};

/**
 * Enroll user in combo (triggered after payment approval)
 */
export const enrollInCombo = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { comboId } = req.body;

    if (!comboId) {
      return res.status(400).json({
        success: false,
        message: "Missing comboId",
      });
    }

    const result = await comboService.enrollUserInComboService(userId!, comboId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Enroll in combo error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enroll in combo",
      error: error.message,
    });
  }
};

/**
 * Extend user's combo access (Admin only)
 */
export const extendComboAccess = async (req: Request, res: Response) => {
  try {
    const { userId, comboId, newDuration } = req.body;

    if (!userId || !comboId || !newDuration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, comboId, newDuration",
      });
    }

    const result = await comboService.extendComboAccessService(
      userId,
      comboId,
      newDuration
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    console.error("Extend combo access error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to extend combo access",
      error: error.message,
    });
  }
};

/**
 * Get user's combo purchases
 */
export const getUserComboPurchases = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await comboService.getUserComboPurchasesService(userId);

    return res.json(result);
  } catch (error: any) {
    console.error("Get user combo purchases error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch combo purchases",
      error: error.message,
    });
  }
};
