import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt";
import { User } from "@/modules/user/model/user.model";

interface TokenPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to require authentication
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const cookieToken = (req as any).cookies?.accessToken as string | undefined;
    const cookieTokenHttpOnly = (req as any).cookies?.accessTokenHttpOnly as string | undefined;

    // Prefer Authorization header, fall back to either cookie name
    const token = bearerToken || cookieToken || cookieTokenHttpOnly;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authorization token provided",
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(decoded.id).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user info to request in multiple shapes for legacy handlers
    req.userId = user._id.toString();
    req.userRole = user.role;
    req.userEmail = user.email;
    (req as any).user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRoles = (
  ...roles: Array<"admin" | "manager" | "instructor" | "student" | "guardian">
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole as any)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

/**
 * Middleware to check if instructor is approved
 */
export const requireApprovedInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.userRole !== "instructor") {
      return next(); // Skip check for non-instructors
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your instructor account is pending approval by an administrator. You cannot create courses until approved.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify instructor approval status",
    });
  }
};

/**
 * Optional auth middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);

      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id).lean();
        if (user) {
          req.userId = user._id.toString();
          req.userRole = user.role;
        }
      }
    }
  } catch (error) {
    // Silently fail, this is optional auth
  }

  next();
};
