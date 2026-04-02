import { Request, Response } from "express";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/cloudinary";
import { Course } from "../model/course.model";

type RequestWithFile = Request & {
  file?: {
    buffer: Buffer;
  };
};

export const uploadCourseThumbnail = async (req: RequestWithFile, res: Response) => {
  try {
    const { courseId } = req.params;

    // Verify course ownership
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the instructor
    if (req.userRole === "instructor" && course.instructorId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You are not the instructor of this course",
      });
    }

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(
      req.file.buffer,
      `course-${courseId}-${Date.now()}`,
      "courses/thumbnails"
    );

    // Delete old thumbnail from Cloudinary if it exists
    if (course.thumbnail && course.thumbnail.includes("cloudinary")) {
      try {
        const oldPublicId = course.thumbnail.split("/").pop()?.split(".")[0];
        if (oldPublicId) {
          await deleteFromCloudinary(`courses/thumbnails/${oldPublicId}`);
        }
      } catch (error) {
        console.log("Could not delete old thumbnail:", error);
      }
    }

    // Update course with new thumbnail URL
    course.thumbnail = url;
    await course.save();

    res.json({
      success: true,
      message: "Thumbnail uploaded successfully",
      data: {
        thumbnailUrl: url,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to upload thumbnail",
      error: error.message,
    });
  }
};

export const deleteCourseThumbnail = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user is the instructor
    if (req.userRole === "instructor" && course.instructorId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Delete from Cloudinary if exists
    if (course.thumbnail && course.thumbnail.includes("cloudinary")) {
      try {
        const publicId = course.thumbnail.split("/").pop()?.split(".")[0];
        if (publicId) {
          await deleteFromCloudinary(`courses/thumbnails/${publicId}`);
        }
      } catch (error) {
        console.log("Could not delete thumbnail from Cloudinary:", error);
      }
    }

    // Remove thumbnail from course
    course.thumbnail = undefined;
    await course.save();

    res.json({
      success: true,
      message: "Thumbnail deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete thumbnail",
      error: error.message,
    });
  }
};
