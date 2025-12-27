import bcrypt from "bcryptjs";
import { User } from "../model/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyRefreshToken,
} from "@/utils/jwt";
import {
  generateOTP,
  sendOTPEmail,
  sendOTPSMS,
  getOTPExpirationTime,
  isOTPExpired,
  sendWelcomeEmail,
  sendInstructorApprovalEmail,
} from "@/utils/otp";

interface RegisterInput {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: "student" | "instructor" | "guardian";
}

interface LoginInput {
  email?: string;
  phone?: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

/**
 * Send OTP for authentication
 */
export const sendOtp = async (
  email?: string,
  phone?: string
): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    const otp = generateOTP();
    const otpExpiresAt = getOTPExpirationTime();

    if (email) {
      await User.findOneAndUpdate(
        { email },
        { $set: { otp, otpExpiresAt }, $setOnInsert: { name: "Pending User", role: "student", isVerified: false } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const emailSent = await sendOTPEmail(email, otp);
      if (!emailSent) {
        return {
          success: false,
          message: "Failed to send OTP via email. Please try again.",
        };
      }

      return {
        success: true,
        message: "OTP sent to email successfully",
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      };
    }

    if (phone) {
      await User.findOneAndUpdate(
        { phone },
        { $set: { otp, otpExpiresAt }, $setOnInsert: { name: "Pending User", role: "student", isVerified: false } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const smsSent = await sendOTPSMS(phone, otp);
      if (!smsSent) {
        return {
          success: false,
          message: "Failed to send OTP via SMS. Please try again.",
        };
      }

      return {
        success: true,
        message: "OTP sent to phone successfully",
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      };
    }

    return {
      success: false,
      message: "Email or phone is required",
    };
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return {
      success: false,
      message: error.message || "Failed to send OTP",
    };
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (
  email?: string,
  phone?: string,
  otp?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!otp) {
      return { success: false, message: "OTP is required" };
    }

    const query = email ? { email } : phone ? { phone } : null;

    if (!query) {
      return {
        success: false,
        message: "Email or phone is required",
      };
    }

    const user = await User.findOne(query);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.otp !== otp) {
      return { success: false, message: "Invalid OTP" };
    }

    if (isOTPExpired(user.otpExpiresAt)) {
      return { success: false, message: "OTP has expired" };
    }

    // Clear OTP and mark as verified
    // Ensure required fields exist for legacy upserted records
    if (!user.name) {
      user.name = "Pending User";
    }
    if (!user.role) {
      user.role = "student" as any;
    }
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.isVerified = true;
    await user.save();

    return { success: true, message: "OTP verified successfully" };
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return {
      success: false,
      message: error.message || "Failed to verify OTP",
    };
  }
};

/**
 * Register a new user
 */
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  try {
    const { name, email, phone, password, role } = input;

    // Validate role
    const validRoles = ["student", "instructor", "guardian"];
    if (!validRoles.includes(role)) {
      return {
        success: false,
        message: "Invalid role. Must be student, instructor, or guardian",
      };
    }

    // Require at least one contact method
    if (!email && !phone) {
      return {
        success: false,
        message: "Email or phone is required",
      };
    }

    // If a user was upserted during OTP, upgrade that record instead of rejecting
    let user = null as any;
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        if (existingEmail.password) {
          return {
            success: false,
            message: "Email already registered. Please login or use another email.",
          };
        }
        user = existingEmail;
      }
    }

    if (!user && phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        if (existingPhone.password) {
          return {
            success: false,
            message: "Phone already registered. Please login or use another phone.",
          };
        }
        user = existingPhone;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or upgrade user
    if (!user) {
      user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        // isVerified set by OTP flow; default false if not verified
      });
    } else {
      // Upgrade the pending OTP user record
      user.name = user.name || name;
      user.email = user.email || email;
      user.phone = user.phone || phone;
      user.password = hashedPassword;
      user.role = role;
      await user.save();
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      role
    );

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email (don't fail registration if email fails)
    if (email) {
      sendWelcomeEmail(email, name, role).catch(err => 
        console.error('Failed to send welcome email:', err)
      );
    }

    return {
      success: true,
      message: `Registration successful as ${role}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      },
    };
  } catch (error: any) {
    console.error("Register error:", error);
    return {
      success: false,
      message: error.message || "Registration failed",
      error: error.message,
    };
  }
};

/**
 * Login user
 */
export const login = async (input: LoginInput): Promise<AuthResponse> => {
  try {
    const { email, phone, password } = input;

    // Find user
    const query = email ? { email } : phone ? { phone } : null;

    if (!query) {
      return {
        success: false,
        message: "Email or phone is required",
      };
    }

    const user = await User.findOne(query);

    if (!user) {
      return {
        success: false,
        message: "User not found. Please register first.",
      };
    }

    // Verify password
    if (!user.password) {
      return {
        success: false,
        message: "Invalid credentials. Please use Google login or reset password.",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email/phone or password",
      };
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.role
    );

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
      success: true,
      message: `Login successful as ${user.role}`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          isApproved: user.isApproved,
        },
        accessToken,
        refreshToken,
      },
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.message || "Login failed",
      error: error.message,
    };
  }
};

/**
 * Refresh Access Token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<AuthResponse> => {
  try {
    if (!refreshToken) {
      return {
        success: false,
        message: "Refresh token is required",
      };
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return {
        success: false,
        message: "Invalid or expired refresh token",
      };
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Verify refresh token matches
    if (user.refreshToken !== refreshToken) {
      return {
        success: false,
        message: "Refresh token mismatch",
      };
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id.toString(), user.role);

    return {
      success: true,
      message: "Access token refreshed",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        accessToken: newAccessToken,
        refreshToken,
      },
    };
  } catch (error: any) {
    console.error("Refresh token error:", error);
    return {
      success: false,
      message: error.message || "Failed to refresh token",
      error: error.message,
    };
  }
};

/**
 * Logout user
 */
export const logout = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    await User.findByIdAndUpdate(userId, { refreshToken: undefined });
    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error: any) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: error.message || "Logout failed",
    };
  }
};

/**
 * Change password
 */
export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.password) {
      return {
        success: false,
        message: "Cannot change password for OAuth users",
      };
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "Old password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { success: true, message: "Password changed successfully" };
  } catch (error: any) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: error.message || "Failed to change password",
    };
  }
};

/**
 * Get all instructors with their approval status
 */
export const getAllInstructors = async (): Promise<{
  success: boolean;
  message: string;
  data?: any[];
}> => {
  try {
    const instructors = await User.find({ role: "instructor" }).select(
      "-password -otp -otpExpiresAt -refreshToken -verificationToken"
    );

    return {
      success: true,
      message: "Instructors retrieved successfully",
      data: instructors,
    };
  } catch (error: any) {
    console.error("Get instructors error:", error);
    return {
      success: false,
      message: error.message || "Failed to get instructors",
    };
  }
};

/**
 * Get approved instructors (public)
 */
export const getApprovedInstructorsPublic = async (): Promise<{
  success: boolean;
  message: string;
  data?: any[];
}> => {
  try {
    const instructors = await User.find({ role: "instructor", isApproved: true }).select(
      "_id name role profileImage"
    );

    return {
      success: true,
      message: "Approved instructors retrieved successfully",
      data: instructors,
    };
  } catch (error: any) {
    console.error("Get approved instructors error:", error);
    return {
      success: false,
      message: error.message || "Failed to get approved instructors",
    };
  }
};

/**
 * Approve instructor (super admin only)
 */
export const approveInstructor = async (
  instructorId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const instructor = await User.findById(instructorId);

    if (!instructor) {
      return { success: false, message: "Instructor not found" };
    }

    if (instructor.role !== "instructor") {
      return {
        success: false,
        message: "User is not an instructor",
      };
    }

    instructor.isApproved = true;
    await instructor.save();

    // Send approval email
    if (instructor.email) {
      sendInstructorApprovalEmail(instructor.email, instructor.name, true).catch(err =>
        console.error('Failed to send approval email:', err)
      );
    }

    return {
      success: true,
      message: "Instructor approved successfully",
      data: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        isApproved: instructor.isApproved,
      },
    };
  } catch (error: any) {
    console.error("Approve instructor error:", error);
    return {
      success: false,
      message: error.message || "Failed to approve instructor",
    };
  }
};

/**
 * Reject/Unapprove instructor (super admin only)
 */
export const rejectInstructor = async (
  instructorId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const instructor = await User.findById(instructorId);

    if (!instructor) {
      return { success: false, message: "Instructor not found" };
    }

    if (instructor.role !== "instructor") {
      return {
        success: false,
        message: "User is not an instructor",
      };
    }

    instructor.isApproved = false;
    await instructor.save();

    // Send rejection/revocation email
    if (instructor.email) {
      sendInstructorApprovalEmail(instructor.email, instructor.name, false).catch(err =>
        console.error('Failed to send rejection email:', err)
      );
    }

    return {
      success: true,
      message: "Instructor approval revoked successfully",
      data: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        isApproved: instructor.isApproved,
      },
    };
  } catch (error: any) {
    console.error("Reject instructor error:", error);
    return {
      success: false,
      message: error.message || "Failed to reject instructor",
    };
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string): Promise<AuthResponse> => {
  try {
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user,
        accessToken: "",
        refreshToken: "",
      },
    };
  } catch (error: any) {
    console.error("Get profile error:", error);
    return {
      success: false,
      message: error.message || "Failed to get profile",
      error: error.message,
    };
  }
};

/**
 * Admin: List users with pagination, search, and role filter
 */
export const listUsersAdmin = async (params: { page?: number; limit?: number; search?: string; role?: string }) => {
  try {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params.role && ["admin", "instructor", "student", "guardian"].includes(params.role)) {
      filter.role = params.role;
    }
    if (params.search) {
      const q = params.search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
      ];
    }

    const [total, users, totalsByRole] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password -otp -otpExpiresAt -refreshToken -verificationToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
    ]);

    const counts: any = { totalUsers: 0, students: 0, instructors: 0, admins: 0, guardians: 0 };
    counts.totalUsers = totalsByRole.reduce((a: number, r: any) => a + r.count, 0);
    for (const r of totalsByRole) {
      if (r._id === "student") counts.students = r.count;
      if (r._id === "instructor") counts.instructors = r.count;
      if (r._id === "admin") counts.admins = r.count;
      if (r._id === "guardian") counts.guardians = r.count;
    }

    return {
      success: true,
      message: "Users retrieved",
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      counts,
    };
  } catch (error: any) {
    console.error("List users error:", error);
    return { success: false, message: error.message || "Failed to list users" };
  }
};

/** Admin: Create a user */
export const createUserAdmin = async (input: { name: string; email?: string; phone?: string; password: string; role: "student" | "instructor" | "guardian" | "admin"; }) => {
  try {
    const { name, email, phone, password, role } = input;
    if (!email && !phone) {
      return { success: false, message: "Email or phone is required" };
    }
    const existing = await User.findOne({ $or: [ email ? { email } : undefined, phone ? { phone } : undefined ].filter(Boolean) as any });
    if (existing) {
      return { success: false, message: "User with provided email/phone already exists" };
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed, role, isVerified: true });
    const safe = await User.findById(user._id).select("-password -otp -otpExpiresAt -refreshToken -verificationToken");
    return { success: true, message: "User created", data: safe };
  } catch (error: any) {
    console.error("Create user error:", error);
    return { success: false, message: error.message || "Failed to create user" };
  }
};

/** Admin: Get user by id */
export const getUserByIdAdmin = async (id: string) => {
  try {
    const user = await User.findById(id).select("-password -otp -otpExpiresAt -refreshToken -verificationToken");
    if (!user) return { success: false, message: "User not found" };
    return { success: true, message: "User retrieved", data: user };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to get user" };
  }
};

/** Admin: Update user */
export const updateUserAdmin = async (id: string, updates: Partial<{ name: string; email: string; phone: string; password: string; role: string }>) => {
  try {
    const toSet: any = {};
    if (updates.name) toSet.name = updates.name;
    if (updates.email) toSet.email = updates.email;
    if (updates.phone) toSet.phone = updates.phone;
    if (updates.password) toSet.password = await bcrypt.hash(updates.password, 10);
    const user = await User.findByIdAndUpdate(id, { $set: toSet }, { new: true });
    if (!user) return { success: false, message: "User not found" };
    const safe = await User.findById(id).select("-password -otp -otpExpiresAt -refreshToken -verificationToken");
    return { success: true, message: "User updated", data: safe };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update user" };
  }
};

/** Admin: Delete user */
export const deleteUserAdmin = async (id: string) => {
  try {
    await User.findByIdAndDelete(id);
    return { success: true, message: "User deleted" };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete user" };
  }
};

/** Admin: Update user role */
export const updateUserRoleAdmin = async (id: string, role: "student" | "instructor" | "guardian" | "admin") => {
  try {
    const user = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true });
    if (!user) return { success: false, message: "User not found" };
    const safe = await User.findById(id).select("-password -otp -otpExpiresAt -refreshToken -verificationToken");
    return { success: true, message: "Role updated", data: safe };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update user role" };
  }
};
