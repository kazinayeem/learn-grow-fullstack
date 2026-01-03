import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import { userRoutes } from "./modules/user/index.js";
import { categoryRoutes } from "./modules/category/index.js";
import { jobRoutes } from "./modules/job/index.js";
import { courseRoutes } from "./modules/course/index.js";
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
import { ENV } from "./config/env.js";
import "./config/passport.js";

export const createApp = () => {
  const app = express();

  // CORS configuration - allow production IPs
  app.use(
    cors({
      origin: [
        ENV.FRONTEND_URL, 
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://174.129.111.162:3000", // Production frontend
        "http://174.129.111.162:3001",
        "http://174.129.111.162:3002"
      ],
      credentials: true,
    })
  );

  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());

  // Passport configuration
  app.use(passport.initialize());
  // Do not enable Passport sessions; app uses stateless JWT

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
  app.use("/api/live-classes", liveClassRoutes);
  app.use("/api/assessment", assessmentRoutes);
  app.use("/api/quiz", quizRoutes);
  app.use("/api/assignment", assignmentRoutes);
  app.use("/api/status", statusRoutes);
  app.use("/api/v1/status", statusRoutes);
  app.use("/api/analytics", analyticsRoutes);
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

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Not Found" });
  });

  // Global error handler
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("Global error handler:", err);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  );

  return app;
};
