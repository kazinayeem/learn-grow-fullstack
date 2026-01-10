import { Request, Response, NextFunction } from "express";
import { Order } from "../modules/order/model/order.model";
import { Enrollment } from "../modules/enrollment/model/enrollment.model";
import mongoose from "mongoose";
import { hasValidAccess } from "../utils/access-control";

/**
 * Middleware to check if user has access to a specific course
 * User has access if:
 * 1. Has an active quarterly subscription (deprecated but still supported)
 * 2. Has purchased the specific single course and it's still valid
 * 3. Is enrolled in the course with valid access duration
 * 4. Is enrolled in a combo that includes this course with valid access
 */
export const checkCourseAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const courseId = req.params.courseId || req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const now = new Date();
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    // 1. Check for active quarterly subscription (legacy, all courses access)
    const quarterlySubscription = await Order.findOne({
      userId: userObjectId,
      planType: "quarterly",
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    });

    if (quarterlySubscription) {
      return next(); // User has full access
    }

    // 2. Check for single course purchase (new system with endDate)
    const singleCoursePurchase = await Order.findOne({
      userId: userObjectId,
      planType: "single",
      courseId: courseObjectId,
      paymentStatus: "approved",
      isActive: true,
    });

    if (singleCoursePurchase) {
      // Check if access is still valid (handle both endDate and null for lifetime)
      if (singleCoursePurchase.endDate === null || singleCoursePurchase.endDate > now) {
        return next(); // User has access to this specific course
      }
    }

    // 3. Check enrollment with access duration
    const enrollment = await Enrollment.findOne({
      studentId: userObjectId,
      courseId: courseObjectId,
    });

    if (enrollment && hasValidAccess(enrollment.accessEndDate || null)) {
      return next(); // User has valid enrollment access
    }

    // 4. Check combo purchase that includes this course
    const comboOrder = await Order.findOne({
      userId: userObjectId,
      planType: "combo",
      paymentStatus: "approved",
      isActive: true,
    }).populate("comboId");

    if (comboOrder && (comboOrder as any).comboId) {
      const combo = (comboOrder as any).comboId;
      if (combo.courses.some((cId: any) => cId.toString() === courseId)) {
        // Check if combo access is still valid
        if (comboOrder.endDate === null || comboOrder.endDate > now) {
          return next(); // User has access via combo
        }
      }
    }

    // No valid access found
    return res.status(403).json({
      message: "You don't have access to this course. Please purchase this course or a combo that includes it.",
      needsSubscription: true,
    });
  } catch (error: any) {
    console.error("Check course access error:", error);
    return res.status(500).json({ message: "Failed to verify course access" });
  }
};

/**
 * Middleware to check if user has an active subscription
 * Used for features that require quarterly subscription only
 */
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();

    const subscription = await Order.findOne({
      userId,
      planType: "quarterly",
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    });

    if (!subscription) {
      return res.status(403).json({
        message: "Active subscription required. Please subscribe to access this feature.",
        needsSubscription: true,
      });
    }

    // Attach subscription to request for further use
    req.subscription = subscription;
    next();
  } catch (error: any) {
    console.error("Require active subscription error:", error);
    return res.status(500).json({ message: "Failed to verify subscription" });
  }
};

/**
 * Auto-expire expired subscriptions and enrollments
 * Can be called periodically or on-demand
 */
export const expireOldSubscriptions = async () => {
  try {
    const now = new Date();

    // Expire old orders
    const orderResult = await Order.updateMany(
      {
        planType: { $in: ["quarterly", "single", "combo"] },
        paymentStatus: "approved",
        isActive: true,
        endDate: { $lt: now },
        endDate: { $ne: null },
      },
      {
        $set: { isActive: false },
      }
    );

    // Expire old enrollments
    const enrollmentResult = await Enrollment.updateMany(
      {
        accessEndDate: { $lt: now },
        accessEndDate: { $ne: null },
      },
      {
        $set: { accessEndDate: now },
      }
    );

    console.log(`[Access Control] Expired ${orderResult.modifiedCount} orders and ${enrollmentResult.modifiedCount} enrollments`);
    return {
      ordersExpired: orderResult.modifiedCount,
      enrollmentsExpired: enrollmentResult.modifiedCount,
    };
  } catch (error) {
    console.error("[Access Control] Expire subscriptions error:", error);
    return { ordersExpired: 0, enrollmentsExpired: 0 };
  }
};
