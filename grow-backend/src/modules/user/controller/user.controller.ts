import { Request, Response } from "express";
import * as service from "../service/user.service";

/**
 * Send OTP for email or phone
 */
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;
    const result = await service.sendOtp(email, phone);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, phone, otp } = req.body;
    const result = await service.verifyOtp(email, phone, otp);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP",
    });
  }
};

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const result = await service.register(req.body);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const result = await service.login(req.body);

    if (result.success) {
      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", result.data?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    const result = await service.refreshAccessToken(token);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to refresh token",
    });
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await service.logout(userId);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Logout failed",
    });
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await service.getUserProfile(userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get profile",
    });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await service.changePassword(userId, oldPassword, newPassword);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
};

/**
 * Get all instructors (for admin to view and approve)
 */
export const getAllInstructors = async (req: Request, res: Response) => {
  try {
    const result = await service.getAllInstructors();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get instructors",
    });
  }
};

/**
 * Get approved instructors (public)
 */
export const getApprovedInstructorsPublic = async (_req: Request, res: Response) => {
  try {
    const result = await service.getApprovedInstructorsPublic();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get approved instructors",
    });
  }
};

/**
 * Approve instructor (super admin only)
 */
export const approveInstructor = async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;
    const result = await service.approveInstructor(instructorId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to approve instructor",
    });
  }
};

/**
 * Reject/Unapprove instructor (super admin only)
 */
export const rejectInstructor = async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;
    const result = await service.rejectInstructor(instructorId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reject instructor",
    });
  }
};

// Admin users list + CRUD
export const listUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, role } = req.query;
    const result = await service.listUsersAdmin({
      page: Number(page),
      limit: Number(limit),
      search: (search as string) || undefined,
      role: (role as string) || undefined,
    });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to list users" });
  }
};

export const createUserAdmin = async (req: Request, res: Response) => {
  const result = await service.createUserAdmin(req.body);
  return res.status(result.success ? 201 : 400).json(result);
};

export const getUserByIdAdmin = async (req: Request, res: Response) => {
  const result = await service.getUserByIdAdmin(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
};

export const updateUserAdmin = async (req: Request, res: Response) => {
  const result = await service.updateUserAdmin(req.params.id, req.body);
  return res.status(result.success ? 200 : 400).json(result);
};

export const deleteUserAdmin = async (req: Request, res: Response) => {
  const result = await service.deleteUserAdmin(req.params.id);
  return res.status(result.success ? 200 : 400).json(result);
};

export const updateUserRoleAdmin = async (req: Request, res: Response) => {
  const result = await service.updateUserRoleAdmin(req.params.id, req.body.role);
  return res.status(result.success ? 200 : 400).json(result);
};

/**
 * Get instructor dashboard stats
 */
export const getInstructorDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const result = await service.getInstructorDashboardStats(userId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch instructor stats",
    });
  }
};

/**
 * Select role for new Google OAuth user
 */
export const selectRoleForGoogleUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["student", "instructor", "guardian"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be student, instructor, or guardian",
      });
    }

    const result = await service.selectRoleForGoogleUser(userId, role);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to select role",
    });
  }
};

/**
 * Forgot password - Send OTP to email
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await service.forgotPassword(email);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process forgot password",
    });
  }
};

/**
 * Verify OTP for password reset
 */
export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await service.verifyForgotPasswordOtp(email, otp);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP",
    });
  }
};

/**
 * Reset password with OTP
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await service.resetPassword(email, otp, newPassword);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await service.updateProfile(userId, req.body);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

/**
 * Update profile photo
 */
export const updateProfilePhoto = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { profileImage } = req.body;
    const result = await service.updateProfilePhoto(userId, profileImage);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile photo",
    });
  }
};
