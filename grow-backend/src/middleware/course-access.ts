import { Request, Response, NextFunction } from "express";
import { Order } from "../modules/order/model/order.model";
import mongoose from "mongoose";

/**
 * Middleware to check if user has access to a specific course
 * User has access if:
 * 1. Has an active quarterly subscription
 * 2. Has purchased the specific single course and it's still valid
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

    // Check for active quarterly subscription (all courses access)
    const quarterlySubscription = await Order.findOne({
      userId,
      planType: "quarterly",
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    });

    if (quarterlySubscription) {
      return next(); // User has full access
    }

    // Check for single course purchase
    const singleCoursePurchase = await Order.findOne({
      userId,
      planType: "single",
      courseId: new mongoose.Types.ObjectId(courseId),
      paymentStatus: "approved",
      isActive: true,
      endDate: { $gte: now },
    });

    if (singleCoursePurchase) {
      return next(); // User has access to this specific course
    }

    // No valid access found
    return res.status(403).json({
      message: "You don't have access to this course. Please purchase a subscription or this course.",
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
 * Auto-expire expired subscriptions
 * Can be called periodically or on-demand
 */
export const expireOldSubscriptions = async () => {
  try {
    const now = new Date();

    const result = await Order.updateMany(
      {
        planType: { $in: ["quarterly", "single"] },
        paymentStatus: "approved",
        isActive: true,
        endDate: { $lt: now },
      },
      {
        $set: { isActive: false },
      }
    );

    console.log(`Expired ${result.modifiedCount} subscriptions`);
    return result.modifiedCount;
  } catch (error) {
    console.error("Expire subscriptions error:", error);
    return 0;
  }
};
