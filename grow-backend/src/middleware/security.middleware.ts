import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

/**
 * Security Middleware Suite
 * Provides comprehensive protection against common attacks
 */

// 1. Helmet.js Configuration (Security Headers)
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  noSniff: true,
  xssFilter: true,
});

// 2. Rate Limiting - Global
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// 3. Rate Limiting - Authentication Endpoints (Stricter)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful attempts
});

// 4. Rate Limiting - API Endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. Prevent Parameter Pollution Attack
export const preventParamPollution = (req: Request, res: Response, next: NextFunction) => {
  // Only keep the last value for duplicate query parameters
  Object.keys(req.query).forEach(key => {
    if (Array.isArray(req.query[key])) {
      req.query[key] = (req.query[key] as string[])[
        (req.query[key] as string[]).length - 1
      ];
    }
  });
  next();
};

// 6. Request Size Limit Enforcement
export const requestSizeLimiter = {
  json: { limit: '500kb' },
  urlencoded: { limit: '500kb', extended: true },
};

// 7. Sanitize MongoDB Query Objects
export const mongoSanitize = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (data: any): any => {
    if (typeof data === 'string') {
      // Remove $ and . characters that could be used in NoSQL injection
      return data.replace(/\$/g, '').replace(/\./g, '');
    }
    if (data instanceof Object) {
      for (let key in data) {
        if (/^\$/.test(key)) {
          delete data[key];
        } else {
          data[key] = sanitize(data[key]);
        }
      }
    }
    return data;
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};

// 8. Security Headers Middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent browsers from MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // CSP (Content Security Policy)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );

  next();
};

// 9. Disable Powered-By Header
export const hidePoweredBy = (req: Request, res: Response, next: NextFunction) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
};

// 10. HTTPS Redirect (for production)
export const enforceHttps = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
  }
  next();
};

// 11. Validate Content-Type
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  // Only validate POST, PUT, PATCH requests with body
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];

    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header is required',
      });
    }

    // Allow JSON and form-urlencoded
    if (
      !contentType.includes('application/json') &&
      !contentType.includes('application/x-www-form-urlencoded')
    ) {
      return res.status(415).json({
        success: false,
        message: 'Content-Type must be application/json or application/x-www-form-urlencoded',
      });
    }
  }

  next();
};

// 12. Request Timeout
export const requestTimeout = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      res.status(408).json({
        success: false,
        message: 'Request timeout',
      });
    }, timeout);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};

// 13. Validate API Version (if applicable)
export const validateApiVersion = (req: Request, res: Response, next: NextFunction) => {
  const supportedVersions = ['v1'];
  const version = req.path.split('/')[2]; // Extract version from /api/v1/...

  if (version && !supportedVersions.includes(version)) {
    return res.status(400).json({
      success: false,
      message: `Unsupported API version. Supported versions: ${supportedVersions.join(', ')}`,
    });
  }

  next();
};

// 14. Request Logging for Security Events
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log suspicious activities
    if (
      res.statusCode >= 400 || // Error status
      duration > 5000 || // Slow requests
      req.body && Object.keys(req.body).length > 50 // Too many fields
    ) {
      console.warn('[Security Log]', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        bodyKeys: req.body ? Object.keys(req.body).length : 0,
      });
    }
  });

  next();
};

// 15. IP Whitelist/Blacklist (optional)
export const ipFilter = (whitelist?: string[], blacklist?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || '';

    if (blacklist && blacklist.includes(clientIp)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (whitelist && !whitelist.includes(clientIp) && process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    next();
  };
};

// 16. Express Async Error Handler (Wrapper for async route handlers)
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 17. CORS Preflight Caching
export const corsPreflightCache = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    res.header('Cache-Control', 'max-age=86400'); // Cache for 24 hours
  }
  next();
};
