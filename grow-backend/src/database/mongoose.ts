import mongoose from "mongoose";

// Hardcoded URIs for quick access
const MONGODB_URI = "mongodb://learnandgrow:learnandgrow@104.207.70.54:27017/learnandgrow?authSource=admin";

/**
 * Configure Mongoose Globals
 */
mongoose.set("toJSON", {
  transform: (_, ret) => {
    delete ret.__v; // Clean up version keys from responses
    return ret;
  },
});

/**
 * Mask credentials for secure logging
 */
const getMaskedUri = (uri: string) => uri.replace(/\/\/.*:(.*)@/, "//user:***@");

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log("✅ MongoDB connected successfully");
    console.log(`📍 Connection: ${getMaskedUri(MONGODB_URI)}`);
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};