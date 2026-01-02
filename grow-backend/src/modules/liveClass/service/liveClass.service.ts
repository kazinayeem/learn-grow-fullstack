import { LiveClass, ILiveClass } from "../model/liveClass.model";
import { Types } from "mongoose";
import { Order } from "@/modules/order/model/order.model";

export class LiveClassService {
  static async createLiveClass(data: Partial<ILiveClass> & { instructorId: string; courseId: string }) {
    const liveClass = new LiveClass({
      ...data,
      instructorId: new Types.ObjectId(data.instructorId),
      courseId: new Types.ObjectId(data.courseId),
    });
    return await liveClass.save();
  }

  static async getLiveClassById(id: string) {
    return await LiveClass.findById(id)
      .populate("courseId", "title")
      .populate("instructorId", "name email");
  }

  static async getLiveClassesByInstructor(
    instructorId: string,
    options?: { page?: number; limit?: number; status?: string; platform?: string; isApproved?: boolean; search?: string }
  ) {
    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const query: any = { instructorId: new Types.ObjectId(instructorId) };

    if (options?.status) {
      query.status = options.status;
    }

    if (options?.platform) {
      query.platform = new RegExp(options.platform, "i");
    }

    if (options?.isApproved !== undefined) {
      query.isApproved = options.isApproved;
    }

    if (options?.search) {
      query.$or = [
        { title: new RegExp(options.search, "i") },
      ];
    }

    const total = await LiveClass.countDocuments(query);
    const data = await LiveClass.find(query)
      .populate("courseId", "title")
      .populate("instructorId", "name email")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getLiveClassesByCourse(courseId: string) {
    return await LiveClass.find({ courseId: new Types.ObjectId(courseId) })
      .populate("instructorId", "name email")
      .sort({ scheduledAt: -1 });
  }

  static async updateLiveClass(id: string, updates: Partial<ILiveClass>) {
    return await LiveClass.findByIdAndUpdate(id, updates, { new: true })
      .populate("courseId", "title")
      .populate("instructorId", "name email");
  }

  static async deleteLiveClass(id: string) {
    return await LiveClass.findByIdAndDelete(id);
  }

  static async getUpcomingClasses(limit: number = 10) {
    return await LiveClass.find({
      status: "Scheduled",
      scheduledAt: { $gte: new Date() },
      isApproved: true,
    })
      .populate("courseId", "title")
      .populate("instructorId", "name email")
      .sort({ scheduledAt: 1 })
      .limit(limit);
  }

  static async getAllLiveClasses(
    skip: number = 0,
    limit: number = 10,
    options?: { enrolledOnly?: boolean; studentId?: string }
  ) {
    // If not a student or enrolledOnly is false, return all classes
    if (!options?.enrolledOnly || !options?.studentId) {
      const classes = await LiveClass.find({ isApproved: true })
        .populate("courseId", "title")
        .populate("instructorId", "name email")
        .sort({ scheduledAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await LiveClass.countDocuments({ isApproved: true });
      return { classes, total };
    }

    // For students: get enrolled courses from orders
    console.log(`[getAllLiveClasses] Filtering for student: ${options.studentId}`);

    const orders = await Order.find({
      userId: new Types.ObjectId(options.studentId),
      paymentStatus: "approved",
      isActive: true,
    });

    console.log(`[getAllLiveClasses] Found ${orders.length} approved orders`);

    // Get enrolled courseIds from single purchases
    const enrolledCourseIds = orders
      .filter((order) => order.planType === "single" && order.courseId)
      .map((order) => order.courseId);

    // Check if student has quarterly subscription (access to all courses)
    const hasQuarterly = orders.some((order) => order.planType === "quarterly");

    console.log(`[getAllLiveClasses] enrolledCourseIds: ${enrolledCourseIds.length}, hasQuarterly: ${hasQuarterly}`);

    let query: any = { isApproved: true };

    // If not quarterly, filter by enrolled courses
    if (!hasQuarterly && enrolledCourseIds.length === 0) {
      // No access to any courses
      return { classes: [], total: 0 };
    }

    if (!hasQuarterly && enrolledCourseIds.length > 0) {
      // Only show classes for enrolled courses
      query.courseId = { $in: enrolledCourseIds };
    }
    // If hasQuarterly, query is just { isApproved: true } - show all classes

    const classes = await LiveClass.find(query)
      .populate("courseId", "title")
      .populate("instructorId", "name email")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveClass.countDocuments(query);

    console.log(`[getAllLiveClasses] Returning ${classes.length} classes out of ${total} total`);

    return { classes, total };
  }

  static async getPendingLiveClasses(page: number = 1, limit: number = 10, filters?: any) {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Add filters
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.platform) {
      query.platform = new RegExp(filters.platform, 'i');
    }
    if (filters?.isApproved !== undefined) {
      query.isApproved = filters.isApproved;
    }
    if (filters?.search) {
      query.$or = [
        { title: new RegExp(filters.search, 'i') },
      ];
    }

    const total = await LiveClass.countDocuments(query);
    const data = await LiveClass.find(query)
      .populate("courseId", "title")
      .populate("instructorId", "name email")
      .sort({ createdAt: -1, scheduledAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
