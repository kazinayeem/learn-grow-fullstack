import mongoose from "mongoose";

// Ensure Mongoose uses UTC for all dates (no timezone conversion)
mongoose.set("toJSON", {
  transform: function (doc, ret) {
    // Keep dates as-is (UTC ISO strings)
    return ret;
  },
});

const DatabaseProd =
  "mongodb://admin:admin123@72.62.194.176:27017/learn_grow?authSource=admin";
const testDev =
  "mongodb+srv://awsnayeem7_db_user:IbbqcElMtKJWCH6r@learn-grow.1vvwxhs.mongodb.net/?appName=learn-grow";
export const connectDB = async (MONGODB_URI: string) => {
  try {
    await mongoose.connect(DatabaseProd);
    console.log("✅ MongoDB connected");
    console.log("📅 Timezone: Dates will be stored and retrieved in UTC");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
