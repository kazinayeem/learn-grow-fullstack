import mongoose from "mongoose";

// Ensure Mongoose uses UTC for all dates (no timezone conversion)
mongoose.set("toJSON", {
  transform: function (doc, ret) {
    // Keep dates as-is (UTC ISO strings)
    return ret;
  },
});

export const connectDB = async (MONGODB_URI: string) => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
    console.log("📅 Timezone: Dates will be stored and retrieved in UTC");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
