import { Order, IOrder } from "../model/order.model";
import { User } from "../../user/model/user.model";
import { Course } from "../../course/model/course.model";
import { PaymentMethod } from "../../payment/model/payment-method.model";
import { ENV } from "@/config/env";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

// ENROLLMENT PRICING
export const ENROLLMENT_PRICES = {
  single: 3500,      // Single Course - 3 months
  quarterly: 9999,   // All Courses - 3 months
  kit: 4500,         // Kit Only
};

const formatPrice = (amount: number) => `৳${Number(amount || 0).toLocaleString("en-US")}`;

const sendOrderEmail = async (order: any) => {
  try {
    const transporter = nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: ENV.EMAIL_PORT === 465,
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASSWORD,
      },
    });

    const user = order.userId || {};
    const course = order.courseId || {};
    const paymentMethod = order.paymentMethodId || {};
    const recipients = [user.email, ENV.EMAIL_USER].filter(Boolean).join(",");

    if (!recipients) {
      return;
    }

    const deliverySection = order.deliveryAddress
      ? `
        <h3 style="margin:16px 0 8px;font-size:16px;">Delivery Address</h3>
        <div style="background:#f7fafc;padding:12px;border-radius:8px;line-height:1.6;">
          <div><strong>Name:</strong> ${order.deliveryAddress.name || ""}</div>
          <div><strong>Phone:</strong> ${order.deliveryAddress.phone || ""}</div>
          <div><strong>Address:</strong> ${order.deliveryAddress.fullAddress || ""}</div>
          <div><strong>City:</strong> ${order.deliveryAddress.city || ""}</div>
          <div><strong>Postal Code:</strong> ${order.deliveryAddress.postalCode || ""}</div>
        </div>
      `
      : "";

    await transporter.sendMail({
      from: ENV.EMAIL_USER,
      to: recipients,
      subject: `New Order - ${order.planType.toUpperCase()} | ${user.name || "Student"}`,
      html: `
        <div style="max-width:640px;margin:0 auto;font-family:Arial,sans-serif;color:#111;">
          <div style="background:linear-gradient(135deg,#0ea5e9,#8b5cf6);padding:18px 20px;border-radius:10px 10px 0 0;color:white;">
            <h2 style="margin:0;font-size:20px;">Order Submitted</h2>
            <p style="margin:4px 0 0;">${new Date(order.createdAt || Date.now()).toLocaleString()}</p>
          </div>
          <div style="border:1px solid #e2e8f0;border-top:0;border-radius:0 0 10px 10px;padding:20px;background:#fff;">
            <h3 style="margin:0 0 12px;font-size:18px;">Order Details</h3>
            <div style="line-height:1.7;">
              <div><strong>Plan:</strong> ${order.planType}</div>
              <div><strong>Amount:</strong> ${formatPrice(order.price)}</div>
              <div><strong>Transaction ID:</strong> ${order.transactionId}</div>
              <div><strong>Sender Number:</strong> ${order.senderNumber}</div>
              <div><strong>Payment Method:</strong> ${paymentMethod.name || ""} ${paymentMethod.accountNumber ? `(${paymentMethod.accountNumber})` : ""}</div>
              ${course.title ? `<div><strong>Course:</strong> ${course.title}</div>` : ""}
            </div>
            ${deliverySection}

            <h3 style="margin:20px 0 10px;font-size:16px;">Student</h3>
            <div style="line-height:1.7;">
              <div><strong>Name:</strong> ${user.name || ""}</div>
              <div><strong>Email:</strong> ${user.email || ""}</div>
              <div><strong>Phone:</strong> ${user.phone || "N/A"}</div>
            </div>

            <p style="margin:20px 0 0;color:#4a5568;font-size:14px;">An admin will review and approve this order. Students can check status in their dashboard; admins can review it in the admin panel.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Order email send failed:", error);
  }
};

/**
 * Create new order (checkout)
 */
export const createOrderService = async (
  userId: string,
  data: {
    planType: "single" | "quarterly" | "kit";
    courseId?: string;
    paymentMethodId: string;
    transactionId: string;
    senderNumber: string;
    price?: number;
    paymentNote?: string;
    deliveryAddress?: {
      name: string;
      phone: string;
      fullAddress: string;
      city: string;
      postalCode: string;
    };
  }
) => {
  try {
    console.log("Creating order service for user:", userId);
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found:", userId);
      return { success: false, message: "User not found" };
    }

    // Only students can purchase
    if (user.role !== "student") {
      console.error("Non-student trying to purchase:", user.role);
      return { success: false, message: "Only students can make purchases" };
    }

    const { planType, courseId, paymentMethodId, transactionId, senderNumber, paymentNote, deliveryAddress } = data;

    // Validate payment method exists and is active
    const paymentMethod = await PaymentMethod.findById(paymentMethodId);
    if (!paymentMethod) {
      console.error("Payment method not found:", paymentMethodId);
      return { success: false, message: "Payment method not found" };
    }
    if (!paymentMethod.isActive) {
      console.error("Payment method inactive:", paymentMethodId);
      return { success: false, message: "This payment method is currently inactive" };
    }

    // Validate courseId for single plan
    if (planType === "single") {
      if (!courseId) {
        return { success: false, message: "Course ID is required for single course purchase" };
      }
      const course = await Course.findById(courseId);
      if (!course) {
        console.error("Course not found:", courseId);
        return { success: false, message: "Course not found" };
      }
      console.log("Course validated:", course.title);
    }

    // Validate delivery address for quarterly and kit
    if ((planType === "quarterly" || planType === "kit")) {
      if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.fullAddress) {
        return { success: false, message: "Complete delivery address is required for this plan" };
      }
    }

    // Get price (use provided price or default from ENROLLMENT_PRICES)
    const price = data.price || ENROLLMENT_PRICES[planType];
    console.log("Order price:", price);

    // Create order with pending status
    const orderData: any = {
      userId: new mongoose.Types.ObjectId(userId),
      planType,
      paymentMethodId: new mongoose.Types.ObjectId(paymentMethodId),
      transactionId: transactionId.trim(),
      senderNumber: senderNumber.trim(),
      paymentNote,
      paymentStatus: "pending", // Admin will approve
      isActive: false,
      price,
    };

    // Add courseId for single course
    if (planType === "single" && courseId) {
      orderData.courseId = new mongoose.Types.ObjectId(courseId);
    }

    // Add delivery address for quarterly and kit
    if ((planType === "quarterly" || planType === "kit") && deliveryAddress) {
      orderData.deliveryAddress = deliveryAddress;
    }

    console.log("Creating order with data:", orderData);

    const order = await Order.create(orderData);
    const createdOrder = Array.isArray(order) ? order[0] : order;

    console.log("Order created successfully:", createdOrder._id);

    // Populate the order before returning
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate("courseId", "title thumbnail")
      .populate("paymentMethodId", "name accountNumber")
      .populate("userId", "name email");

    await sendOrderEmail(populatedOrder);

    return {
      success: true,
      message: "Order created successfully. Waiting for admin approval.",
      data: populatedOrder,
    };
  } catch (error: any) {
    console.error("Create order service error:", error);
    return { success: false, message: error.message || "Failed to create order" };
  }
};

/**
 * Get orders for a user
 */
export const getUserOrdersService = async (userId: string) => {
  try {
    const orders = await Order.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate("courseId", "title thumbnail")
      .populate("paymentMethodId", "name")
      .sort({ createdAt: -1 });

    return { success: true, data: orders };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Get all orders (admin)
 */
export const getAllOrdersService = async (filter?: { status?: string; planType?: string }) => {
  try {
    const query: any = {};
    if (filter?.status) query.paymentStatus = filter.status;
    if (filter?.planType) query.planType = filter.planType;

    const orders = await Order.find(query)
      .populate("userId", "name email phone")
      .populate("courseId", "title")
      .populate("paymentMethodId", "name")
      .sort({ createdAt: -1 });

    return { success: true, data: orders };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Approve order (admin action)
 * Sets access and subscription dates based on plan type
 */
export const approveOrderService = async (orderId: string) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, message: "Order not found" };
    }

    const now = new Date();

    // Set dates based on plan type
    let startDate = now;
    let endDate: Date | undefined;

    if (order.planType === "single" || order.planType === "quarterly") {
      // 3 months access
      endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    }
    // Kit only: no end date needed (one-time delivery)

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "approved",
        isActive: true,
        startDate,
        endDate,
      },
      { new: true }
    );

    return {
      success: true,
      message: "Order approved successfully",
      data: updatedOrder,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Reject order (admin action)
 */
export const rejectOrderService = async (orderId: string) => {
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "rejected", isActive: false },
      { new: true }
    );

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    return {
      success: true,
      message: "Order rejected",
      data: order,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Check if student has access to a course
 */
export const checkCourseAccessService = async (userId: string, courseId: string) => {
  try {
    const now = new Date();

    // Check for active orders
    const activeOrder = await Order.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      paymentStatus: "approved",
      isActive: true,
      $or: [
        { endDate: { $gt: now } }, // Subscription not expired
        { endDate: null }, // Kit only (no expiration)
      ],
    });

    if (!activeOrder) {
      return { hasAccess: false, reason: "No active order" };
    }

    // Check plan type
    if (activeOrder.planType === "quarterly") {
      // All courses access
      return { hasAccess: true, planType: "quarterly", endDate: activeOrder.endDate };
    }

    if (activeOrder.planType === "single") {
      // Only specific course
      if (activeOrder.courseId?.toString() === courseId) {
        return { hasAccess: true, planType: "single", endDate: activeOrder.endDate };
      }
      return { hasAccess: false, reason: "Different course purchased" };
    }

    if (activeOrder.planType === "kit") {
      // No course access
      return { hasAccess: false, reason: "Kit purchase does not include course access" };
    }

    return { hasAccess: false, reason: "Unknown plan type" };
  } catch (error: any) {
    return { hasAccess: false, reason: error.message };
  }
};

/**
 * Get student's active subscriptions and courses
 */
export const getStudentEnrollmentService = async (userId: string) => {
  try {
    const now = new Date();

    const activeOrders = await Order.find({
      userId: new mongoose.Types.ObjectId(userId),
      paymentStatus: "approved",
      isActive: true,
    })
      .populate("courseId", "title thumbnail price level")
      .sort({ createdAt: -1 });

    const enrollment = {
      subscriptions: [] as any[],
      courses: [] as any[],
      kitOrders: [] as any[],
    };

    for (const order of activeOrders) {
      if (order.planType === "quarterly") {
        const isExpired = order.endDate && order.endDate < now;
        enrollment.subscriptions.push({
          type: "quarterly",
          startDate: order.startDate,
          endDate: order.endDate,
          isExpired,
          allCoursesAccess: true,
        });
      } else if (order.planType === "single") {
        const isExpired = order.endDate && order.endDate < now;
        if (!isExpired) {
          enrollment.courses.push({
            courseId: order.courseId,
            course: order.courseId,
            purchasedDate: order.createdAt,
            endDate: order.endDate,
            planType: "single",
          });
        }
      } else if (order.planType === "kit") {
        enrollment.kitOrders.push({
          status: order.paymentStatus,
          deliveryAddress: order.deliveryAddress,
          purchasedDate: order.createdAt,
        });
      }
    }

    return { success: true, data: enrollment };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
