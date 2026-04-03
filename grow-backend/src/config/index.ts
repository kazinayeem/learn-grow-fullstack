import { ENV } from "./env";

export const config = {
  NODE_ENV: ENV.NODE_ENV,
  PORT: ENV.PORT,
  MONGODB_URI: ENV.MONGODB_URI || "mongodb://localhost:27017/modular_db",
  JWT_SECRET: ENV.JWT_SECRET || "change_me",
  JWT_EXPIRES_IN: ENV.JWT_EXPIRES_IN || "7d",
};
