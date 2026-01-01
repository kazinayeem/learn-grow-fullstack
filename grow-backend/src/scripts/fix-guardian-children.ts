/**
 * Migration Script: Fix Guardian Children Array
 * 
 * This script populates the Guardian.children array from GuardianProfile records.
 * Run this once to fix existing guardian-student relationships.
 * 
 * Usage: ts-node src/scripts/fix-guardian-children.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function fixGuardianChildren() {
  try {
    console.log("🔧 Starting Guardian Children Array Fix...\n");

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/learn-grow";
    console.log(`📡 Connecting to MongoDB: ${mongoUri.includes("@") ? mongoUri.replace(/\/\/.*:.*@/, "//***:***@") : mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Import models
    const { User } = await import("../modules/user/model/user.model");
    const { GuardianProfile } = await import("../modules/user/model/guardianProfile.model");

    // Find all GuardianProfile records
    const guardianProfiles = await GuardianProfile.find({}).lean();
    console.log(`📊 Found ${guardianProfiles.length} GuardianProfile records\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each guardian profile
    for (const profile of guardianProfiles) {
      try {
        const guardian = await User.findById(profile.userId);
        
        if (!guardian) {
          console.log(`⚠️  Guardian not found: ${profile.userId}`);
          errorCount++;
          continue;
        }

        // Check if student is already in children array
        const childrenIds = (guardian.children || []).map((id: any) => id.toString());
        const studentIdStr = profile.studentId.toString();

        if (childrenIds.includes(studentIdStr)) {
          console.log(`⏭️  Skipped: Guardian ${guardian.email} already has student ${studentIdStr}`);
          skippedCount++;
          continue;
        }

        // Add student to children array
        guardian.children = [...(guardian.children || []), profile.studentId] as any;
        await guardian.save();

        console.log(`✅ Updated: Guardian ${guardian.email} now linked to student ${studentIdStr}`);
        updatedCount++;

      } catch (error: any) {
        console.error(`❌ Error processing guardian ${profile.userId}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Updated:  ${updatedCount} guardians`);
    console.log(`⏭️  Skipped:  ${skippedCount} guardians (already correct)`);
    console.log(`❌ Errors:   ${errorCount} guardians`);
    console.log(`📊 Total:    ${guardianProfiles.length} guardian profiles processed`);
    console.log("=".repeat(60) + "\n");

    // Disconnect
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    console.log("✨ Migration complete!");

  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
fixGuardianChildren();
