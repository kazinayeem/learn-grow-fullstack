import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../modules/user/model/user.model";
import { ENV } from "../config/env";

async function createAdminUser() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(ENV.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("\n⚠️  Admin user already exists:");
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Phone: ${existingAdmin.phone}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      readline.question("\nDo you want to create another admin? (y/n): ", async (answer: string) => {
        readline.close();
        if (answer.toLowerCase() !== "y") {
          console.log("Exiting...");
          await mongoose.disconnect();
          process.exit(0);
        }
        await createAdmin();
      });
    } else {
      await createAdmin();
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

async function createAdmin() {
  try {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("\n📝 Enter admin details:");

    const name = await new Promise<string>((resolve) => {
      readline.question("Name: ", (answer: string) => resolve(answer));
    });

    const email = await new Promise<string>((resolve) => {
      readline.question("Email: ", (answer: string) => resolve(answer));
    });

    const phone = await new Promise<string>((resolve) => {
      readline.question("Phone: ", (answer: string) => resolve(answer));
    });

    const password = await new Promise<string>((resolve) => {
      readline.question("Password: ", (answer: string) => resolve(answer));
    });

    readline.close();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isApproved: true,
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📋 Admin Details:");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Phone: ${admin.phone}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin._id}`);

    console.log("\n🔐 Login Credentials:");
    console.log(`   Email/Phone: ${admin.email || admin.phone}`);
    console.log(`   Password: ${password}`);

    console.log("\n🌐 Admin Panel URL:");
    console.log(`   http://localhost:3000/admin`);

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error creating admin:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdminUser();
