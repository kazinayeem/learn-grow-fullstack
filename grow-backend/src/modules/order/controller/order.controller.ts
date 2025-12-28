import { Request, Response } from "express";
import { Order } from "../model/order.model";
import mongoose from "mongoose";
import {
  createOrderService,
  getUserOrdersService,
  getAllOrdersService,
  approveOrderService,
  rejectOrderService,
  getStudentEnrollmentService,
  checkCourseAccessService,
} from "../service/order.service";

// Create new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - Please login" });
    }

    // Validate required fields
    const { planType, paymentMethodId, transactionId, senderNumber, price } = req.body;
    
    if (!planType || !paymentMethodId || !transactionId || !senderNumber) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: planType, paymentMethodId, transactionId, senderNumber" 
      });
    }

    // Validate courseId for single course purchases
    if (planType === "single" && !req.body.courseId) {
      return res.status(400).json({ 
        success: false, 
        message: "courseId is required for single course purchases" 
      });
    }

    // Validate delivery address for quarterly and kit
    if ((planType === "quarterly" || planType === "kit") && !req.body.deliveryAddress) {
      return res.status(400).json({ 
        success: false, 
        message: "Delivery address is required for quarterly and kit plans" 
      });
    }

    console.log("Creating order for user:", userId, "with data:", req.body);

    const result = await createOrderService(userId, req.body);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }

    console.log("Order created successfully:", result.data?._id);

    return res.status(201).json({
      success: true,
      message: "অর্ডার সফলভাবে তৈরি হয়েছে! প্রশাসকের অনুমোদনের অপেক্ষায়। | Order created successfully! Waiting for admin approval.",
      data: result.data,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create order", 
      error: error.message 
    });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, planType } = req.query;

    const result = await getAllOrdersService({
      status: status as string,
      planType: planType as string,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      orders: result.data,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id)
      .populate("userId", "name email role phone")
      .populate("courseId", "title thumbnail instructor")
      .populate("paymentMethodId", "name accountNumber paymentNote");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error: any) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Failed to fetch order", error: error.message });
  }
};

// Get user's own orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getUserOrdersService(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({ success: true, orders: result.data, data: result.data });
  } catch (error: any) {
    console.error("Get user orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
};

// Approve order (Admin only)
export const approveOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const result = await approveOrderService(id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({ success: true, message: result.message, order: result.data, data: result.data });
  } catch (error: any) {
    console.error("Approve order error:", error);
    res.status(500).json({ success: false, message: "Failed to approve order", error: error.message });
  }
};

// Reject order (Admin only)
export const rejectOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "rejected") {
      return res.status(400).json({ message: "Order already rejected" });
    }

    order.paymentStatus = "rejected";
    order.isActive = false;
    if (reason) {
      order.paymentNote = `${order.paymentNote || ""}\n[Admin Rejection Reason: ${reason}]`;
    }

    await order.save();

    await order.populate([
      { path: "userId", select: "name email" },
      { path: "courseId", select: "title" },
    ]);

    // TODO: Send rejection email notification

    res.json({
      success: true,
      message: "Order rejected",
      order,
      data: order,
    });
  } catch (error: any) {
    console.error("Reject order error:", error);
    res.status(500).json({ success: false, message: "Failed to reject order", error: error.message });
  }
};

// Check active subscription for user
export const checkActiveSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();

    // Find active quarterly subscription
    const subscription = await Order.findOne({
      userId,
      planType: "quarterly",
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    }).sort({ endDate: -1 });

    if (subscription) {
      return res.json({
        hasActiveSubscription: true,
        subscription: {
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          daysRemaining: Math.ceil((subscription.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        },
      });
    }

    // Check if subscription expired
    const expiredSubscription = await Order.findOne({
      userId,
      planType: "quarterly",
      paymentStatus: "approved",
      endDate: { $lt: now },
    }).sort({ endDate: -1 });

    if (expiredSubscription) {
      // Auto-deactivate expired subscription
      expiredSubscription.isActive = false;
      await expiredSubscription.save();

      return res.json({
        hasActiveSubscription: false,
        expired: true,
        lastExpiredDate: expiredSubscription.endDate,
      });
    }

    res.json({
      hasActiveSubscription: false,
      expired: false,
    });
  } catch (error: any) {
    console.error("Check subscription error:", error);
    res.status(500).json({ message: "Failed to check subscription", error: error.message });
  }
};

// Get user's purchased courses (for single course plan)
export const getUserPurchasedCourses = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();

    const purchasedCourses = await Order.find({
      userId,
      planType: "single",
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    })
      .populate("courseId", "title thumbnail instructor duration")
      .select("courseId startDate endDate");

    res.json({
      courses: purchasedCourses.map(order => ({
        course: order.courseId,
        accessUntil: order.endDate,
      })),
    });
  } catch (error: any) {
    console.error("Get purchased courses error:", error);
    res.status(500).json({ message: "Failed to fetch purchased courses", error: error.message });
  }
};
