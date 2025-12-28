import { Request, Response } from "express";
import { PaymentMethod } from "../model/payment-method.model";

/**
 * Get all payment methods (Public)
 */
export const getAllPaymentMethods = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "", activeOnly = "false" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { accountNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Active filter
    if (activeOnly === "true") {
      query.isActive = true;
    }

    const [paymentMethods, total] = await Promise.all([
      PaymentMethod.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      PaymentMethod.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Payment methods retrieved successfully",
      data: paymentMethods,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get all payment methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payment methods",
    });
  }
};

/**
 * Get payment method by ID (Admin)
 */
export const getPaymentMethodById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findById(id).lean();

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment method retrieved successfully",
      data: paymentMethod,
    });
  } catch (error) {
    console.error("Get payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payment method",
    });
  }
};

/**
 * Create payment method (Admin)
 */
export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const { name, accountNumber, paymentNote, isActive } = req.body;

    // Validation
    if (!name || !accountNumber || !paymentNote) {
      return res.status(400).json({
        success: false,
        message: "Name, account number, and payment note are required",
      });
    }

    // Check if account number already exists
    const existing = await PaymentMethod.findOne({ accountNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Payment method with this account number already exists",
      });
    }

    // Get max order for ordering
    const maxOrder = await PaymentMethod.findOne().sort({ order: -1 }).lean();
    const order = maxOrder ? (maxOrder.order || 0) + 1 : 1;

    const paymentMethod = await PaymentMethod.create({
      name,
      accountNumber,
      paymentNote,
      isActive: isActive ?? true,
      order,
    });

    return res.status(201).json({
      success: true,
      message: "Payment method created successfully",
      data: paymentMethod,
    });
  } catch (error) {
    console.error("Create payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment method",
    });
  }
};

/**
 * Update payment method (Admin)
 */
export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, accountNumber, paymentNote, isActive, order } = req.body;

    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    // Check if account number is being changed and if it already exists
    if (accountNumber && accountNumber !== paymentMethod.accountNumber) {
      const existing = await PaymentMethod.findOne({ 
        accountNumber,
        _id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Payment method with this account number already exists",
        });
      }
    }

    // Update fields
    if (name) paymentMethod.name = name;
    if (accountNumber) paymentMethod.accountNumber = accountNumber;
    if (paymentNote) paymentMethod.paymentNote = paymentNote;
    if (typeof isActive === "boolean") paymentMethod.isActive = isActive;
    if (typeof order === "number") paymentMethod.order = order;

    await paymentMethod.save();

    return res.status(200).json({
      success: true,
      message: "Payment method updated successfully",
      data: paymentMethod,
    });
  } catch (error) {
    console.error("Update payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment method",
    });
  }
};

/**
 * Delete payment method (Admin)
 */
export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findByIdAndDelete(id);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete payment method",
    });
  }
};

/**
 * Toggle payment method active status (Admin)
 */
export const togglePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    paymentMethod.isActive = !paymentMethod.isActive;
    await paymentMethod.save();

    return res.status(200).json({
      success: true,
      message: `Payment method ${paymentMethod.isActive ? "activated" : "deactivated"} successfully`,
      data: paymentMethod,
    });
  } catch (error) {
    console.error("Toggle payment method error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle payment method",
    });
  }
};

/**
 * Reorder payment methods (Admin)
 */
export const reorderPaymentMethods = async (req: Request, res: Response) => {
  try {
    const { orders } = req.body; // Array of { id, order }

    if (!Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: "Orders must be an array",
      });
    }

    // Update all payment methods
    const updatePromises = orders.map(({ id, order }) =>
      PaymentMethod.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: "Payment methods reordered successfully",
    });
  } catch (error) {
    console.error("Reorder payment methods error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder payment methods",
    });
  }
};
