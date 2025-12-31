import { LiveClass, ILiveClass } from "../model/liveClass.model";
import { Types } from "mongoose";

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

  static async getLiveClassesByInstructor(instructorId: string) {
    return await LiveClass.find({ instructorId: new Types.ObjectId(instructorId) })
      .populate("courseId", "title")
      .sort({ scheduledAt: -1 });
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

  static async getAllLiveClasses(skip: number = 0, limit: number = 20) {
    return await LiveClass.find({ isApproved: true })
      .populate("courseId", "title")
      .populate("instructorId", "name email")
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  static async countLiveClasses() {
    return await LiveClass.countDocuments({ isApproved: true });
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
