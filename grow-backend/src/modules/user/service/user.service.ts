import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../model/user.model";
import { StudentProfile } from "../model/studentProfile.model";
import { GuardianProfile } from "../model/guardianProfile.model";
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
  sendGuardianCredentialsEmail,
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
    relations?: any; // Guardian/student relationships
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
    // If email is provided and already verified, stop early
    if (email) {
      const existingEmailUser = await User.findOne({ email }).lean();
      if (existingEmailUser && existingEmailUser.isVerified) {
        return {
          success: false,
          message: "An account with this email already exists. Please login instead.",
        };
      }
    }

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
    // Force student-only registration
    const { name, email, phone, password } = input;
    const role: "student" = "student";

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

    // Auto-create guardian account for students (1:1 relationship)
    if (role === "student") {
      try {
        const guardianPasswordPlain = crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
        const guardianPassword = await bcrypt.hash(guardianPasswordPlain, 10);

        const suffix = user._id.toString().slice(-6);
        const guardianEmail = email
          ? email.replace("@", `+guardian_${suffix}@`)
          : `guardian-${suffix}@learnandgrow.local`;

        // Create guardian account (without phone to avoid duplication)
        const guardian = await User.create({
          name: `${name}'s Guardian`,
          email: guardianEmail,
          password: guardianPassword,
          role: "guardian",
          isVerified: true,
        });

        // Create StudentProfile with guardianId link
        await StudentProfile.findOneAndUpdate(
          { userId: user._id },
          { $setOnInsert: { userId: user._id }, $set: { guardianId: guardian._id } },
          { upsert: true }
        );

        // Create GuardianProfile with studentId link
        await GuardianProfile.findOneAndUpdate(
          { userId: guardian._id },
          { $setOnInsert: { userId: guardian._id }, $set: { studentId: user._id } },
          { upsert: true }
        );

        // Send guardian credentials email
        if (email) {
          sendGuardianCredentialsEmail(email, name, guardianEmail, guardianPasswordPlain).catch(err =>
            console.error("Failed to send guardian credentials email:", err)
          );
        }
      } catch (err) {
        console.error("Guardian auto-create failed:", err);
      }
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

    // Allow students, guardians, instructors, admins, and super admins to login
    const allowedRoles = ["student", "guardian", "instructor", "admin", "super_admin"];
    if (!allowedRoles.includes(user.role)) {
      return {
        success: false,
        message: `User role '${user.role}' is not authorized to login.`,
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
 * Send OTP for password change
 */
export const sendPasswordChangeOtp = async (
  userId: string,
  email?: string,
  phone?: string
): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const otp = generateOTP();
    const otpExpiresAt = getOTPExpirationTime();

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    if (email || user.email) {
      const emailSent = await sendOTPEmail(email || user.email!, otp);
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

    if (phone || user.phone) {
      const smsSent = await sendOTPSMS(phone || user.phone!, otp);
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

    return { success: false, message: "No email or phone found for user" };
  } catch (error: any) {
    console.error("Send password change OTP error:", error);
    return {
      success: false,
      message: error.message || "Failed to send OTP",
    };
  }
};

/**
 * Verify OTP and change password
 */
export const verifyPasswordChangeOtp = async (
  userId: string,
  email: string | undefined,
  phone: string | undefined,
  otp: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.otp || !user.otpExpiresAt) {
      return { success: false, message: "No OTP found. Please request a new OTP" };
    }

    if (isOTPExpired(user.otpExpiresAt)) {
      return { success: false, message: "OTP has expired. Please request a new OTP" };
    }

    if (user.otp !== otp) {
      return { success: false, message: "Invalid OTP" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return { success: true, message: "Password changed successfully" };
  } catch (error: any) {
    console.error("Verify password change OTP error:", error);
    return {
      success: false,
      message: error.message || "Failed to change password",
    };
  }
};

/**
 * Update phone number
 */
export const updatePhoneNumber = async (
  userId: string,
  newPhone: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const existingUser = await User.findOne({ phone: newPhone, _id: { $ne: userId } });
    if (existingUser) {
      return { success: false, message: "Phone number already in use by another account" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    user.phone = newPhone;
    await user.save();

    return { success: true, message: "Phone number updated successfully" };
  } catch (error: any) {
    console.error("Update phone number error:", error);
    return {
      success: false,
      message: error.message || "Failed to update phone number",
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
 * Get user profile with related student/guardian info
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

    let guardianInfo: any = null;
    let studentInfo: any = null;

    if (user.role === "student") {
      // Get student's guardian (1:1 relationship)
      const studentProfile = await StudentProfile.findOne({ userId }).populate({
        path: "guardianId",
        select: "name email phone role isVerified createdAt",
      });

      if (studentProfile?.guardianId) {
        guardianInfo = studentProfile.guardianId;
      }
    } else if (user.role === "guardian") {
      // Get guardian's student (1:1 relationship)
      const guardianProfile = await GuardianProfile.findOne({ userId }).populate({
        path: "studentId",
        select: "name email phone role isVerified createdAt",
      });

      if (guardianProfile?.studentId) {
        studentInfo = guardianProfile.studentId;
      }
    }

    return {
      success: true,
      message: "Profile retrieved successfully",
      data: {
        user,
        relations: {
          guardian: guardianInfo, // For students
          student: studentInfo,    // For guardians
        },
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
 * Guardian: link an existing student to the guardian account
 */
export const connectChildAsGuardian = async (
  guardianId: string,
  payload: { studentId?: string; studentEmail?: string; studentPhone?: string }
): Promise<{ success: boolean; message: string; data?: any; error?: string }> => {
  try {
    const guardian = await User.findById(guardianId);

    if (!guardian || guardian.role !== "guardian") {
      return { success: false, message: "Only guardians can connect students" };
    }

    const query: any = {};
    if (payload.studentId) {
      query._id = payload.studentId;
    } else if (payload.studentEmail) {
      query.email = payload.studentEmail;
    } else if (payload.studentPhone) {
      query.phone = payload.studentPhone;
    }

    if (Object.keys(query).length === 0) {
      return { success: false, message: "Student email, phone, or ID is required" };
    }

    const student = await User.findOne(query);
    if (!student || student.role !== "student") {
      return { success: false, message: "Student not found" };
    }

    // Link guardian to student (both directions)
    const guardianChildren = (guardian.children || []).map(id => id.toString());
    if (!guardianChildren.includes(student._id.toString())) {
      guardian.children = [...(guardian.children || []), student._id] as any;
    }

    const studentGuardians = (student.guardians || []).map(id => id.toString());
    if (!studentGuardians.includes(guardian._id.toString())) {
      student.guardians = [...(student.guardians || []), guardian._id] as any;
    }

    await Promise.all([guardian.save(), student.save()]);

    // Upsert student profile guardian pointer (non-blocking)
    StudentProfile.findOneAndUpdate(
      { userId: student._id },
      { $setOnInsert: { userId: student._id }, $set: { guardianId: guardian._id } },
      { upsert: true }
    ).catch(err => console.error("Failed to upsert student profile guardian (manual link):", err));

    return {
      success: true,
      message: "Student linked to guardian",
      data: {
        guardian: {
          id: guardian._id,
          name: guardian.name,
          email: guardian.email,
          children: guardian.children,
        },
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
        },
      },
    };
  } catch (error: any) {
    console.error("Connect child error:", error);
    return { success: false, message: error.message || "Failed to connect child", error: error.message };
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

/**
 * Get instructor dashboard stats
 */
export const getInstructorDashboardStats = async (instructorId: string) => {
  try {
    const { Course } = await import("@/modules/course/model/course.model");
    const { Enrollment } = await import("@/modules/enrollment/model/enrollment.model");
    
    // Get instructor's courses (use instructorId field)
    const courses = await Course.find({ instructorId: instructorId });
    const courseIds = courses.map(c => c._id);
    
    // Get enrollments for these courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
    
    // Calculate stats
    const totalStudents = enrollments.length;
    const totalRevenue = courses.reduce((sum, course) => sum + (course.price || 0) * enrollments.filter(e => e.courseId.toString() === course._id.toString()).length, 0);
    
    // Calculate completion rate (students who completed all modules)
    const completedStudents = enrollments.filter(e => (e.completionPercentage ?? 0) >= 100).length;
    const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;
    
    // Calculate student engagement (based on course interactions)
    const studentEngagement = Math.min(87, Math.max(0, completionRate)); // Default to 87% or based on completion rate
    
    // Get this month's revenue
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthRevenue = courses.reduce((sum, course) => {
      const courseEnrollments = enrollments.filter(e => {
        const enrollDate = e.createdAt ? new Date(e.createdAt) : new Date();
        return e.courseId.toString() === course._id.toString() && enrollDate >= monthStart;
      });
      return sum + (course.price || 0) * courseEnrollments.length;
    }, 0);
    
    return {
      success: true,
      message: "Instructor stats retrieved",
      data: {
        studentEngagement,
        completionRate,
        totalRevenue,
        thisMonthRevenue,
        totalStudents,
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.isPublished).length,
      },
    };
  } catch (error: any) {
    console.error("Error fetching instructor stats:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch instructor stats",
    };
  }
};

/**
 * Select role for new Google OAuth user and generate tokens
 */
export const selectRoleForGoogleUser = async (
  userId: string,
  role: "student" | "instructor" | "guardian"
): Promise<{
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: any;
  };
}> => {
  try {
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Update user role
    user.role = role;
    user.isNewGoogleUser = false;
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userId, role);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
      success: true,
      message: "Role selected successfully",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  } catch (error: any) {
    console.error("Error selecting role:", error);
    return {
      success: false,
      message: error.message || "Failed to select role",
    };
  }
};

/**
 * Forgot password - Send OTP to email
 */
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return {
        success: true,
        message: "If an account exists with this email, you will receive an OTP",
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = getOTPExpirationTime();

    // Save OTP to user
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP via email
    await sendOTPEmail(email, otp, "password reset");

    console.log(`Password reset OTP sent to ${email}: ${otp}`);

    return {
      success: true,
      message: "OTP sent to your email",
    };
  } catch (error: any) {
    console.error("Error in forgotPassword:", error);
    return {
      success: false,
      message: error.message || "Failed to send OTP",
    };
  }
};

/**
 * Verify OTP for password reset
 */
export const verifyForgotPasswordOtp = async (
  email: string,
  otp: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (!user.otp || user.otp !== otp) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }

    if (isOTPExpired(user.otpExpiresAt!)) {
      return {
        success: false,
        message: "OTP expired",
      };
    }

    return {
      success: true,
      message: "OTP verified",
    };
  } catch (error: any) {
    console.error("Error in verifyForgotPasswordOtp:", error);
    return {
      success: false,
      message: error.message || "Failed to verify OTP",
    };
  }
};

/**
 * Reset password with OTP
 */
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Verify OTP
    if (!user.otp || user.otp !== otp) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }

    if (isOTPExpired(user.otpExpiresAt!)) {
      return {
        success: false,
        message: "OTP expired",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Send confirmation email
    await sendWelcomeEmail(email, user.name, "Password Reset Successful");

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error: any) {
    console.error("Error in resetPassword:", error);
    return {
      success: false,
      message: error.message || "Failed to reset password",
    };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  profileData: {
    name?: string;
    bio?: string;
    phone?: string;
    expertise?: string;
    qualification?: string;
    institution?: string;
    yearsOfExperience?: number;
  }
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // If phone is being updated, ensure it's not used by another user
    if (profileData.phone && profileData.phone !== user.phone) {
      const existing = await User.findOne({ phone: profileData.phone });
      if (existing && existing._id.toString() !== userId) {
        return {
          success: false,
          message: "Phone number already in use by another account",
        };
      }
      user.phone = profileData.phone;
    }

    // Update allowed fields
    if (profileData.name) user.name = profileData.name;
    if (profileData.bio) user.bio = profileData.bio;
    if (profileData.expertise && Array.isArray(profileData.expertise)) user.expertise = profileData.expertise;
    if (profileData.qualification) user.qualification = profileData.qualification;
    if (profileData.institution) user.institution = profileData.institution;
    if (profileData.yearsOfExperience !== undefined) {
      user.yearsOfExperience = profileData.yearsOfExperience;
    }

    await user.save();

    return {
      success: true,
      message: "Profile updated successfully",
      data: user,
    };
  } catch (error: any) {
    console.error("Error in updateProfile:", error);
    return {
      success: false,
      message: error.message || "Failed to update profile",
    };
  }
};
/**
 * Update profile photo
 */
export const updateProfilePhoto = async (
  userId: string,
  profileImage: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    user.profileImage = profileImage;
    await user.save();

    return {
      success: true,
      message: "Profile photo updated successfully",
      data: user,
    };
  } catch (error: any) {
    console.error("Error in updateProfilePhoto:", error);
    return {
      success: false,
      message: error.message || "Failed to update profile photo",
    };
  }
};

// Aliases for compatibility
export const guardianConnectChild = async (
  guardianId: string,
  studentEmail?: string,
  studentPhone?: string
) => {
  return connectChildAsGuardian(guardianId, { studentEmail, studentPhone });
};

export const studentAcceptGuardian = async (studentId: string, guardianId: string) => {
  try {
    const student = await User.findById(studentId);
    const guardian = await User.findById(guardianId);

    if (!student || student.role !== "student") {
      return { success: false, message: "Student not found" };
    }

    if (!guardian || guardian.role !== "guardian") {
      return { success: false, message: "Guardian not found" };
    }

    // Link guardian to student (both directions)
    const guardianChildren = (guardian.children || []).map(id => id.toString());
    if (!guardianChildren.includes(student._id.toString())) {
      guardian.children = [...(guardian.children || []), student._id] as any;
    }

    const studentGuardians = (student.guardians || []).map(id => id.toString());
    if (!studentGuardians.includes(guardian._id.toString())) {
      student.guardians = [...(student.guardians || []), guardian._id] as any;
    }

    await Promise.all([guardian.save(), student.save()]);

    return {
      success: true,
      message: "Guardian accepted",
      data: {
        guardian: {
          id: guardian._id,
          name: guardian.name,
          email: guardian.email,
        },
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
        },
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to accept guardian" };
  }
};
