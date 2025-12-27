import mongoose from "mongoose";
import https from "https";
import http from "http";
import { ENV } from "@/config/env";

const pingPayment = (url: string, timeoutMs = 3000): Promise<{ ok: boolean; ms?: number }> => {
  return new Promise((resolve) => {
    try {
      const start = Date.now();
      const mod = url.startsWith("https") ? https : http;
      const req = mod.request(url, { method: "HEAD", timeout: timeoutMs }, (res) => {
        res.resume();
        resolve({ ok: res.statusCode ? res.statusCode < 500 : true, ms: Date.now() - start });
      });
      req.on("timeout", () => {
        req.destroy();
        resolve({ ok: false });
      });
      req.on("error", () => resolve({ ok: false }));
      req.end();
    } catch {
      resolve({ ok: false });
    }
  });
};

export const getSystemStatus = async () => {
  // Server
  const server = {
    status: "online" as const,
    time: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
  };

  // Database
  let database: { status: "healthy" | "degraded" | "down"; pingMs?: number } = { status: "down" };
  try {
    const ready = mongoose.connection.readyState; // 1 = connected
    if (ready === 1 && mongoose.connection.db) {
      const start = Date.now();
      // @ts-ignore
      const ping = await mongoose.connection.db.admin().ping();
      const ms = Date.now() - start;
      database = { status: ping?.ok ? "healthy" : "degraded", pingMs: ms };
    } else if (ready === 2) {
      database = { status: "degraded" };
    }
  } catch {
    database = { status: "down" };
  }

  // Payment gateway
  let paymentGateway: { status: "active" | "inactive" | "unknown"; latencyMs?: number } = { status: "unknown" };
  if (ENV.PAYMENT_HEALTH_URL) {
    const res = await pingPayment(ENV.PAYMENT_HEALTH_URL);
    paymentGateway = res.ok ? { status: "active", latencyMs: res.ms } : { status: "inactive" };
  }

  return {
    success: true,
    message: "System status",
    data: { server, database, paymentGateway },
  };
};
