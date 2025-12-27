import bcrypt from "bcryptjs";
import { connectDB } from "@/database/mongoose";
import { config } from "@/config/index";
import { User } from "../model/user.model";

const users = [
  {
    name: "Super Admin",
    phone: "1999999999",
    email: "superadmin@example.com",
    password: "Admin@12345",
    role: "admin" as const,
    profileImage: "https://example.com/super-admin.png",
  },
  {
    name: "Instructor One",
    phone: "1888888888",
    email: "instructor@example.com",
    password: "Instructor@123",
    role: "instructor" as const,
    profileImage: "https://example.com/instructor.png",
  },
  {
    name: "Student One",
    phone: "1777777777",
    email: "student@example.com",
    password: "Student@123",
    role: "student" as const,
    profileImage: "https://example.com/student.png",
  },
];

async function seed() {
  try {
    console.log("🌱 Seeding users...");
    await connectDB(config.MONGODB_URI);

    // hash passwords
    const saltRounds = 10;
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, saltRounds),
      }))
    );

    // clear existing
    const deleteResult = await User.deleteMany({ phone: { $in: users.map((u) => u.phone) } });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing seeded users`);

    // insert
    const inserted = await User.insertMany(hashedUsers);
    console.log(`✅ Inserted ${inserted.length} users`);

    inserted.forEach((u) => {
      console.log(`- ${u.role}: ${u.name} (${u.phone})`);
    });

    console.log("✨ Seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed", error);
    process.exit(1);
  }
}

seed();
