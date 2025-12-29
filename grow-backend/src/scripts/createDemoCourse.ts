import mongoose from "mongoose";
import dotenv from "dotenv";
import { Course } from "../modules/course/model/course.model";
import { Module } from "../modules/course/model/module.model";
import { Lesson } from "../modules/course/model/lesson.model";
import { User } from "../modules/user/model/user.model";

// Load environment variables
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

async function createDemoCourse() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find demo instructor
    const instructor = await User.findOne({ email: "instructor@learngrow.com" });
    if (!instructor) throw new Error("Demo instructor not found");

    // Create a demo course
    const course = await Course.create({
      title: "Fullstack Web Development Bootcamp",
      description: "A complete hands-on bootcamp covering HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, and deployment. Build real-world projects and become job-ready!",
      category: "Web Development",
      type: "live",
      price: 12000,
      discountPrice: 8999,
      thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
      level: "Beginner",
      language: "English",
      duration: 60, // hours
      rating: 4.9,
      ratingsCount: 120,
      studentsEnrolled: 350,
      instructorId: instructor._id,
      isPublished: true,
      isFeatured: true,
      isAdminApproved: true,
      isRegistrationOpen: true,
      registrationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      tags: ["web", "fullstack", "react", "node", "mongodb", "javascript"],
      learningOutcomes: [
        "Build and deploy fullstack web apps",
        "Master React, Node.js, Express, MongoDB",
        "Understand REST APIs and authentication",
        "Work with real-world projects and teamwork"
      ],
      prerequisites: [
        "Basic computer skills",
        "Motivation to learn"
      ]
    });
    console.log("✅ Demo course created:", course.title);

    // Create modules
    const modules = await Module.insertMany([
      {
        courseId: course._id,
        title: "Introduction & Setup",
        description: "Course overview, tools, and environment setup.",
        orderIndex: 0,
        isPublished: true
      },
      {
        courseId: course._id,
        title: "Frontend Development",
        description: "HTML, CSS, JavaScript, React basics.",
        orderIndex: 1,
        isPublished: true
      },
      {
        courseId: course._id,
        title: "Backend Development",
        description: "Node.js, Express, MongoDB, REST APIs.",
        orderIndex: 2,
        isPublished: true
      },
      {
        courseId: course._id,
        title: "Project & Deployment",
        description: "Build a real project and deploy to cloud.",
        orderIndex: 3,
        isPublished: true
      }
    ]);
    console.log("✅ Modules created:", modules.map(m => m.title));

    // Create lessons for each module
    const lessons = [
      // Module 1
      {
        moduleId: modules[0]._id,
        title: "Welcome & Syllabus",
        description: "Meet your instructor and get the course roadmap.",
        type: "video",
        contentUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
        duration: 20,
        orderIndex: 0,
        isPublished: true,
        isFreePreview: true
      },
      {
        moduleId: modules[0]._id,
        title: "Environment Setup",
        description: "Install VS Code, Node.js, and Git.",
        type: "article",
        contentUrl: "https://code.visualstudio.com/docs/setup/setup-overview",
        duration: 15,
        orderIndex: 1,
        isPublished: true
      },
      // Module 2
      {
        moduleId: modules[1]._id,
        title: "HTML & CSS Basics",
        description: "Learn HTML structure and CSS styling.",
        type: "video",
        contentUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
        duration: 40,
        orderIndex: 0,
        isPublished: true,
        isFreePreview: true
      },
      {
        moduleId: modules[1]._id,
        title: "JavaScript Essentials",
        description: "Variables, functions, DOM, and ES6+ features.",
        type: "video",
        contentUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        duration: 60,
        orderIndex: 1,
        isPublished: true
      },
      {
        moduleId: modules[1]._id,
        title: "React Fundamentals",
        description: "JSX, components, props, state, hooks.",
        type: "video",
        contentUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
        duration: 90,
        orderIndex: 2,
        isPublished: true
      },
      // Module 3
      {
        moduleId: modules[2]._id,
        title: "Node.js & Express",
        description: "Server-side JavaScript, REST APIs.",
        type: "video",
        contentUrl: "https://www.youtube.com/watch?v=Oe421EPjeBE",
        duration: 60,
        orderIndex: 0,
        isPublished: true
      },
      {
        moduleId: modules[2]._id,
        title: "MongoDB & Mongoose",
        description: "NoSQL database, schema design, CRUD.",
        type: "video",
        contentUrl: "https://www.youtube.com/watch?v=4yqu8YF29cU",
        duration: 45,
        orderIndex: 1,
        isPublished: true
      },
      {
        moduleId: modules[2]._id,
        title: "API Authentication",
        description: "JWT, sessions, and securing endpoints.",
        type: "article",
        contentUrl: "https://jwt.io/introduction",
        duration: 20,
        orderIndex: 2,
        isPublished: true
      },
      // Module 4
      {
        moduleId: modules[3]._id,
        title: "Capstone Project",
        description: "Build a MERN stack app from scratch.",
        type: "assignment",
        contentUrl: "https://github.com/your-org/mern-capstone",
        duration: 180,
        orderIndex: 0,
        isPublished: true
      },
      {
        moduleId: modules[3]._id,
        title: "Deployment to Vercel",
        description: "Deploy your app to the cloud.",
        type: "video",
        contentUrl: "https://vercel.com/docs/deployments",
        duration: 30,
        orderIndex: 1,
        isPublished: true
      }
    ];
    await Lesson.insertMany(lessons);
    console.log("✅ Lessons created for all modules");

    console.log("🎉 Demo course, modules, and lessons created successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error creating demo course:", error.message);
    process.exit(1);
  }
}

createDemoCourse();
