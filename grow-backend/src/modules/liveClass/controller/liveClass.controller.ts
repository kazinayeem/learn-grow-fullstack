import { Request, Response } from "express";
import { LiveClassService } from "../service/liveClass.service";

export const createLiveClass = async (req: Request, res: Response) => {
  try {
    const instructorId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    if (!instructorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { title, courseId, scheduledAt, duration, platform, meetingLink } = req.body;

    const liveClass = await LiveClassService.createLiveClass({
      title,
      courseId,
      scheduledAt,
      duration,
      platform,
      meetingLink,
      instructorId,
      status: "Scheduled",
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: "Live class created successfully",
      data: liveClass,
    });
  } catch (error) {
    console.error("Create live class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create live class",
      error: (error as Error).message,
    });
  }
};

export const getLiveClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClassService.getLiveClassById(id);

    if (!liveClass) {
      return res.status(404).json({ success: false, message: "Live class not found" });
    }

    res.status(200).json({
      success: true,
      data: liveClass,
    });
  } catch (error) {
    console.error("Get live class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get live class",
      error: (error as Error).message,
    });
  }
};

export const getLiveClassesByInstructor = async (req: Request, res: Response) => {
  try {
    const instructorId = (req as any).user?.id;
    if (!instructorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status ? String(req.query.status) : undefined;
    const platform = req.query.platform ? String(req.query.platform) : undefined;
    const isApproved = req.query.isApproved !== undefined ? req.query.isApproved === "true" : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const result = await LiveClassService.getLiveClassesByInstructor(instructorId, {
      page,
      limit,
      status,
      platform,
      isApproved,
      search,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get instructor classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get live classes",
      error: (error as Error).message,
    });
  }
};

export const getLiveClassesByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const classes = await LiveClassService.getLiveClassesByCourse(courseId);

    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Get course classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get live classes",
      error: (error as Error).message,
    });
  }
};

export const updateLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const instructorId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!instructorId) {
      console.error("❌ No instructorId found in request");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Check if instructor owns this class
    const liveClass = await LiveClassService.getLiveClassById(id);
    if (!liveClass) {
      console.error("❌ Live class not found:", id);
      return res.status(404).json({ success: false, message: "Live class not found" });
    }

    console.log("🔍 Authorization check:");
    console.log(`   Class instructorId: ${liveClass.instructorId.toString()}`);
    console.log(`   User instructorId: ${instructorId.toString()}`);
    console.log(`   User role: ${userRole}`);

    // Allow instructors to update their own classes, or admins/managers to update any class
    const isOwner = liveClass.instructorId.toString() === instructorId.toString();
    const isAdmin = userRole === "admin" || userRole === "manager";

    if (!isOwner && !isAdmin) {
      console.error("❌ Authorization failed - User doesn't own this class and is not an admin");
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updated = await LiveClassService.updateLiveClass(id, req.body);

    res.status(200).json({
      success: true,
      message: "Live class updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update live class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update live class",
      error: (error as Error).message,
    });
  }
};

export const deleteLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const instructorId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!instructorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Check if instructor owns this class
    const liveClass = await LiveClassService.getLiveClassById(id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: "Live class not found" });
    }

    // Allow instructors to delete their own classes, or admins/managers to delete any class
    const isOwner = liveClass.instructorId.toString() === instructorId.toString();
    const isAdmin = userRole === "admin" || userRole === "manager";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await LiveClassService.deleteLiveClass(id);

    res.status(200).json({
      success: true,
      message: "Live class deleted successfully",
    });
  } catch (error) {
    console.error("Delete live class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete live class",
      error: (error as Error).message,
    });
  }
};

export const getUpcomingClasses = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const classes = await LiveClassService.getUpcomingClasses(limit);

    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Get upcoming classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get upcoming classes",
      error: (error as Error).message,
    });
  }
};

export const getAllLiveClasses = async (req: Request, res: Response) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    console.log(`[getAllLiveClasses] userId: ${userId}, userRole: ${userRole}`);

    // For students, filter by enrolled courses only
    const enrolledOnly = userRole === "student";

    const result = await LiveClassService.getAllLiveClasses(skip, limit, {
      enrolledOnly,
      studentId: userId,
    });

    res.status(200).json({
      success: true,
      data: result.classes,
      pagination: {
        skip,
        limit,
        total: result.total,
      },
    });
  } catch (error) {
    console.error("Get all live classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get live classes",
      error: (error as Error).message,
    });
  }
};

export const approveLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClassService.getLiveClassById(id);

    if (!liveClass) {
      return res.status(404).json({ success: false, message: "Live class not found" });
    }

    const updated = await LiveClassService.updateLiveClass(id, { isApproved: true });

    res.status(200).json({
      success: true,
      message: "Live class approved successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Approve live class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve live class",
      error: (error as Error).message,
    });
  }
};

export const rejectLiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClassService.getLiveClassById(id);

    if (!liveClass) {
      return res.status(404).json({ success: false, message: "Live class not found" });
    }

    await LiveClassService.deleteLiveClass(id);

    res.status(200).json({
      success: true,
      message: "Live class rejected and deleted successfully",
    });
  } catch (error) {
    console.error("Reject live class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject live class",
      error: (error as Error).message,
    });
  }
};

export const getPendingLiveClasses = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: any = {};

    // Parse filters from query
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.platform) {
      filters.platform = req.query.platform;
    }
    if (req.query.isApproved !== undefined) {
      filters.isApproved = req.query.isApproved === 'true';
    }
    if (req.query.search) {
      filters.search = req.query.search;
    }

    const result = await LiveClassService.getPendingLiveClasses(page, limit, filters);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get pending live classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending live classes",
      error: (error as Error).message,
    });
  }
};

export const updateRecordedLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { recordedLink } = req.body;
    const instructorId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!instructorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!recordedLink) {
      return res.status(400).json({ success: false, message: "Recorded link is required" });
    }

    // Check if instructor owns this class
    const liveClass = await LiveClassService.getLiveClassById(id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: "Live class not found" });
    }

    // Allow instructors to update their own classes, or admins/managers to update any class
    const isOwner = liveClass.instructorId.toString() === instructorId.toString();
    const isAdmin = userRole === "admin" || userRole === "manager";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updated = await LiveClassService.updateLiveClass(id, { recordedLink });

    res.status(200).json({
      success: true,
      message: "Recorded link updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update recorded link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update recorded link",
      error: (error as Error).message,
    });
  }
};
