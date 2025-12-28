import mongoose from "mongoose";
import { Blog } from "@/modules/blog/model/blog.model";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

const dropDuplicateIndexes = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      retryWrites: true,
      w: "majority",
    } as any);
    console.log("✅ Connected to MongoDB");

    // Drop and recreate indexes for Blog collection
    console.log("Dropping old indexes...");
    try {
      await Blog.collection.dropIndexes();
      console.log("✅ Dropped all indexes");
    } catch (e: any) {
      if (e.message.includes("index not found")) {
        console.log("No indexes to drop");
      } else {
        console.warn("Warning while dropping indexes:", e.message);
      }
    }

    // Recreate indexes from schema definition
    console.log("Recreating indexes from schema...");
    await Blog.syncIndexes();
    console.log("✅ Indexes synced successfully");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

dropDuplicateIndexes();
