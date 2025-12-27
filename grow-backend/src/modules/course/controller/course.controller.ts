import { Request, Response } from "express";
import * as service from "../service/course.service";
import { Course } from "../model/course.model";
import { Module } from "../model/module.model";
import { Lesson } from "../model/lesson.model";

// Helpers to enforce instructor ownership
const ensureCourseAccess = async (
  courseId: string,
  userId?: string,
  userRole?: string
) => {
  const course = await Course.findById(courseId);
  if (!course) return { status: 404, message: "Course not found" } as const;

  if (userRole === "instructor" && course.instructorId.toString() !== userId) {
    return { status: 403, message: "Forbidden" } as const;
  }

  return { status: 200, course } as const;
};

const ensureModuleAccess = async (
  moduleId: string,
  userId?: string,
  userRole?: string
) => {
  const module = await Module.findById(moduleId);
  if (!module) return { status: 404, message: "Module not found" } as const;

  const courseCheck = await ensureCourseAccess(
    module.courseId.toString(),
    userId,
    userRole
  );
  if (courseCheck.status !== 200) return courseCheck;

  return { status: 200, module } as const;
};

const ensureLessonAccess = async (
  lessonId: string,
  userId?: string,
  userRole?: string
) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return { status: 404, message: "Lesson not found" } as const;

  const moduleCheck = await ensureModuleAccess(
    lesson.moduleId.toString(),
    userId,
    userRole
  );
  if (moduleCheck.status !== 200) return moduleCheck;

  return { status: 200, lesson } as const;
};

// ===== COURSE CONTROLLERS =====

export const createCourse = async (req: Request, res: Response) => {
  try {
    // Instructors can only create courses for themselves
    if (req.userRole === "instructor") {
      req.body.instructorId = req.userId;
    }

    const course = await service.createCourse(req.body);
    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    // Instructors see only their courses when authenticated
    const filters: any = { ...req.query };
    if (req.userRole === "instructor") {
      filters.instructorId = req.userId;
    }

    const result = await service.getAllCourses(filters);

    // If admin, include full curriculum for management view
    const data =
      req.userRole === "admin"
        ? await Promise.all(
            result.courses.map(async (course: any) => {
              const modules = await Module.find({ courseId: course._id })
                .sort({ orderIndex: 1 })
                .lean();

              const modulesWithLessons = await Promise.all(
                modules.map(async (module) => {
                  const lessons = await Lesson.find({ moduleId: module._id })
                    .sort({ orderIndex: 1 })
                    .lean();

                  return {
                    ...module,
                    id: module._id.toString(),
                    lessons: lessons.map((lesson) => ({
                      ...lesson,
                      id: lesson._id.toString(),
                    })),
                  };
                })
              );

              return {
                ...course,
                modules: modulesWithLessons,
              };
            })
          )
        : await Promise.all(
            result.courses.map(async (course: any) => {
              const modules = await Module.find({ courseId: course._id })
                .select("_id")
                .lean();
              const moduleIds = modules.map((m) => m._id);
              const lessonsCount = moduleIds.length
                ? await Lesson.countDocuments({ moduleId: { $in: moduleIds } })
                : 0;

              return {
                ...course,
                modulesCount: modules.length,
                lessonsCount,
              };
            })
          );

    res.json({
      success: true,
      message: "Courses retrieved successfully",
      data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve courses",
      error: error.message,
    });
  }
};

export const getPublishedCourses = async (_: Request, res: Response) => {
  try {
    const courses = await service.getPublishedCourses();
    res.json({
      success: true,
      message: "Published courses retrieved successfully",
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve published courses",
      error: error.message,
    });
  }
};

export const getFeaturedCourses = async (_: Request, res: Response) => {
  try {
    const courses = await service.getFeaturedCourses();
    res.json({
      success: true,
      message: "Featured courses retrieved successfully",
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve featured courses",
      error: error.message,
    });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await service.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    res.json({
      success: true,
      message: "Course retrieved successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve course",
      error: error.message,
    });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const access = await ensureCourseAccess(
      req.params.id,
      req.userId,
      req.userRole
    );
    if (access.status !== 200) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    // Prevent instructors from changing instructorId
    if (req.userRole === "instructor") {
      req.body.instructorId = access.course!.instructorId;
    }

    const course = await service.updateCourse(req.params.id, req.body);

    res.json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const access = await ensureCourseAccess(
      req.params.id,
      req.userId,
      req.userRole
    );
    if (access.status !== 200) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    await service.deleteCourse(req.params.id);
    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
      error: error.message,
    });
  }
};

export const getCoursesByInstructor = async (req: Request, res: Response) => {
  try {
    const targetInstructorId =
      req.userRole === "instructor" ? req.userId! : req.params.instructorId;

    const courses = await service.getCoursesByInstructor(targetInstructorId);
    res.json({
      success: true,
      message: "Instructor courses retrieved successfully",
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};

export const getCoursesByCategory = async (req: Request, res: Response) => {
  try {
    const courses = await service.getCoursesByCategory(req.params.category);
    res.json({
      success: true,
      message: "Category courses retrieved successfully",
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve category courses",
      error: error.message,
    });
  }
};

// ===== MODULE CONTROLLERS =====

export const createModule = async (req: Request, res: Response) => {
  try {
    const courseCheck = await ensureCourseAccess(
      req.body.courseId,
      req.userId,
      req.userRole
    );
    if (courseCheck.status !== 200) {
      return res.status(courseCheck.status).json({ success: false, message: courseCheck.message });
    }

    const module = await service.createModule(req.body);
    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: module,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create module",
      error: error.message,
    });
  }
};

export const getModulesByCourse = async (req: Request, res: Response) => {
  try {
    const courseCheck = await ensureCourseAccess(
      req.params.courseId,
      req.userId,
      req.userRole
    );
    if (courseCheck.status !== 200) {
      return res.status(courseCheck.status).json({ success: false, message: courseCheck.message });
    }

    const modules = await service.getModulesByCourse(req.params.courseId);
    res.json({
      success: true,
      message: "Modules retrieved successfully",
      data: modules,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve modules",
      error: error.message,
    });
  }
};

export const getModuleById = async (req: Request, res: Response) => {
  try {
    const access = await ensureModuleAccess(
      req.params.id,
      req.userId,
      req.userRole
    );
    if (access.status !== 200) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const module = access.module;
    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }
    res.json({
      success: true,
      message: "Module retrieved successfully",
      data: module,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve module",
      error: error.message,
    });
  }
};

export const updateModule = async (req: Request, res: Response) => {
  try {
    const access = await ensureModuleAccess(
      req.params.id,
      req.userId,
      req.userRole
    );
    if (access.status !== 200) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const module = await service.updateModule(req.params.id, req.body);
    res.json({
      success: true,
      message: "Module updated successfully",
      data: module,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update module",
      error: error.message,
    });
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    const access = await ensureModuleAccess(
      req.params.id,
      req.userId,
      req.userRole
    );
    if (access.status !== 200) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    await service.deleteModule(req.params.id);
    res.json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete module",
      error: error.message,
    });
  }
};

// ===== LESSON CONTROLLERS =====

export const createLesson = async (req: Request, res: Response) => {
  try {
    const moduleCheck = await ensureModuleAccess(
      req.body.moduleId,
      req.userId,
      req.userRole
    );
    if (moduleCheck.status !== 200) {
      return res.status(moduleCheck.status).json({ success: false, message: moduleCheck.message });
    }

    const lesson = await service.createLesson(req.body);
    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      data: lesson,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create lesson",
      error: error.message,
    });
  }
};

export const getLessonsByModule = async (req: Request, res: Response) => {
  try {
    const moduleCheck = await ensureModuleAccess(
      req.params.moduleId,
      req.userId,
      req.userRole
    );
    if (moduleCheck.status !== 200) {
      return res.status(moduleCheck.status).json({ success: false, message: moduleCheck.message });
    }

    const lessons = await service.getLessonsByModule(req.params.moduleId);
    res.json({
      success: true,
      message: "Lessons retrieved successfully",
      data: lessons,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lessons",
      error: error.message,
    });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const access = await ensureLessonAccess(
      req.params.id,
      req.userId,
      req.userRole
    );
    if (access.status !== 200) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const lesson = access.lesson;
    res.json({
      success: true,
      message: "Lesson retrieved successfully",
      data: lesson,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve lesson",
      error: error.message,
    });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const access = await ensureLessonAccess(
      req.params.id,
      req.userId,
      req.userRole
    );
    if (access.status !== 200) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    const lesson = await service.updateLesson(req.params.id, req.body);
    res.json({
      success: true,
      message: "Lesson updated successfully",
      data: lesson,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update lesson",
      error: error.message,
    });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const access = await ensureLessonAccess(
      req.params.id,
      req.userId,
      req.userRole
    );
    if (access.status !== 200) {
      return res.status(access.status).json({ success: false, message: access.message });
    }

    await service.deleteLesson(req.params.id);
    res.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete lesson",
      error: error.message,
    });
  }
};

export const getFreeLessons = async (_: Request, res: Response) => {
  try {
    const lessons = await service.getFreeLessons();
    res.json({
      success: true,
      message: "Free lessons retrieved successfully",
      data: lessons,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve free lessons",
      error: error.message,
    });
  }
};

// ===== COURSE PUBLISHING & APPROVAL CONTROLLERS =====

export const publishCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await service.publishCourse(id, req.userId!);
    
    res.json({
      success: true,
      message: "Course published successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(error.message.includes("Unauthorized") ? 403 : 500).json({
      success: false,
      message: error.message || "Failed to publish course",
    });
  }
};

export const unpublishCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await service.unpublishCourse(id, req.userId!, req.userRole!);
    
    res.json({
      success: true,
      message: "Course unpublished successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(error.message.includes("Unauthorized") ? 403 : 500).json({
      success: false,
      message: error.message || "Failed to unpublish course",
    });
  }
};

export const approveCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await service.approveCourse(id);
    
    res.json({
      success: true,
      message: "Course approved successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve course",
    });
  }
};

export const rejectCourseApproval = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await service.rejectCourseApproval(id);
    
    res.json({
      success: true,
      message: "Course approval revoked successfully",
      data: course,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to revoke course approval",
    });
  }
};

export const getPendingApprovalCourses = async (_: Request, res: Response) => {
  try {
    const courses = await service.getPendingApprovalCourses();
    
    res.json({
      success: true,
      message: "Pending approval courses retrieved successfully",
      data: courses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get pending approval courses",
    });
  }
};
