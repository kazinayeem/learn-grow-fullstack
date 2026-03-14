import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../modules/user/model/user.model";

const SEED_MONGODB_URI =
  process.env.SEED_MONGODB_URI ||
  "mongodb://learnandgrow:learnandgrow@104.207.70.54:27017/learnandgrow?authSource=admin";

async function createSuperAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(SEED_MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const email = "admin@admin.com";
    const password = "123456";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("\n⚠️  Admin user with this email already exists:");
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log("\n❌ Deleting existing admin...");
      await User.deleteOne({ email });
      console.log("✅ Existing admin deleted");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin user
    const admin = await User.create({
      name: "Super Admin",
      email: email,
      phone: "01700000000",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isApproved: true,
    });

    console.log("\n✅ Super Admin created successfully!");
    console.log("\n📋 Admin Details:");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Phone: ${admin.phone}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin._id}`);

    console.log("\n🔐 Login Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    console.log("\n🌐 Admin Panel URL:");
    console.log(`   http://localhost:3000/admin`);

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createSuperAdmin();
