import mongoose from "mongoose";

// Hardcoded URI - Primary source
const MONGODB_URI = "mongodb://learnandgrow:learnandgrow@104.207.70.54:27017/learnandgrow?authSource=admin";

/**
 * Global UTC & Cleanup Transformation
 */
const outputOptions = {
  transform: (_: any, ret: any) => {
    delete ret.__v; // Remove version key
    
    // Ensure all Date objects are returned as UTC ISO strings
    for (const key in ret) {
      if (ret[key] instanceof Date) {
        ret[key] = ret[key].toISOString();
      }
    }
    return ret;
  },
};

mongoose.set("toJSON", outputOptions);
mongoose.set("toObject", outputOptions);

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    // We use the hardcoded URI directly for "clean" simplicity
    await mongoose.connect(MONGODB_URI);

    const maskedUri = MONGODB_URI.replace(/\/\/.*:(.*)@/, "//user:***@");
    
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📍 URI: ${maskedUri}`);
    console.log("📅 Time: UTC ISO strings enabled");
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};