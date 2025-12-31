import mongoose from "mongoose";
import { LiveClass, ILiveClass } from "@/modules/liveClass/model/liveClass.model";

const INSTRUCTOR_ID = "6952577980ee5a7cebb59a74";
const COURSE_ID = "6952bcab6b638e58891980ab";
const TOTAL_CLASSES = 500;

async function seedLiveClasses() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow");
    console.log("✅ Connected to MongoDB\n");

    // Check existing count
    const existingCount = await LiveClass.countDocuments();
    console.log(`📊 Existing live classes: ${existingCount}`);

    if (existingCount >= TOTAL_CLASSES) {
      console.log(`⚠️  Already have ${existingCount} classes. Skipping seed.\n`);
      process.exit(0);
    }

    console.log(`🌱 Seeding ${TOTAL_CLASSES} live classes...\n`);

    const platforms: Array<"Zoom" | "Meet" | "Other"> = ["Zoom", "Meet", "Other"];
    const titles = [
      "React Basics",
      "Advanced JavaScript",
      "Node.js Fundamentals",
      "Database Design",
      "API Development",
      "Frontend Optimization",
      "Testing Strategies",
      "Deployment Guide",
      "Cloud Architecture",
      "Mobile Development",
      "Web Security",
      "Performance Tuning",
      "Design Patterns",
      "Microservices",
      "DevOps Essentials",
    ];

    const classes: Partial<ILiveClass>[] = [];
    const now = new Date();

    for (let i = 1; i <= TOTAL_CLASSES; i++) {
      // Vary dates: some past, some scheduled for future
      const daysOffset = Math.floor((Math.random() - 0.5) * 60); // -30 to +30 days
      const scheduledAt = new Date(now);
      scheduledAt.setDate(scheduledAt.getDate() + daysOffset);
      scheduledAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

      // Determine status based on date
      let status: "Scheduled" | "Completed" | "Cancelled";
      if (scheduledAt < now) {
        status = Math.random() > 0.2 ? "Completed" : "Cancelled";
      } else {
        status = "Scheduled";
      }

      // 70% chance to be approved
      const isApproved = Math.random() > 0.3;

      // Generate meeting link
      const meetingId = Math.random().toString(36).substring(2, 11);
      const meetingLink = `https://zoom.us/j/${meetingId}`;

      // Add recorded link for some completed classes
      let recordedLink: string | undefined = undefined;
      if (status === "Completed" && Math.random() > 0.4) {
        const recordingTypes = [
          `https://youtu.be/video${i}`,
          `https://vimeo.com/${1000000 + i}`,
          `https://drive.google.com/file/d/video${i}`,
        ];
        recordedLink = recordingTypes[Math.floor(Math.random() * recordingTypes.length)];
      }

      const liveClass: Partial<ILiveClass> = {
        title: `${titles[i % titles.length]} - Session ${Math.floor(i / 15) + 1}`,
        courseId: new mongoose.Types.ObjectId(COURSE_ID),
        instructorId: new mongoose.Types.ObjectId(INSTRUCTOR_ID),
        scheduledAt,
        duration: (Math.floor(Math.random() * 4) + 1) * 30,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        meetingLink,
        recordedLink,
        status,
        isApproved,
      };

      classes.push(liveClass);

      if (i % 50 === 0) {
        console.log(`  📝 Generated ${i} classes...`);
      }
    }

    console.log(`\n💾 Inserting ${classes.length} classes into database...`);
    const result = await LiveClass.insertMany(classes);
    console.log(`✅ Successfully seeded ${result.length} live classes!\n`);

    // Print statistics
    const stats = await getStatistics();
    console.log("📊 Database Statistics:");
    console.log(`   Total Classes: ${stats.total}`);
    console.log(`   Scheduled: ${stats.scheduled}`);
    console.log(`   Completed: ${stats.completed}`);
    console.log(`   Cancelled: ${stats.cancelled}`);
    console.log(`   Approved: ${stats.approved}`);
    console.log(`   Pending Approval: ${stats.pending}`);
    console.log(`   With Recordings: ${stats.withRecordings}\n`);

    console.log("✅ Seeding complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", (error as Error).message);
    process.exit(1);
  }
}

async function getStatistics() {
  const total = await LiveClass.countDocuments();
  const scheduled = await LiveClass.countDocuments({ status: "Scheduled" });
  const completed = await LiveClass.countDocuments({ status: "Completed" });
  const cancelled = await LiveClass.countDocuments({ status: "Cancelled" });
  const approved = await LiveClass.countDocuments({ isApproved: true });
  const pending = await LiveClass.countDocuments({ isApproved: false });
  const withRecordings = await LiveClass.countDocuments({ recordedLink: { $exists: true, $ne: null } });

  return { total, scheduled, completed, cancelled, approved, pending, withRecordings };
}

seedLiveClasses();
