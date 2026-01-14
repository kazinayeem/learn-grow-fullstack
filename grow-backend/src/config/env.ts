import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),

  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key_change_in_production",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  

  // Google OAuth
  GOOGLE_CLIENT_ID: "129172238767-bgibd5k66trs176q7291egtaj59qebjb.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "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",
  GOOGLE_CALLBACK_URL: "https://learnandgrow.io/api/auth/google/callback",
  
  // Frontend URL
  FRONTEND_URL: "https://learnandgrow.io",
  
  // Backend URL
  BACKEND_URL: process.env.BACKEND_URL || "https://learnandgrow.io/api",

  // Optional: external payment gateway health check URL
  PAYMENT_HEALTH_URL: process.env.PAYMENT_HEALTH_URL || "",
};
