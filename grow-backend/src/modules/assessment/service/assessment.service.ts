import { Assessment, IAssessment } from "../model/assessment.model";
import { Course } from "@/modules/course/model/course.model";

export const createAssessment = async (data: Partial<IAssessment>, userId: string) => {
  const course = await Course.findById(data.courseId);
  if (!course) throw new Error("Course not found");
  if (course.instructorId.toString() !== userId) throw new Error("Unauthorized");
  return Assessment.create({ ...data, createdBy: userId });
};

export const getAssessmentsByCourse = async (courseId: string, _userId?: string, _role?: string) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  // Publicly readable: return only published + approved course assessments
  if (!course.isPublished || !course.isAdminApproved) {
    throw new Error("Course not available");
  }

  return Assessment.find({ courseId }).sort({ createdAt: -1 }).lean();
};

export const updateAssessment = async (id: string, data: Partial<IAssessment>, userId: string, role: string) => {
  const item = await Assessment.findById(id);
  if (!item) throw new Error("Not found");
  if (role !== "admin" && item.createdBy.toString() !== userId) throw new Error("Unauthorized");
  return Assessment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteAssessment = async (id: string, userId: string, role: string) => {
  const item = await Assessment.findById(id);
  if (!item) throw new Error("Not found");
  if (role !== "admin" && item.createdBy.toString() !== userId) throw new Error("Unauthorized");
  await item.deleteOne();
  return { deleted: true };
};
