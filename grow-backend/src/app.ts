import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import { userRoutes } from "@/modules/user";
import { categoryRoutes } from "@/modules/category";
import { jobRoutes } from "@/modules/job";
import { courseRoutes } from "@/modules/course";
import { assessmentRoutes } from "@/modules/assessment";
import { quizRoutes } from "@/modules/quiz";
import { siteContentRoutes } from "@/modules/siteContent";
import { settingsRoutes } from "@/modules/settings";
import { statusRoutes } from "@/modules/status";
import blogRoutes from "@/modules/blog/routes/blog.route";
import eventRoutes from "@/modules/event/routes/event.route";
import paymentMethodRoutes from "@/modules/payment/routes/payment-method.route";
import orderRoutes from "@/modules/order/routes/order.route";
import googleRoutes from "@/modules/user/routes/google.routes";
import { ENV } from "@/config/env";
import "@/config/passport";

export const createApp = () => {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: [ENV.FRONTEND_URL, "http://localhost:3000"],
      credentials: true,
    })
  );

  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
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
  app.use("/api/job", jobRoutes);
  app.use("/api/course", courseRoutes);
  app.use("/api/assessment", assessmentRoutes);
  app.use("/api/quiz", quizRoutes);
  app.use("/api/status", statusRoutes);
  app.use("/api/v1/status", statusRoutes);
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
