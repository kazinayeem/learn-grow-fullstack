import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://admin:admin123@72.62.194.176:27017/learn_grow?authSource=admin",

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key_change_in_production",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  
  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: Number(process.env.EMAIL_PORT || 587),
  EMAIL_USER: process.env.EMAIL_USER || "kazinayeem55085@gmail.com",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "your-app-password",
  
  // SMS Configuration (Twilio)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "",
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "129172238767-bgibd5k66trs176q7291egtaj59qebjb.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "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",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "https://learnandgrow.io/api/auth/google/callback",
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || "https://learnandgrow.io",
  
  // Backend URL
  BACKEND_URL: process.env.BACKEND_URL || "https://learnandgrow.io/api",

  // Optional: external payment gateway health check URL
  PAYMENT_HEALTH_URL: process.env.PAYMENT_HEALTH_URL || "",
};
