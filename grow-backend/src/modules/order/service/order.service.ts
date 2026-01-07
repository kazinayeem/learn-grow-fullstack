import { Order, IOrder } from "../model/order.model";
import { User } from "../../user/model/user.model";
import { Course } from "../../course/model/course.model";
import { PaymentMethod } from "../../payment/model/payment-method.model";
import { Enrollment } from "../../enrollment/model/enrollment.model";
import { ENV } from "@/config/env";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { getSMTPTransporter } from "@/modules/settings/service/smtp.service";

// ENROLLMENT PRICING
export const ENROLLMENT_PRICES = {
  single: 3500,      // Single Course - 3 months
  quarterly: 9999,   // All Courses - 3 months
  kit: 4500,         // Kit Only
};

const formatPrice = (amount: number) => `৳${Number(amount || 0).toLocaleString("en-US")}`;

const sendOrderEmail = async (order: any) => {
  try {
    const transporter = await getSMTPTransporter();

    const user = order.userId || {};
    const course = order.courseId || {};
    const paymentMethod = order.paymentMethodId || {};

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

    // 1) Send acknowledgement to student
    if (user.email) {
      await transporter.sendMail({
        from: ENV.EMAIL_USER,
        to: user.email,
        subject: `Order Received - ${order.planType.toUpperCase()}`,
        html: `
          <div style="max-width:640px;margin:0 auto;font-family:Arial,sans-serif;color:#111;">
            <div style="background:#10b981;padding:18px 20px;border-radius:10px 10px 0 0;color:white;">
              <h2 style="margin:0;font-size:20px;">We received your order</h2>
              <p style="margin:4px 0 0;">${new Date(order.createdAt || Date.now()).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}</p>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:0;border-radius:0 0 10px 10px;padding:20px;background:#fff;">
              <div style="line-height:1.7;">
                <div><strong>Plan:</strong> ${order.planType}</div>
                <div><strong>Amount:</strong> ${formatPrice(order.price)}</div>
                <div><strong>Transaction ID:</strong> ${order.transactionId}</div>
                ${course.title ? `<div><strong>Course:</strong> ${course.title}</div>` : ""}
              </div>
              <p style="margin:16px 0;color:#4a5568;font-size:14px;">Our admin team will verify your payment shortly.</p>
            </div>
          </div>
        `,
      });
    }

    // 2) Send admin email with approve/reject buttons (no auth, signed token)
    if (ENV.EMAIL_USER) {
      const payloadBase = { orderId: String(order._id) } as any;
      const approveToken = jwt.sign({ ...payloadBase, action: "approve" }, ENV.JWT_SECRET, { expiresIn: "2d" });
      const rejectToken = jwt.sign({ ...payloadBase, action: "reject" }, ENV.JWT_SECRET, { expiresIn: "2d" });
      const approveUrl = `${ENV.FRONTEND_URL}/api/order/email-action/${approveToken}`;
      const rejectUrl = `${ENV.FRONTEND_URL}/api/order/email-action/${rejectToken}`;

      await transporter.sendMail({
        from: ENV.EMAIL_USER,
        to: ENV.EMAIL_USER,
        subject: `Approve/Reject Order - ${user.name || "Student"}`,
        html: `
          <div style="max-width:640px;margin:0 auto;font-family:Arial,sans-serif;color:#111;">
            <div style="background:#0ea5e9;padding:18px 20px;border-radius:10px 10px 0 0;color:white;">
              <h2 style="margin:0;font-size:20px;">New Order Pending</h2>
            </div>
            <div style="border:1px solid #e2e8f0;border-top:0;border-radius:0 0 10px 10px;padding:20px;background:#fff;">
              <div style="line-height:1.7;">
                <div><strong>Student:</strong> ${user.name || ""} (${user.email || ""})</div>
                <div><strong>Plan:</strong> ${order.planType}</div>
                <div><strong>Amount:</strong> ${formatPrice(order.price)}</div>
                <div><strong>Transaction ID:</strong> ${order.transactionId}</div>
                ${paymentMethod.name ? `<div><strong>Payment Method:</strong> ${paymentMethod.name}${paymentMethod.accountNumber ? ` (${paymentMethod.accountNumber})` : ""}</div>` : ""}
                ${course.title ? `<div><strong>Course:</strong> ${course.title}</div>` : ""}
                ${deliverySection}
              </div>
              <div style="display:flex;gap:12px;margin-top:20px;">
                <a href="${approveUrl}" style="background:#10b981;color:white;padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:600">Approve</a>
                <a href="${rejectUrl}" style="background:#ef4444;color:white;padding:10px 14px;border-radius:6px;text-decoration:none;font-weight:600">Reject</a>
              </div>
              <p style="margin-top:12px;color:#64748b;font-size:12px;">These links are signed and expire in 48 hours.</p>
            </div>
          </div>
        `,
      });
    }
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
export const getUserOrdersService = async (userId: string, page = 1, limit = 6) => {
  try {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const skip = (safePage - 1) * safeLimit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: new mongoose.Types.ObjectId(userId) })
        .populate("courseId", "title thumbnail")
        .populate("paymentMethodId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
      Order.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return {
      success: true,
      data: orders,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Get all orders (admin)
 */
export const getAllOrdersService = async (filter?: { status?: string; planType?: string; userId?: string; page?: number; limit?: number }) => {
  try {
    const query: any = {};
    if (filter?.status) query.paymentStatus = filter.status;
    if (filter?.planType) query.planType = filter.planType;
    if (filter?.userId) query.userId = filter.userId;

    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate("userId", "name email phone")
      .populate("courseId", "title")
      .populate("paymentMethodId", "name accountNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    };
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

    // For quarterly plan, check if user has existing active subscription
    if (order.planType === "quarterly") {
      const existingActiveOrder = await Order.findOne({
        userId: order.userId,
        planType: "quarterly",
        paymentStatus: "approved",
        isActive: true,
        endDate: { $gt: now },
        _id: { $ne: orderId }, // Exclude current order
      }).sort({ endDate: -1 });

      if (existingActiveOrder && existingActiveOrder.endDate) {
        // Extend from existing end date
        startDate = existingActiveOrder.endDate;
        endDate = new Date(existingActiveOrder.endDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        console.log(`Extending quarterly subscription from ${existingActiveOrder.endDate} to ${endDate}`);
      } else {
        // New subscription - 3 months from now
        endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      }
    } else if (order.planType === "single") {
      // Single course - 3 months access
      endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    }
    // Kit only: no end date needed (one-time delivery)

    // Create Enrollment if not exists
    if (order.planType === "single" && order.courseId) {
      const existingEnrollment = await Enrollment.findOne({
        studentId: order.userId,
        courseId: order.courseId,
      });

      if (!existingEnrollment) {
        await Enrollment.create({
          studentId: order.userId,
          courseId: order.courseId,
          progress: 0,
          isCompleted: false,
          completedLessons: [],
          completedModules: [],
          completedAssignments: [],
          completedQuizzes: [],
          completedProjects: [],
        });
        console.log(`Enrollment created for user ${order.userId} in course ${order.courseId}`);
      }
    }

    // TODO: Handle quarterly (all access) enrollment creation strategy if needed.
    // Ideally, for all-access, we might create enrollments lazily or handle checks purely via order.
    // But currently course.service.ts relies on Enrollment doc for progress.
    // For now, we fix the single course purchase flow which is the user's immediate issue.

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

/**
 * Get enrolled students for a course (instructor view)
 */
export const getEnrolledStudentsService = async (
  courseId: string,
  instructorId: string,
  options?: { page?: number; limit?: number }
) => {
  try {
    // Verify instructor owns the course
    const course = await Course.findById(courseId);
    if (!course) {
      return { success: false, message: "Course not found" };
    }

    if (course.instructorId.toString() !== instructorId) {
      return { success: false, message: "You don't have permission to view students for this course" };
    }

    const now = new Date();
    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, Math.min(10, options?.limit || 10));
    const skip = (page - 1) * limit;

    // Use aggregation pipeline for efficient pagination and deduplication
    const studentsAggregation = await Order.aggregate([
      {
        $match: {
          paymentStatus: "approved",
          isActive: true,
          $and: [
            {
              $or: [
                { endDate: { $gt: now } },
                { endDate: null },
              ],
            },
            {
              $or: [
                {
                  courseId: new mongoose.Types.ObjectId(courseId),
                  planType: "single",
                },
                { planType: "quarterly" },
              ],
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $group: {
          _id: "$userId",
          name: { $first: "$userInfo.name" },
          email: { $first: "$userInfo.email" },
          phone: { $first: "$userInfo.phone" },
          profileImage: { $first: "$userInfo.profileImage" },
          enrolledAt: { $min: "$createdAt" },
          planType: { $first: "$planType" },
          expiresAt: { $first: "$endDate" },
          orderId: { $first: "$_id" },
        },
      },
      {
        $addFields: {
          accessType: {
            $cond: [
              { $eq: ["$planType", "quarterly"] },
              "quarterly",
              "single",
            ] as any,
          },
        },
      },
      {
        $sort: { enrolledAt: -1 },
      },
      {
        $facet: {
          metadata: [
            { $count: "totalCount" },
          ],
          students: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                phone: 1,
                profileImage: 1,
                enrolledAt: 1,
                accessType: 1,
                expiresAt: 1,
                orderId: 1,
              },
            },
          ],
        },
      },
    ]);

    const totalCount = studentsAggregation[0]?.metadata[0]?.totalCount || 0;
    const students = studentsAggregation[0]?.students || [];

    return {
      success: true,
      message: "Enrolled students retrieved",
      data: {
        students,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (error: any) {
    console.error("Get enrolled students error:", error);
    return { success: false, message: error.message || "Failed to fetch enrolled students" };
  }
};
