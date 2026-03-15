import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/database/mongoose";
import { config } from "@/config/index";
import { User } from "@/modules/user/model/user.model";

async function seedSuperadmin() {
  try {
    console.log("🌱 Seeding superadmin user...");
    await connectDB(config.MONGODB_URI);

    // Superadmin credentials
    const superadminData = {
      name: "Super Admin",
      email: "admin@learn-grow.com",
      phone: "+880-1799-999999",
      password: "Admin@123",
      role: "admin" as const,
      isVerified: true,
      isApproved: true,
      accountStatus: "active" as const,
    };

    // Check if admin with this email already exists
    const existingAdmin = await User.findOne({ email: superadminData.email });
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists with email: ${superadminData.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin._id}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(superadminData.password, 10);

    // Create superadmin user
    const admin = await User.create({
      ...superadminData,
      password: hashedPassword,
    });

    console.log("\n✅ Superadmin user created successfully!\n");
    console.log("📋 Admin Details:");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Phone: ${admin.phone}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Verified: ${admin.isVerified}`);
    console.log(`   Approved: ${admin.isApproved}`);
    console.log(`   ID: ${admin._id}`);

    console.log("\n🔐 Login Credentials:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${superadminData.password}`);

    console.log("\n🌐 Admin Login URL:");
    console.log(`   https://learnandgrow.io/login`);

    console.log("\n✨ Seeding completed");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedSuperadmin();
