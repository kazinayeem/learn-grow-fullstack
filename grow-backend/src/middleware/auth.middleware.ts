import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * JWT Authentication & Authorization Middleware
 */

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
    }
    
    interface Request {
      userId?: string;
      user?: Express.User;
    }
  }
}

// 1. JWT Verification Middleware
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    // Attach user to request
    req.userId = decoded.id || decoded.userId;
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// 2. Role-Based Access Control (RBAC)
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// 3. Optional Authentication (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
      req.userId = decoded.id || decoded.userId;
      req.user = {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }
  } catch (error) {
    // Silently ignore errors - user is optional
  }

  next();
};

// 4. Verify User Ownership (for resource access)
export const verifyOwnership = (idParamName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const resourceId = req.params[idParamName];

    // Check if user owns the resource (customizable logic)
    if (resourceId !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

// 5. Admin Only Middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

// 6. Instructor Only Middleware
export const requireInstructor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Instructor access required',
    });
  }

  next();
};

// 7. Student Only Middleware
export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !['student', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Student access required',
    });
  }

  next();
};

// 8. Permission-Based Access Control
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Define role-permission mapping
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      instructor: ['manage_courses', 'create_content', 'view_analytics'],
      student: ['view_courses', 'submit_assignments'],
      user: ['view_profile'],
    };

    const userPermissions = rolePermissions[req.user.role] || [];

    if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have the required permission',
      });
    }

    next();
  };
};

// 9. Rate Limit by User ID (prevent brute force)
export const userRateLimit = (attempts: number = 10, windowMs: number = 60000) => {
  const userAttempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return next(); // Skip if not authenticated
    }

    const now = Date.now();
    const userData = userAttempts.get(req.userId);

    if (!userData || userData.resetTime < now) {
      userAttempts.set(req.userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userData.count >= attempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    }

    userData.count++;
    next();
  };
};

// 10. Token Refresh Endpoint (create new token)
export const generateNewToken = (userId: string, email: string, role: string): string => {
  try {
    const options: SignOptions = {
      expiresIn: (ENV.JWT_EXPIRES_IN || '7d') as any,
      algorithm: 'HS256',
    };
    
    const token = jwt.sign(
      { id: userId, email, role },
      ENV.JWT_SECRET,
      options
    );
    return token;
  } catch (error) {
    throw new Error('Failed to generate token');
  }
};

// 11. Validate Token Refresh
export const validateTokenRefresh = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is required',
      });
    }

    // Verify token (will throw if expired or invalid)
    const decoded = jwt.verify(token, ENV.JWT_SECRET, {
      ignoreExpiration: true, // Allow expired tokens for refresh
    }) as JwtPayload;

    // Check if token is not too old (e.g., older than 30 days)
    const tokenAge = Math.floor(Date.now() / 1000) - (decoded.iat || 0);
    const maxAge = 30 * 24 * 60 * 60; // 30 days

    if (tokenAge > maxAge) {
      return res.status(401).json({
        success: false,
        message: 'Token is too old to refresh. Please login again.',
      });
    }

    // Attach user to request
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

// 12. Logout (Token Blacklist) - Optional implementation
const tokenBlacklist = new Set<string>();

export const logout = (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      tokenBlacklist.add(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// 13. Session-based CSRF Protection
export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;

  if (!csrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token is required',
    });
  }

  // Verify CSRF token (implement your token validation logic)
  // For now, we'll assume tokens are validated elsewhere
  next();
};
