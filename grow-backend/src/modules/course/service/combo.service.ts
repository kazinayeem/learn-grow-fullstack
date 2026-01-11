import mongoose from "mongoose";
import { Combo } from "../model/combo.model";
import { Enrollment } from "../../enrollment/model/enrollment.model";
import { Order } from "../../order/model/order.model";
import { Course } from "../model/course.model";

/**
 * Calculate access end date based on duration
 */
export const calculateAccessEndDate = (
  duration: "1-month" | "2-months" | "3-months" | "lifetime"
): Date | null => {
  if (duration === "lifetime") return null;

  const now = new Date();
  const months = parseInt(duration.split("-")[0]);
  const endDate = new Date(now.setMonth(now.getMonth() + months));
  return endDate;
};

/**
 * Create a new combo
 */
export const createComboService = async (
  name: string,
  courses: string[],
  price: number,
  duration: "1-month" | "2-months" | "3-months" | "lifetime",
  adminId: string,
  description?: string,
  discountPrice?: number,
  thumbnail?: string,
  featured?: boolean
) => {
  try {
    // Validate course count
    if (courses.length === 0 || courses.length > 100) {
      return {
        success: false,
        message: "Combo must contain between 1 and 100 courses",
      };
    }

    // Validate all courses exist
    const validCourses = await Course.find({
      _id: { $in: courses.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    if (validCourses.length !== courses.length) {
      return {
        success: false,
        message: "One or more courses not found",
      };
    }

    const combo = new Combo({
      name,
      description,
      courses: courses.map((id) => new mongoose.Types.ObjectId(id)),
      price,
      discountPrice,
      duration,
      thumbnail,
      featured,
      isActive: true,
      createdBy: new mongoose.Types.ObjectId(adminId),
    });

    await combo.save();

    return {
      success: true,
      message: "Combo created successfully",
      data: combo,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to create combo",
      error: error.message,
    };
  }
};

/**
 * Get all active combos
 */
export const getActiveCombosService = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const combos = await Combo.find({ isActive: true })
      .populate("courses", "title description thumbnail price level")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Combo.countDocuments({ isActive: true });

    return {
      success: true,
      data: combos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to fetch combos",
      error: error.message,
    };
  }
};

/**
 * Get all combos (admin panel - includes inactive)
 */
export const getAllCombosService = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const combos = await Combo.find({})
      .populate("courses", "title description thumbnail price level")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Combo.countDocuments({});

    return {
      success: true,
      data: combos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to fetch combos",
      error: error.message,
    };
  }
};

/**
 * Get combo by ID
 */
export const getComboByIdService = async (comboId: string) => {
  try {
    const combo = await Combo.findById(comboId)
      .populate("courses", "title description thumbnail price level duration rating studentsEnrolled")
      .populate("createdBy", "firstName lastName email")
      .lean();

    if (!combo) {
      return {
        success: false,
        message: "Combo not found",
      };
    }

    return {
      success: true,
      data: combo,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to fetch combo",
      error: error.message,
    };
  }
};

/**
 * Update combo
 */
export const updateComboService = async (
  comboId: string,
  updates: Partial<{
    name: string;
    description: string;
    courses: string[];
    price: number;
    discountPrice: number;
    duration: "1-month" | "2-months" | "3-months" | "lifetime";
    thumbnail: string;
    isActive: boolean;
    featured: boolean;
  }>
) => {
  try {
    // Validate course count if updating courses
    if (updates.courses) {
      if (updates.courses.length === 0 || updates.courses.length > 100) {
        return {
          success: false,
          message: "Combo must contain between 1 and 100 courses",
        };
      }

      // Validate all courses exist
      const validCourses = await Course.find({
        _id: { $in: updates.courses.map((id) => new mongoose.Types.ObjectId(id)) },
      });

      if (validCourses.length !== updates.courses.length) {
        return {
          success: false,
          message: "One or more courses not found",
        };
      }

      updates.courses = updates.courses.map((id) => id) as any;
    }

    const combo = await Combo.findByIdAndUpdate(comboId, updates, {
      new: true,
      runValidators: true,
    })
      .populate("courses", "title description thumbnail price level")
      .populate("createdBy", "firstName lastName email");

    if (!combo) {
      return {
        success: false,
        message: "Combo not found",
      };
    }

    return {
      success: true,
      message: "Combo updated successfully",
      data: combo,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to update combo",
      error: error.message,
    };
  }
};

/**
 * Disable/Delete combo
 */
export const disableComboService = async (comboId: string) => {
  try {
    const combo = await Combo.findByIdAndUpdate(
      comboId,
      { isActive: false },
      { new: true }
    );

    if (!combo) {
      return {
        success: false,
        message: "Combo not found",
      };
    }

    return {
      success: true,
      message: "Combo disabled successfully",
      data: combo,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to disable combo",
      /**
       * Toggle combo active status
       */
      export const toggleComboStatusService = async (comboId: string) => {
        try {
          const combo = await Combo.findById(comboId);

          if (!combo) {
            return {
              success: false,
              message: "Combo not found",
            };
          }

          combo.isActive = !combo.isActive;
          await combo.save();

          return {
            success: true,
            message: `Combo ${combo.isActive ? "activated" : "deactivated"} successfully`,
            data: combo,
          };
        } catch (error: any) {
          return {
            success: false,
            message: "Failed to toggle combo status",
            error: error.message,
          };
        }
      };

      /**
       * Delete combo permanently
       */
      export const deleteComboService = async (comboId: string) => {
        try {
          const combo = await Combo.findByIdAndDelete(comboId);

          if (!combo) {
            return {
              success: false,
              message: "Combo not found",
            };
          }

          return {
            success: true,
            message: "Combo deleted permanently",
          };
        } catch (error: any) {
          return {
            success: false,
            message: "Failed to delete combo",
            error: error.message,
          };
        }
      };

      error: error.message,
    };
  }
};

/**
 * Enroll user in combo (create enrollments for all courses in combo)
 */
export const enrollUserInComboService = async (
  userId: string,
  comboId: string
) => {
  try {
    const combo = await Combo.findById(comboId);

    if (!combo) {
      return {
        success: false,
        message: "Combo not found",
      };
    }

    if (!combo.isActive) {
      return {
        success: false,
        message: "Combo is no longer available",
      };
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const accessEndDate = calculateAccessEndDate(combo.duration);

    // Create enrollments for each course in the combo
    const enrollments = await Promise.all(
      combo.courses.map((courseId) =>
        Enrollment.findOneAndUpdate(
          {
            studentId: userObjectId,
            courseId,
          },
          {
            studentId: userObjectId,
            courseId,
            progress: 0,
            completionPercentage: 0,
            isCompleted: false,
            accessDuration: combo.duration,
            accessStartDate: new Date(),
            accessEndDate,
            purchaseType: "combo",
            comboId: new mongoose.Types.ObjectId(comboId),
          },
          { upsert: true, new: true }
        )
      )
    );

    return {
      success: true,
      message: "User enrolled in combo successfully",
      data: {
        comboId,
        courses: combo.courses,
        enrollments,
        accessDuration: combo.duration,
        accessEndDate,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to enroll user in combo",
      error: error.message,
    };
  }
};

/**
 * Extend user access to a combo
 */
export const extendComboAccessService = async (
  userId: string,
  comboId: string,
  newDuration: "1-month" | "2-months" | "3-months" | "lifetime"
) => {
  try {
    const combo = await Combo.findById(comboId);

    if (!combo) {
      return {
        success: false,
        message: "Combo not found",
      };
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const accessEndDate = calculateAccessEndDate(newDuration);

    // Update all enrollments for this combo
    const result = await Enrollment.updateMany(
      {
        studentId: userObjectId,
        comboId: new mongoose.Types.ObjectId(comboId),
      },
      {
        accessDuration: newDuration,
        accessStartDate: new Date(),
        accessEndDate,
      }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "User has no access to this combo",
      };
    }

    return {
      success: true,
      message: "Access extended successfully",
      data: {
        userId,
        comboId,
        newDuration,
        accessEndDate,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to extend access",
      error: error.message,
    };
  }
};

/**
 * Get user's combo purchases
 */
export const getUserComboPurchasesService = async (userId: string) => {
  try {
    const comboPurchases = await Order.find({
      userId: new mongoose.Types.ObjectId(userId),
      planType: "combo",
      paymentStatus: "approved",
      isActive: true,
    })
      .populate({
        path: "comboId",
        populate: {
          path: "courses",
          select: "title description thumbnail price level",
        },
      })
      .sort({ createdAt: -1 });

    const now = new Date();
    const activeCombos = comboPurchases.filter((order) => {
      // If no endDate, it's lifetime
      if (!order.endDate) return true;
      return order.endDate > now;
    });

    return {
      success: true,
      data: activeCombos,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to fetch combo purchases",
      error: error.message,
    };
  }
};
