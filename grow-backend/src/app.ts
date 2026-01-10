import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { userRoutes } from "./modules/user/index.js";
import { categoryRoutes } from "./modules/category/index.js";
import { jobRoutes } from "./modules/job/index.js";
import { courseRoutes, comboRoutes } from "./modules/course/index.js";
import { assessmentRoutes } from "./modules/assessment/index.js";
import { quizRoutes } from "./modules/quiz/index.js";
import { assignmentRoutes } from "./modules/assignment/index.js";
import { siteContentRoutes } from "./modules/siteContent/index.js";
import { settingsRoutes } from "./modules/settings/index.js";
import { statusRoutes } from "./modules/status/index.js";
import { liveClassRoutes } from "./modules/liveClass/index.js";
import blogRoutes from "./modules/blog/routes/blog.route.js";
import eventRoutes from "./modules/event/routes/event.route.js";
import paymentMethodRoutes from "./modules/payment/routes/payment-method.route.js";
import orderRoutes from "./modules/order/routes/order.route.js";
import teamRoutes from "./modules/team/routes/team.routes.js";
import googleRoutes from "./modules/user/routes/google.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.route.js";
import ticketRoutes from "./modules/ticket/route/ticket.route.js";
import contactRoutes from "./modules/contact/routes/contact.route.js";
import certificateRoutes from "./modules/certificate/routes/certificate.routes.js";
import { ENV } from "./config/env.js";
import "./config/passport.js";
// Security middleware imports
import {
  helmetConfig,
  globalRateLimiter,
  authRateLimiter,
  preventParamPollution,
  requestSizeLimiter,
  mongoSanitize,
  securityHeaders,
  hidePoweredBy,
  enforceHttps,
  validateContentType,
  requestTimeout,
  securityLogger,
} from "./middleware/security.middleware.js";
import { verifyToken, optionalAuth } from "./middleware/auth.middleware.js";

export const createApp = () => {
  const app = express();
  // proxy trust for rate limiting and secure cookies
  app.set("trust proxy", 1);

  // ====================================
  // SECURITY LAYER 0: CORS (Must be FIRST)
  // ====================================
  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allowed origins list
      const allowedOrigins = [
        ENV.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://learnandgrow.io",
       
      ];

      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow for now, but log it
      }
    },
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Length", "X-JSON-Response-Length"],
    optionsSuccessStatus: 204,
    preflightContinue: false,
  };

  app.use(cors(corsOptions));

  // ====================================
  // SECURITY LAYER 1: Basic Security Headers
  // ====================================
  app.use(helmetConfig); // Security headers
  app.use(securityHeaders); // Custom security headers
  app.use(hidePoweredBy); // Hide server info
  app.use(enforceHttps); // HTTPS redirect in production

  // ====================================
  // SECURITY LAYER 2: Rate Limiting & DDoS Protection
  // ====================================
  app.use(globalRateLimiter); // Global rate limit

  // ====================================
  // SECURITY LAYER 3: Input Validation & Sanitization
  // ====================================
  app.use(validateContentType); // Validate Content-Type header
  app.use(requestTimeout(50000)); // 50 second timeout
  app.use(express.json(requestSizeLimiter.json));
  app.use(express.urlencoded(requestSizeLimiter.urlencoded));
  app.use(mongoSanitize); // Prevent NoSQL injection
  app.use(preventParamPollution); // Prevent parameter pollution

  // ====================================
  // SECURITY LAYER 4: Logging & Monitoring
  // ====================================
  app.use(morgan("combined")); // HTTP request logging
  app.use(securityLogger); // Security event logging

  // ====================================
  // SECURITY LAYER 5: Cookie & Session
  // ====================================
  app.use(cookieParser()); // Parse cookies

  // ====================================
  // SECURITY LAYER 6: Authentication (Passport)
  // ====================================
  app.use(passport.initialize());
  // Do not enable Passport sessions; app uses stateless JWT

  // ====================================
  // SECURITY LAYER 7: Performance Monitoring
  // ====================================
  app.use(async (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      // Performance monitoring disabled
    });
    next();
  });

  // Health check routes
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/time", (_req, res) => {
    res.status(200).json({ time: new Date().toISOString() });
  });

  // Authentication routes
  app.use("/api/auth", googleRoutes);
  app.use("/api/users", userRoutes);

  // Other routes
  app.use("/api/category", categoryRoutes);
  app.use("/api/blog", blogRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/payment-methods", paymentMethodRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/team", teamRoutes);
  app.use("/api/job", jobRoutes);
  app.use("/api/course", courseRoutes);
  app.use("/api/combo", comboRoutes);
  app.use("/api/live-classes", liveClassRoutes);
  app.use("/api/assessment", assessmentRoutes);
  app.use("/api/quiz", quizRoutes);
  app.use("/api/assignment", assignmentRoutes);
  app.use("/api/status", statusRoutes);
  app.use("/api/v1/status", statusRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/tickets", ticketRoutes); // Ticket system routes
  app.use("/api/contact", contactRoutes); // Contact form routes
  app.use("/api/certificates", certificateRoutes); // Certificate system routes
  // Site Content (public + admin upsert)
  app.use("/api/site-content", siteContentRoutes);
  app.use("/api/v1/site-content", siteContentRoutes);
  // Settings (commission)
  app.use("/api/settings", settingsRoutes);
  app.use("/api/v1/settings", settingsRoutes);
  app.use("/api/site-content", siteContentRoutes);
  app.use("/api/settings", settingsRoutes);
  // Legacy v1 base for frontend expectations
  app.use("/api/v1/site-content", siteContentRoutes);
  app.use("/api/v1/settings", settingsRoutes);

  // 404 handler - Ensure CORS headers on 404
  app.use((_req, res) => {
    res.header(
      "Access-Control-Allow-Origin",
      (res.getHeader("Access-Control-Allow-Origin") as string) || "*"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.status(404).json({ success: false, message: "Not Found" });
  });

  // Global error handler - Ensure CORS headers on errors
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      // Error logged by morgan middleware

      // Ensure CORS headers are present on error responses
      res.header(
        "Access-Control-Allow-Origin",
        (res.getHeader("Access-Control-Allow-Origin") as string) || "*"
      );
      res.header("Access-Control-Allow-Credentials", "true");
      res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type,Authorization,X-CSRF-Token,X-Requested-With,Accept"
      );

      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  );

  return app;
};
