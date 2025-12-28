/**
 * Migration script to drop the problematic unique index on phone field
 * Run this once after updating the User schema
 * Usage: npm run db:drop-phone-index
 */

import mongoose from "mongoose";
import { ENV } from "@/config/env";

const dropPhoneIndex = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(ENV.MONGODB_URI || "mongodb://admin:admin123@localhost:27017/modular_db?authSource=admin");
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Failed to get database connection");
    }

    console.log("Dropping 'phone_1' index from users collection...");
    
    try {
      await db.collection("users").dropIndex("phone_1");
      console.log("✅ Successfully dropped 'phone_1' index");
    } catch (error: any) {
      if (error.message.includes("index not found")) {
        console.log("ℹ️  Index 'phone_1' not found (may have already been dropped)");
      } else {
        throw error;
      }
    }

    // Verify indexes
    const indexes = await db.collection("users").listIndexes().toArray();
    console.log("Current indexes on users collection:");
    indexes.forEach((index: any) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log("✅ Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

dropPhoneIndex();
