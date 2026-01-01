import { Types } from "mongoose";
import { Course, ICourse } from "../model/course.model";
import { Module, IModule } from "../model/module.model";
import { Lesson, ILesson } from "../model/lesson.model";
import { Enrollment } from "../../enrollment/model/enrollment.model";
import { Assignment } from "../../assignment/model/assignment.model";
import { Quiz } from "../../quiz/model/quiz.model";
import { sendCourseApprovalEmail } from "@/utils/otp";

// ===== COURSE SERVICES =====

export const createCourse = async (data: Partial<ICourse>) => {
  return Course.create(data);
};

export const getAllCourses = async (filters: any = {}) => {
  const query: any = {};

  if (filters.category) query.category = filters.category;
  if (filters.type) query.type = filters.type;
  if (filters.level) query.level = filters.level;
  if (filters.isPublished !== undefined) query.isPublished = filters.isPublished === "true";
  if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured === "true";
  if (filters.isRegistrationOpen !== undefined) query.isRegistrationOpen = filters.isRegistrationOpen === "true";
  if (filters.instructorId) query.instructorId = filters.instructorId;

  const page = Math.max(1, parseInt(filters.page || "1"));
  const limit = Math.max(1, Math.min(100, parseInt(filters.limit || "10")));
  const skip = (page - 1) * limit;

  const courses = await Course.find(query)
    .populate("instructorId", "name email profileImage")
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
  return Course.find({ isPublished: true, isAdminApproved: true })
    .populate("instructorId", "name email profileImage")
    .sort({ createdAt: -1 })
    .lean();
};

export const getFeaturedCourses = async () => {
  // Only show courses that are both published AND admin approved, limit to 3 most recent
  return Course.find({ isPublished: true, isFeatured: true, isAdminApproved: true })
    .populate("instructorId", "name email profileImage")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
};

export const getCourseById = async (
  id: string,
  options?: { userId?: string; userRole?: string }
) => {
  const course = await Course.findById(id).populate(
    "instructorId",
    "name email profileImage phone bio role expertise experience education"
  );

  if (!course) {
    return null;
  }

  // 1. Fetch Enrollment & Progress
  let isEnrolled = false;
  let completedLessonIds: string[] = [];
  let completedModuleIds: string[] = [];

  if (options?.userId) {
    // Debug Log
    console.log(`[getCourseById] Checking enrollment. CourseId: ${id}, UserId: ${options.userId}`);

    const enrollment = await Enrollment.findOne({
      courseId: new Types.ObjectId(id),
      studentId: new Types.ObjectId(options.userId),
    }).lean();

    if (enrollment) {
      console.log(`[getCourseById] Enrollment found. ID: ${(enrollment as any)._id}`);
      isEnrolled = true;
      completedLessonIds = enrollment.completedLessons?.map(id => id.toString()) || [];
      completedModuleIds = enrollment.completedModules?.map(id => id.toString()) || [];
    } else {
      console.log(`[getCourseById] No enrollment found.`);
    }
  } else {
    console.log(`[getCourseById] No User ID provided in options.`);
  }

  const courseInstructorId =
    (course.instructorId as any)?._id?.toString?.() ??
    course.instructorId?.toString?.();

  const isPrivileged =
    options?.userRole === "admin" ||
    (options?.userRole === "instructor" &&
      courseInstructorId === options.userId);

  console.log(`[getCourseById] Privileged: ${isPrivileged}, Enrolled: ${isEnrolled}`);

  // 2. Fetch Modules & Lessons
  const modules = await Module.find({ courseId: id })
    .sort({ orderIndex: 1 })
    .lean();

  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const lessons = await Lesson.find({ moduleId: module._id })
        .sort({ orderIndex: 1 })
        .lean();

      const { resources, ...safeModule } = module as any;

      return {
        ...safeModule,
        id: module._id.toString(),
        lessons: lessons.map((lesson) => ({
          ...lesson,
          id: lesson._id.toString()
        })),
      };
    })
  );

  // 3. Process Locks: Module -> Lesson
  let previousModuleCompleted = true; // First module condition start

  const processedModules = modulesWithLessons.map((module, moduleIndex) => {
    const moduleId = module.id;

    // Module Locking Logic
    let isModuleLocked = true;
    let moduleLockReason = "";

    if (isPrivileged) {
      isModuleLocked = false;
    } else if (!options?.userId) {
      isModuleLocked = true;
      moduleLockReason = "🔒 Login to Enroll";
    } else if (!isEnrolled) {
      isModuleLocked = true;
      moduleLockReason = moduleIndex === 0 ? "🔒 Enroll to Unlock" : "🔒 Enroll & Pay to Unlock";
    } else {
      // Enrolled User
      if (moduleIndex === 0) {
        isModuleLocked = false;
      } else {
        if (previousModuleCompleted) {
          isModuleLocked = false;
        } else {
          isModuleLocked = true;
          moduleLockReason = "🔒 Complete previous module to unlock this module";
        }
      }
    }

    // Determine if THIS module is completed (for the NEXT iteration)
    const isThisModuleCompleted = completedModuleIds.includes(moduleId);

    // Lesson Locking Logic inside Module
    let previousLessonCompleted = true;

    const processedLessons = module.lessons.map((lesson: any, lessonIndex: number) => {
      let isLessonLocked = true;
      let lessonLockReason = "";

      const lessonId = lesson.id;
      const isThisLessonCompleted = completedLessonIds.includes(lessonId);

      if (isModuleLocked) {
        isLessonLocked = true;
        lessonLockReason = moduleLockReason;
      } else {
        // Module is unlocked. Check lesson sequence.
        if (lessonIndex === 0) {
          isLessonLocked = false;
        } else {
          if (previousLessonCompleted) {
            isLessonLocked = false;
          } else {
            isLessonLocked = true;
            lessonLockReason = "🔒 Complete previous lesson first";
          }
        }
      }

      // Update tracker for next lesson
      previousLessonCompleted = isThisLessonCompleted;

      const { resources: _ignored, contentUrl, ...safeLessonFields } = lesson as any;
      const resultLesson: any = {
        ...safeLessonFields,
        isLocked: isLessonLocked,
        lockReason: isLessonLocked ? lessonLockReason : undefined,
        isCompleted: isThisLessonCompleted
      };

      if (isLessonLocked && !isPrivileged) {
        delete resultLesson.contentUrl;
      }

      return resultLesson;
    });

    // Update module sequence tracker *after* processing this module
    previousModuleCompleted = isThisModuleCompleted;

    return {
      ...module,
      isLocked: isModuleLocked,
      lockReason: isModuleLocked ? moduleLockReason : undefined,
      isCompleted: isThisModuleCompleted,
      lessons: processedLessons
    };
  });

  // 4. Fetch Course Requirements (Assignments/Quizzes)
  // They unlock only if ALL modules are completed.
  const allModulesCompleted = processedModules.every(m => m.isCompleted);

  const [assignments, quizzes] = await Promise.all([
    Assignment.find({ courseId: id, status: "published" }).lean(),
    Quiz.find({ courseId: id, status: "published" }).lean()
  ]);

  // Helper to process course-level items
  const processCourseLevelItem = (item: any, type: "assignment" | "quiz") => {
    let isLocked = true;
    let reason = "";

    if (isPrivileged) {
      isLocked = false;
    } else if (!isEnrolled) {
      isLocked = true;
      reason = "🔒 Enroll to access";
    } else if (!allModulesCompleted) {
      isLocked = true;
      reason = "🔒 Complete all modules first";
    } else {
      isLocked = false;
    }
    return { ...item, isLocked, lockReason: isLocked ? reason : undefined };
  };

  const processedAssignments = assignments.map(a => processCourseLevelItem(a, "assignment"));
  const processedQuizzes = quizzes.map(q => processCourseLevelItem(q, "quiz"));

  return {
    ...course.toObject(),
    modules: processedModules,
    assignments: processedAssignments,
    quizzes: processedQuizzes,
    // Fix: isCompleted should be enrolled.isCompleted OR calc
    // But enrollment doc has isCompleted.
    // However, here we return the COURSE object, not enrollment.
    // We should ideally merge enrollment details into the course response or handle it in frontend.
    // For now, let's just return true if completed
    isCompleted: isEnrolled && allModulesCompleted && processedAssignments.every(a => !a.isLocked) && processedQuizzes.every(q => !q.isLocked)
  };
};

export const updateCourse = async (id: string, data: Partial<ICourse>) => {
  return Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteCourse = (id: string) => {
  return Course.findByIdAndDelete(id);
};

export const getCoursesByInstructor = async (instructorId: string, options?: { page?: number; limit?: number }) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const [courses, total] = await Promise.all([
    Course.find({ instructorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments({ instructorId })
  ]);

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

export const getCoursesByCategory = (category: string) => {
  return Course.find({ category, isPublished: true, isAdminApproved: true })
    .populate("instructorId", "name email profileImage")
    .sort({ createdAt: -1 });
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

export const completeLesson = async (userId: string, lessonId: string) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new Error("Lesson not found");

  const enrollment = await Enrollment.findOne({
    studentId: userId,
    courseId: lesson.moduleId ? (await Module.findById(lesson.moduleId))?.courseId : null // robust way needed
  });

  // Actually, simpler: find module first to get courseId
  const module = await Module.findById(lesson.moduleId);
  if (!module) throw new Error("Module not found");

  const enrollmentDoc = await Enrollment.findOne({
    studentId: userId,
    courseId: module.courseId
  });

  if (!enrollmentDoc) throw new Error("Enrollment not found");

  // 1. Mark Lesson Complete
  const lessonIdStr = lessonId.toString();
  const alreadyCompleted = enrollmentDoc.completedLessons.some(id => id.toString() === lessonIdStr);

  if (!alreadyCompleted) {
    enrollmentDoc.completedLessons.push(lesson._id);
  }

  // 2. Check Module Completion
  const moduleLessons = await Lesson.find({ moduleId: module._id }).select("_id");
  const allModuleLessonsCompleted = moduleLessons.every(l =>
    enrollmentDoc.completedLessons.some(cl => cl.toString() === l._id.toString())
  );

  if (allModuleLessonsCompleted) {
    const moduleIdStr = module._id.toString();
    const moduleCompleted = enrollmentDoc.completedModules.some(id => id.toString() === moduleIdStr);
    if (!moduleCompleted) {
      enrollmentDoc.completedModules.push(module._id);
    }
  }

  // 3. Update Course Progress & Completion
  // Count total lessons, assignments, and quizzes in course
  const allModules = await Module.find({ courseId: module.courseId }).select("_id");
  const allModuleIds = allModules.map(m => m._id);

  const [totalLessons, totalAssignments, totalQuizzes] = await Promise.all([
    Lesson.countDocuments({ moduleId: { $in: allModuleIds } }),
    Assignment.countDocuments({ courseId: module.courseId, status: "published" }),
    Quiz.countDocuments({ courseId: module.courseId, status: "published" })
  ]);

  if (totalLessons > 0) {
    enrollmentDoc.progress = enrollmentDoc.completedLessons.length;
    enrollmentDoc.completionPercentage = Math.round((enrollmentDoc.completedLessons.length / totalLessons) * 100);
  }

  // Check if ALL modules completed
  const allModulesCompleted = allModules.every(m =>
    enrollmentDoc.completedModules.some(cm => cm.toString() === m._id.toString())
  );

  // Check if ALL assignments and quizzes completed
  const assignmentsCompleted = enrollmentDoc.completedAssignments?.length >= totalAssignments;
  const quizzesCompleted = enrollmentDoc.completedQuizzes?.length >= totalQuizzes;

  if (allModulesCompleted && assignmentsCompleted && quizzesCompleted) {
    enrollmentDoc.isCompleted = true;
  } else {
    enrollmentDoc.isCompleted = false;
  }

  await enrollmentDoc.save();
  return enrollmentDoc;
};

export const getLessonById = async (
  id: string,
  userId?: string,
  userRole?: string
) => {
  // 1. Fetch Lesson
  const lesson = await Lesson.findById(id);
  if (!lesson) return null;

  // 2. Privilege Check
  const module = await Module.findById(lesson.moduleId);
  if (!module) return null; // Orphaned lesson?

  const course = await Course.findById(module.courseId);
  if (!course) return null;

  const courseInstructorId = course.instructorId.toString();
  const isPrivileged =
    userRole === "admin" ||
    (userRole === "instructor" && courseInstructorId === userId);

  if (isPrivileged) return lesson;

  // 3. User Checks
  if (!userId) {
    throw new Error("🔒 Login to Enroll");
  }

  // Check Enrollment
  const enrollment = await Enrollment.findOne({
    courseId: course._id,
    studentId: userId,
  });

  if (!enrollment) {
    const isFree =
      course.price === 0 ||
      (course.discountPrice !== undefined && course.discountPrice === 0);
    throw new Error(
      isFree ? "🔒 Enroll to Unlock" : "🔒 Enroll & Pay to Unlock"
    );
  }

  // 4. Calculate Global Index to check sequence
  const allModules = await Module.find({ courseId: course._id })
    .sort({ orderIndex: 1 })
    .select("_id");

  let previousLessonsCount = 0;
  let moduleFound = false;

  for (const m of allModules) {
    if (m._id.equals(module._id)) {
      // Current module: Count lessons before this one
      const lessonsBefore = await Lesson.countDocuments({
        moduleId: m._id,
        orderIndex: { $lt: lesson.orderIndex },
      });
      previousLessonsCount += lessonsBefore;
      moduleFound = true;
      break;
    } else {
      // Previous module: Count all lessons
      const count = await Lesson.countDocuments({ moduleId: m._id });
      previousLessonsCount += count;
    }
  }

  // If module not found in loop (should check), but we assume consistency.
  const currentGlobalIndex = previousLessonsCount;

  // 5. Completion Check
  if (currentGlobalIndex === 0) {
    // Lesson 1 is always unlocked for enrolled
    return lesson;
  }

  const completedCount = enrollment.progress || 0;
  if (completedCount >= currentGlobalIndex) {
    return lesson;
  } else {
    throw new Error("🔒 Complete Previous Lesson First");
  }
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

// ===== COURSE REGISTRATION CONTROLS =====

export const setRegistrationOpen = async (
  courseId: string,
  userId: string,
  userRole: string,
  isOpen: boolean
) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  // Allow owner instructor or admin
  if (userRole !== "admin" && course.instructorId.toString() !== userId) {
    throw new Error("Unauthorized: You don't have permission to update registration status");
  }

  course.isRegistrationOpen = isOpen;
  await course.save();
  return course;
};

export const setRegistrationDeadline = async (
  courseId: string,
  userId: string,
  userRole: string,
  deadline: string | null | undefined
) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  // Allow owner instructor or admin
  if (userRole !== "admin" && course.instructorId.toString() !== userId) {
    throw new Error("Unauthorized: You don't have permission to update registration deadline");
  }

  course.registrationDeadline = deadline ? new Date(deadline) : null;
  await course.save();
  return course;
};

export const adminSetRegistration = async (
  courseId: string,
  isOpen?: boolean,
  deadline?: string | null
) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  if (typeof isOpen === "boolean") {
    course.isRegistrationOpen = isOpen;
  }
  if (deadline !== undefined) {
    course.registrationDeadline = deadline ? new Date(deadline) : null;
  }
  await course.save();
  return course;
};
