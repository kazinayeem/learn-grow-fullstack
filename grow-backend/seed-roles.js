// Script to seed default roles for team management
import mongoose from "mongoose";
import { Role } from "../src/modules/team/model/role.model.js";
import { TeamMember } from "../src/modules/team/model/team.model.js";
import { ENV } from "../src/config/env.js";

const defaultRoles = [
    { name: "Founder & CEO", position: 1 },
    { name: "Co-Founder", position: 2 },
    { name: "Head of Content", position: 3 },
    { name: "Lead Instructor", position: 4 },
    { name: "Senior Instructor", position: 5 },
    { name: "Instructor", position: 6 },
    { name: "Course Developer", position: 7 },
    { name: "Technical Lead", position: 8 },
    { name: "Operations Manager", position: 9 },
    { name: "Support Manager", position: 10 },
];

async function seedRoles() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(ENV.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Remove all existing team data
        console.log("🗑️  Removing existing team members...");
        const deletedMembers = await TeamMember.deleteMany({});
        console.log(`✅ Deleted ${deletedMembers.deletedCount} team members`);

        console.log("🗑️  Removing existing roles...");
        const deletedRoles = await Role.deleteMany({});
        console.log(`✅ Deleted ${deletedRoles.deletedCount} roles`);

        // Seed default roles
        console.log("🌱 Seeding default roles...");
        const results = await Role.insertMany(defaultRoles);
        console.log(`✅ Successfully seeded ${results.length} roles:`);
        results.forEach((role) => {
            console.log(`   - ${role.name} (position: ${role.position})`);
        });

        console.log("\n✨ Database reset complete! You can now add fresh team members.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding roles:", error);
        process.exit(1);
    }
}

seedRoles();
