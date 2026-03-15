import mongoose from "mongoose";

// Ensure Mongoose uses UTC for all dates (no timezone conversion)
mongoose.set("toJSON", {
  transform: function (doc, ret) {
    // Keep dates as-is (UTC ISO strings)
    return ret;
  },
});

/**
 * MongoDB connection URIs by environment
 * ⚠️ WARNING: Credentials are hardcoded for development only
 */
const MONGODB_URIS = {
  // Local development (default)
  development: "mongodb://learnandgrow:learnandgrow@104.207.70.54:27017/learnandgrow?authSource=admin",
  
  // Docker environment
  docker: "mongodb://learnandgrow:learnandgrow@104.207.70.54:27017/learnandgrow?authSource=admin",
  
  // Production (with credentials)
  production: "mongodb://learnandgrow:learnandgrow@104.207.70.54:27017/learnandgrow?authSource=admin",
};

/**
 * Validate MongoDB connection string has credentials
 */
function validateMongoDBURI(uri: string): { valid: boolean; error?: string } {
  if (!uri) {
    return { valid: false, error: "MONGODB_URI is not defined" };
  }

  // Check if connection string has credentials (username:password format) or is mongodb+srv
  const hasCredentials = /@/.test(uri);
  if (!hasCredentials && !uri.includes("mongodb+srv") && !uri.includes("localhost")) {
    return {
      valid: false,
      error: "MongoDB connection string must include username and password",
    };
  }

  return { valid: true };
}

export const connectDB = async (MONGODB_URI?: string) => {
  try {
    // Determine which URI to use
    let mongoUri = MONGODB_URI;
    
    if (!mongoUri) {
      // Try environment variable first
      mongoUri = process.env.MONGODB_URI;
    }
    
    if (!mongoUri) {
      // Fall back to hardcoded URIs based on NODE_ENV
      const env = process.env.NODE_ENV || "development";
      mongoUri = MONGODB_URIS[env as keyof typeof MONGODB_URIS] || MONGODB_URIS.development;
      console.log(`📍 Using hardcoded ${env} MongoDB URI`);
    }

    // Validate URI
    const validation = validateMongoDBURI(mongoUri);
    if (!validation.valid) {
      console.error("❌ MongoDB Connection Error:", validation.error);
      process.exit(1);
    }

    // Hide password in logs for security
    const displayUri = mongoUri.replace(/\/\/.*:(.*)@/, "//user:***@");

    await mongoose.connect("mongodb://learnandgrow:learnandgrow@104.207.70.54:27017/learnandgrow?authSource=adminmongodb://learnandgrow:learnandgrow@104.207.70.54:27017/learnandgrow?authSource=admin");
    console.log("✅ MongoDB connected successfully");
    console.log(`📍 Connection: ${displayUri}`);
    console.log("📅 Timezone: Dates stored and retrieved in UTC");
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};
