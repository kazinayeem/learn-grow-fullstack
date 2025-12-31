import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../modules/user/model/user.model";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

async function createUsers() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedDemoPassword = await bcrypt.hash("demo123", 10);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@learngrow.com" });
    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists");
    } else {
      // Create Admin User
      const adminUser = await User.create({
        name: "Admin User",
        email: "admin@learngrow.com",
        phone: "01700000001",
        password: hashedAdminPassword,
        role: "admin",
        isVerified: true,
        isApproved: true,
      });
      console.log("✅ Admin user created successfully");
      console.log("   Email: admin@learngrow.com");
      console.log("   Password: admin123");
    }

    // Check if demo user already exists
    const existingDemo = await User.findOne({ email: "demo@learngrow.com" });
    if (existingDemo) {
      console.log("ℹ️  Demo user already exists");
    } else {
      // Create Demo Student User
      const demoUser = await User.create({
        name: "Demo Student",
        email: "demo@learngrow.com",
        phone: "01700000002",
        password: hashedDemoPassword,
        role: "student",
        isVerified: true,
        isApproved: true,
      });
      console.log("✅ Demo student user created successfully");
      console.log("   Email: demo@learngrow.com");
      console.log("   Password: demo123");
    }

    // Check if demo instructor already exists
    const existingInstructor = await User.findOne({ email: "instructor@learngrow.com" });
    if (existingInstructor) {
      // Update expertise to array if needed
      if (!Array.isArray(existingInstructor.expertise)) {
        existingInstructor.expertise = [
          "Web Development",
          "Programming"
        ];
        await existingInstructor.save();
        console.log("🔄 Updated demo instructor's expertise to array");
      } else {
        console.log("ℹ️  Demo instructor already exists");
      }
    } else {
      // Create Demo Instructor User
      const instructorUser = await User.create({
        name: "Demo Instructor",
        email: "instructor@learngrow.com",
        phone: "01700000003",
        password: hashedDemoPassword,
        role: "instructor",
        isVerified: true,
        isApproved: true,
        bio: "Experienced educator passionate about teaching",
        expertise: ["Web Development", "Programming"],
        qualification: "Master's in Computer Science",
        institution: "University of Dhaka",
        yearsOfExperience: 5,
      });
      console.log("✅ Demo instructor user created successfully");
      console.log("   Email: instructor@learngrow.com");
      console.log("   Password: demo123");
    }

    // Check if manager already exists
    const existingManager = await User.findOne({ email: "manager@learngrow.com" });
    if (existingManager) {
      console.log("ℹ️  Manager user already exists");
    } else {
      // Create Manager User
      const managerUser = await User.create({
        name: "Demo Manager",
        email: "manager@learngrow.com",
        phone: "01700000004",
        password: hashedDemoPassword,
        role: "manager",
        isVerified: true,
        isApproved: true,
      });
      console.log("✅ Manager user created successfully");
      console.log("   Email: manager@learngrow.com");
      console.log("   Password: demo123");
    }

    console.log("\n📋 Summary:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin Login:");
    console.log("  Email: admin@learngrow.com");
    console.log("  Password: admin123");
    console.log("");
    console.log("Demo Student Login:");
    console.log("  Email: demo@learngrow.com");
    console.log("  Password: demo123");
    console.log("");
    console.log("Demo Instructor Login:");
    console.log("  Email: instructor@learngrow.com");
    console.log("  Password: demo123");
    console.log("");
    console.log("Manager Login:");
    console.log("  Email: manager@learngrow.com");
    console.log("  Password: demo123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error creating users:", error.message);
    process.exit(1);
  }
}

createUsers();
