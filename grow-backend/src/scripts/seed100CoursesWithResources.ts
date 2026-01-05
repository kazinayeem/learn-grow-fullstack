import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { Course } from "../modules/course/model/course.model";
import { Module } from "../modules/course/model/module.model";
import { Lesson } from "../modules/course/model/lesson.model";
import { User } from "../modules/user/model/user.model";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";
const FALLBACK_INSTRUCTOR_ID = "6958a09f1ed7c524b6db603b";
const VIDEO_URL = "https://www.youtube.com/watch?v=oS4QUZPKob8";
const PDF_URL =
  "https://docs.google.com/document/d/134gcnuMJ4qoas2NM3Vb01WxBeRyB0dJ80K4UF5_Kr2U/edit?usp=sharing";
const SHOULD_PURGE = process.env.SEED_PURGE_INSTRUCTOR_COURSES !== "false";
const TOTAL_COURSES = 100;

const courseTitles = [
  "Full-Stack Launchpad",
  "Next.js & APIs",
  "TypeScript in Practice",
  "UI Systems & Design",
  "Node.js Services",
  "Database Mastery",
  "Cloud Foundations",
  "DevOps for Builders",
  "Data Visualization",
  "Machine Learning Lite",
  "Cybersecurity Basics",
  "Responsive Frontends",
  "Testing & QA",
  "Performance Engineering",
  "Product Thinking",
];

const courseLevels: Array<"Beginner" | "Intermediate" | "Advanced"> = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const courseLanguages = ["English", "Bangla", "Bengali"];
const courseTypes: Array<"live" | "recorded"> = ["recorded", "live"];

const buildRichDescription = (title: string, topic: string): string =>
  [
    `${title} is a practitioner-friendly program focused on building confidently in ${topic}.`,
    "You get guided walkthroughs, annotated code, and real-world scenarios that match how teams ship production-grade work.",
    "Every module pairs the core walkthrough video with downloadable PDFs so learners can review, annotate, and share key takeaways.",
    "Expect clear milestones, project prompts, and checkpoints that keep momentum without sacrificing depth.",
    "What you will experience:",
    "- Structured sprints with outcomes and demos",
    "- Patterns for debugging, testing, and performance tuning",
    "- Reusable templates, checklists, and decision logs",
    "- Practical delivery guidance for client and team contexts",
    "Reference assets:",
    `- Video walkthrough: ${VIDEO_URL}`,
    `- PDF playbook: ${PDF_URL}`,
    "This course is updated regularly to reflect current tooling, API shapes, and delivery expectations.",
  ].join("\n\n");

const buildCourse = (index: number, instructorId: Types.ObjectId) => {
  const title = `${courseTitles[index % courseTitles.length]} ${index + 1}`;
  const topic = courseTitles[index % courseTitles.length];
  const price = Math.floor(Math.random() * 7000) + 3000; // 3000 - 9999
  const discountPrice = Math.floor(price * 0.82);

  return {
    title,
    description: buildRichDescription(title, topic),
    category: "Technology",
    type: courseTypes[index % courseTypes.length],
    price,
    discountPrice,
    thumbnail: `https://picsum.photos/seed/course-${index + 1}/800/480`,
    level: courseLevels[index % courseLevels.length],
    language: courseLanguages[index % courseLanguages.length],
    duration: Math.floor(Math.random() * 40) + 20,
    rating: Math.min(5, Math.random() * 1 + 4),
    ratingsCount: Math.floor(Math.random() * 300) + 20,
    studentsEnrolled: Math.floor(Math.random() * 3500) + 150,
    instructorId,
    isPublished: true,
    isFeatured: index < 25,
    isAdminApproved: true,
    isRegistrationOpen: true,
    registrationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    tags: ["video", "pdf", "hands-on", "updated-2026", "certificate"],
    learningOutcomes: [
      `Ship production-ready work in ${topic}`,
      "Apply repeatable delivery checklists",
      "Use video + PDF assets to reinforce learning",
      "Publish demos with confidence",
    ],
    prerequisites: ["Basic computer literacy", "Growth mindset"],
  };
};

const buildModuleTemplates = (courseIndex: number) => [
  {
    title: "Launch & Orientation",
    description:
      "Kick off the course, set expectations, and map the delivery plan. Includes the core walkthrough video and quick-reference PDFs.",
    orderIndex: 0,
  },
  {
    title: "Deep Dive & Resources",
    description:
      "Work through the applied demo, grab the PDF references, and lock in best practices you can reuse across projects.",
    orderIndex: 1,
  },
  {
    title: "Project Delivery Sprint",
    description:
      "Apply everything in a focused mini-sprint with clear acceptance criteria and a short review checklist.",
    orderIndex: 2,
  },
];

const buildLessons = (moduleId: Types.ObjectId, moduleOrder: number) => {
  const lessons = [
    {
      moduleId,
      title: moduleOrder === 0 ? "Welcome + Roadmap (Watch)" : "Applied Walkthrough (Watch)",
      description: "Guided video so learners see the full flow end-to-end.",
      type: "video" as const,
      contentUrl: VIDEO_URL,
      duration: 22,
      orderIndex: 0,
      isPublished: true,
      isFreePreview: moduleOrder === 0,
    },
    {
      moduleId,
      title: "Download: Course Playbook (PDF)",
      description: "Printable quick-start playbook with the same flow shown in the video.",
      type: "pdf" as const,
      contentUrl: PDF_URL,
      orderIndex: 1,
      isPublished: true,
      isFreePreview: false,
    },
    {
      moduleId,
      title: "Download: Checklist (PDF)",
      description: "Use this to track completion and client-ready criteria.",
      type: "pdf" as const,
      contentUrl: PDF_URL,
      orderIndex: 2,
      isPublished: true,
      isFreePreview: false,
    },
    {
      moduleId,
      title: "Q&A Highlights (Watch)",
      description: "Short answers to common blockers pulled from prior cohorts.",
      type: "video" as const,
      contentUrl: VIDEO_URL,
      duration: 12,
      orderIndex: 3,
      isPublished: true,
      isFreePreview: false,
    },
  ];

  return lessons;
};

async function ensureInstructor(): Promise<Types.ObjectId> {
  const explicitId = process.env.SEED_INSTRUCTOR_ID || FALLBACK_INSTRUCTOR_ID;
  const existingById = await User.findById(explicitId);

  if (existingById) {
    console.log(`👤 Using existing instructor by ID: ${explicitId}`);
    return existingById._id;
  }

  const existingByEmail = await User.findOne({ email: "seeded-instructor@example.com" });
  if (existingByEmail) {
    console.log(`👤 Using fallback instructor by email: ${existingByEmail.email}`);
    return existingByEmail._id;
  }

  console.log("🆕 Creating fallback instructor (provided ID not found)...");
  const hashedPassword = await bcrypt.hash("Seeded@123", 10);
  const created = await User.create({
    _id: new Types.ObjectId(explicitId),
    name: "Seeded Instructor",
    email: "seeded-instructor@example.com",
    phone: "9999999999",
    password: hashedPassword,
    role: "instructor",
    isVerified: true,
    isApproved: true,
    bio: "Auto-created for seeding.",
    expertise: ["Full Stack", "Delivery"],
    qualification: "Automation",
    institution: "Learn & Grow",
    yearsOfExperience: 12,
  });

  console.log(`✅ Created fallback instructor: ${created.email}`);
  return created._id;
}

async function purgeExisting(instructorId: Types.ObjectId) {
  if (!SHOULD_PURGE) {
    console.log("⚠️  Skipping purge of existing instructor courses (SEED_PURGE_INSTRUCTOR_COURSES=false)");
    return;
  }

  const existingCourses = await Course.find({ instructorId }, { _id: 1 }).lean();
  if (!existingCourses.length) {
    console.log("ℹ️  No existing courses to purge for this instructor.");
    return;
  }

  const courseIds = existingCourses.map((c) => c._id);
  const modules = await Module.find({ courseId: { $in: courseIds } }, { _id: 1 }).lean();
  const moduleIds = modules.map((m) => m._id);

  const lessonDelete = moduleIds.length
    ? await Lesson.deleteMany({ moduleId: { $in: moduleIds } })
    : { deletedCount: 0 };
  const moduleDelete = courseIds.length
    ? await Module.deleteMany({ courseId: { $in: courseIds } })
    : { deletedCount: 0 };
  const courseDelete = await Course.deleteMany({ _id: { $in: courseIds } });

  console.log(
    `🗑️  Purged instructor data -> Courses: ${courseDelete.deletedCount}, Modules: ${moduleDelete.deletedCount}, Lessons: ${lessonDelete.deletedCount}`
  );
}

async function seedCourses() {
  let conn: mongoose.Mongoose | null = null;

  try {
    console.log("🚀 Seeding 100 courses with modules + lessons (video + PDF)...");
    conn = await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const instructorId = await ensureInstructor();
    await purgeExisting(instructorId);

    let courseCount = 0;
    let moduleCount = 0;
    let lessonCount = 0;

    for (let i = 0; i < TOTAL_COURSES; i++) {
      const courseData = buildCourse(i, instructorId);
      const course = await Course.create(courseData);
      courseCount += 1;

      const moduleTemplates = buildModuleTemplates(i).map((m) => ({
        ...m,
        courseId: course._id,
        isPublished: true,
        resources: PDF_URL,
      }));

      const createdModules = await Module.insertMany(moduleTemplates);
      moduleCount += createdModules.length;

      const lessonsForModules = createdModules.flatMap((moduleDoc) =>
        buildLessons(moduleDoc._id, moduleDoc.orderIndex || 0)
      );

      const createdLessons = await Lesson.insertMany(lessonsForModules);
      lessonCount += createdLessons.length;

      if ((i + 1) % 20 === 0) {
        console.log(`  ✅ Created ${i + 1} courses so far (modules: ${moduleCount}, lessons: ${lessonCount})`);
      }
    }

    console.log("\n📊 Seeding complete:");
    console.log(`  Courses: ${courseCount}`);
    console.log(`  Modules: ${moduleCount}`);
    console.log(`  Lessons: ${lessonCount}`);
    console.log("  - Video link applied to every module");
    console.log("  - PDF link applied to reference lessons");
    console.log("  - First lesson of each course is free preview");

    console.log("\n🎯 Instructor ID used:", instructorId.toString());
    console.log("🎉 Done");
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  } finally {
    if (conn) {
      await mongoose.disconnect();
      console.log("🔌 Disconnected from MongoDB");
    }
  }
}

seedCourses();
