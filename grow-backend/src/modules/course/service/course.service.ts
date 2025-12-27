import { Course, ICourse } from "../model/course.model";
import { Module, IModule } from "../model/module.model";
import { Lesson, ILesson } from "../model/lesson.model";
import { sendCourseApprovalEmail } from "@/utils/otp";

// ===== COURSE SERVICES =====

export const createCourse = async (data: Partial<ICourse>) => {
  return Course.create(data);
};

export const getAllCourses = async (filters: any = {}) => {
  const query: any = {};
  
  if (filters.category) query.category = filters.category;
  if (filters.level) query.level = filters.level;
  if (filters.isPublished !== undefined) query.isPublished = filters.isPublished === "true";
  if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured === "true";
  if (filters.instructorId) query.instructorId = filters.instructorId;
  
  const page = Math.max(1, parseInt(filters.page || "1"));
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit || "10")));
  const skip = (page - 1) * limit;
  
  const courses = await Course.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const total = await Course.countDocuments(query);
  
  return {
    courses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPublishedCourses = async () => {
  // Only show courses that are both published AND admin approved
  return Course.find({ isPublished: true, isAdminApproved: true }).sort({ createdAt: -1 }).lean();
};

export const getFeaturedCourses = async () => {
  // Only show courses that are both published AND admin approved
  return Course.find({ isPublished: true, isFeatured: true, isAdminApproved: true }).lean();
};

export const getCourseById = async (id: string) => {
  const course = await Course.findById(id).populate("instructorId", "name email profileImage");
  
  if (!course) {
    return null;
  }

  // Fetch modules for this course
  const modules = await Module.find({ courseId: id }).sort({ orderIndex: 1 }).lean();

  // Fetch lessons for each module
  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const lessons = await Lesson.find({ moduleId: module._id }).sort({ orderIndex: 1 }).lean();
      return {
        ...module,
        id: module._id.toString(),
        lessons: lessons.map(lesson => ({
          ...lesson,
          id: lesson._id.toString(),
        })),
      };
    })
  );

  // Return course with modules
  return {
    ...course.toObject(),
    modules: modulesWithLessons,
  };
};

export const updateCourse = async (id: string, data: Partial<ICourse>) => {
  return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteCourse = (id: string) => {
  return Course.findByIdAndDelete(id);
};

export const getCoursesByInstructor = (instructorId: string) => {
  return Course.find({ instructorId }).sort({ createdAt: -1 });
};

export const getCoursesByCategory = (category: string) => {
  return Course.find({ category, isPublished: true }).sort({ createdAt: -1 });
};

// ===== MODULE SERVICES =====

export const createModule = async (data: Partial<IModule>) => {
  return Module.create(data);
};

export const getModulesByCourse = (courseId: string) => {
  return Module.find({ courseId }).sort({ orderIndex: 1 });
};

export const getModuleById = (id: string) => {
  return Module.findById(id);
};

export const updateModule = async (id: string, data: Partial<IModule>) => {
  return Module.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteModule = (id: string) => {
  return Module.findByIdAndDelete(id);
};

// ===== LESSON SERVICES =====

export const createLesson = async (data: Partial<ILesson>) => {
  return Lesson.create(data);
};

export const getLessonsByModule = (moduleId: string) => {
  return Lesson.find({ moduleId }).sort({ orderIndex: 1 });
};

export const getLessonById = (id: string) => {
  return Lesson.findById(id);
};

export const updateLesson = async (id: string, data: Partial<ILesson>) => {
  return Lesson.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteLesson = (id: string) => {
  return Lesson.findByIdAndDelete(id);
};

export const getFreeLessons = () => {
  return Lesson.find({ isFree: true }).lean();
};

// ===== COURSE PUBLISHING & APPROVAL SERVICES =====

export const publishCourse = async (courseId: string, instructorId: string) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw new Error("Course not found");
  }
  
  // Check if instructor owns the course
  if (course.instructorId.toString() !== instructorId) {
    throw new Error("Unauthorized: You don't own this course");
  }
  
  course.isPublished = true;
  await course.save();
  
  return course;
};

export const unpublishCourse = async (courseId: string, userId: string, userRole: string) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw new Error("Course not found");
  }
  
  // Allow instructor (owner) or admin to unpublish
  if (userRole !== "admin" && course.instructorId.toString() !== userId) {
    throw new Error("Unauthorized: You don't have permission to unpublish this course");
  }
  
  course.isPublished = false;
  await course.save();
  
  return course;
};

export const approveCourse = async (courseId: string) => {
  const course = await Course.findById(courseId).populate("instructorId", "name email");
  
  if (!course) {
    throw new Error("Course not found");
  }
  
  course.isAdminApproved = true;
  await course.save();

  // Send approval email to instructor
  if (course.instructorId && typeof course.instructorId === 'object' && 'email' in course.instructorId) {
    const instructor = course.instructorId as any;
    await sendCourseApprovalEmail(
      instructor.email,
      instructor.name || "Instructor",
      course.title,
      course._id.toString()
    );
  }
  
  return course;
};

export const rejectCourseApproval = async (courseId: string) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw new Error("Course not found");
  }
  
  course.isAdminApproved = false;
  await course.save();
  
  return course;
};

export const getPendingApprovalCourses = async () => {
  return Course.find({ isPublished: true, isAdminApproved: false })
    .populate("instructorId", "name email")
    .sort({ createdAt: -1 });
};
