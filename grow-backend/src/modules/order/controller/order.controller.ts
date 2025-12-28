import { Request, Response } from "express";
import { Order } from "../model/order.model";
import mongoose from "mongoose";

// Create new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      planType,
      courseId,
      paymentMethodId,
      transactionId,
      senderNumber,
      paymentNote,
      deliveryAddress,
      price,
    } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate required fields
    if (!planType || !paymentMethodId || !transactionId || !senderNumber || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate courseId for single course plan
    if (planType === "single" && !courseId) {
      return res.status(400).json({ message: "Course ID required for single course plan" });
    }

    // Validate delivery address for quarterly and kit plans
    if ((planType === "quarterly" || planType === "kit") && !deliveryAddress) {
      return res.status(400).json({ message: "Delivery address required for this plan" });
    }

    // Create order
    const order = await Order.create({
      userId,
      planType,
      courseId: planType === "single" ? courseId : undefined,
      paymentMethodId,
      transactionId,
      senderNumber,
      paymentNote,
      deliveryAddress: (planType === "quarterly" || planType === "kit") ? deliveryAddress : undefined,
      price,
      paymentStatus: "pending",
      isActive: false,
    });

    await order.populate([
      { path: "userId", select: "name email" },
      { path: "courseId", select: "title thumbnail" },
      { path: "paymentMethodId", select: "name accountNumber" },
    ]);

    res.status(201).json({
      message: "Order created successfully. Waiting for admin approval.",
      order,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, planType, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.paymentStatus = status;
    if (planType) query.planType = planType;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate("userId", "name email role")
      .populate("courseId", "title thumbnail")
      .populate("paymentMethodId", "name accountNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
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
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await Order.find({ userId })
      .populate("courseId", "title thumbnail")
      .populate("paymentMethodId", "name")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error: any) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Approve order (Admin only)
export const approveOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "approved") {
      return res.status(400).json({ message: "Order already approved" });
    }

    // Set approval date and calculate expiry for subscription
    const now = new Date();
    order.paymentStatus = "approved";
    order.isActive = true;

    if (order.planType === "quarterly") {
      order.startDate = now;
      // Add 3 months (90 days)
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 3);
      order.endDate = endDate;
    } else if (order.planType === "single") {
      order.startDate = now;
      // Add 3 months for single course access
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 3);
      order.endDate = endDate;
    }

    await order.save();

    await order.populate([
      { path: "userId", select: "name email" },
      { path: "courseId", select: "title" },
      { path: "paymentMethodId", select: "name" },
    ]);

    // TODO: Send approval email notification

    res.json({
      message: "Order approved successfully",
      order,
    });
  } catch (error: any) {
    console.error("Approve order error:", error);
    res.status(500).json({ message: "Failed to approve order", error: error.message });
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
      message: "Order rejected",
      order,
    });
  } catch (error: any) {
    console.error("Reject order error:", error);
    res.status(500).json({ message: "Failed to reject order", error: error.message });
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
