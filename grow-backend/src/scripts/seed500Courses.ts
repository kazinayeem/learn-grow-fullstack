import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { Course } from "../modules/course/model/course.model";
import { Module } from "../modules/course/model/module.model";
import { Lesson } from "../modules/course/model/lesson.model";
import { User } from "../modules/user/model/user.model";

// Load environment variables
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

// Large description template
const generateLargeDescription = (courseTitle: string, index: number): string => {
  const topics = [
    "programming", "web development", "data science", "machine learning", "mobile apps",
    "cloud computing", "databases", "cybersecurity", "devops", "artificial intelligence",
    "blockchain", "iot", "embedded systems", "game development", "robotics"
  ];
  
  const topic = topics[index % topics.length];
  
  return `
This comprehensive course on "${courseTitle}" is designed to equip you with all the essential skills and knowledge needed to master ${topic} in today's digital world. 

Whether you are a complete beginner looking to start your journey, an intermediate learner wanting to advance your skills, or an experienced professional seeking to stay updated with the latest trends and technologies, this course has something valuable for everyone.

Throughout this course, you will:
- Learn fundamental concepts and principles of ${topic}
- Master advanced techniques used by industry professionals
- Build real-world projects from scratch
- Understand best practices and industry standards
- Get hands-on experience with modern tools and frameworks
- Learn how to debug and optimize your code
- Understand how to deploy and maintain applications
- Work on capstone projects that showcase your skills
- Get feedback from experienced instructors
- Join a community of learners from around the world

This course is structured in a logical progression, starting from the basics and gradually advancing to more complex topics. Each section includes:
- Video lectures explaining concepts clearly
- Code examples you can follow along with
- Quizzes to test your understanding
- Assignments to practice your skills
- Real-world projects to apply what you've learned
- Discussion forums to ask questions and collaborate

By the end of this course, you will have:
- A deep understanding of ${topic}
- Practical experience building real applications
- A portfolio of projects to showcase to employers
- The confidence to tackle new challenges independently
- A network of fellow learners and mentors

The instructor has over 15 years of experience in the field and has trained thousands of students successfully. The course is regularly updated with the latest best practices and technologies.

Prerequisites for this course are minimal - you just need a computer, an internet connection, and the willingness to learn. No prior experience is necessary, though some basic computer knowledge is helpful.

Course Duration: 40-60 hours of content, flexible schedule
Updates: Regular updates with new content and improvements
Lifetime Access: Access to course materials for life
Certificate: Professional certificate upon completion
Support: Dedicated instructor support via forums and Q&A

What are you waiting for? Enroll today and start your journey to mastery!
  `.trim();
};

// Generate course data
const generateCourse = (index: number, instructorId: mongoose.Types.ObjectId): any => {
  const courseNumber = index + 1;
  const levels = ["Beginner", "Intermediate", "Advanced"];
  const courseTypes = ["live", "recorded"];
  const languages = ["English", "Bengali", "Bangla"];
  
  const titles = [
    "Complete Web Development",
    "Advanced JavaScript Mastery",
    "Python Programming Fundamentals",
    "React & Node.js Full Stack",
    "Data Science & Analytics",
    "Machine Learning Basics",
    "Cloud Computing with AWS",
    "Mobile App Development",
    "Cybersecurity Essentials",
    "DevOps & Docker",
    "Blockchain Development",
    "IoT & Embedded Systems",
    "Game Development Basics",
    "AI & Deep Learning",
    "Database Design & SQL"
  ];
  
  const categories = [
    "Technology",
    "Programming",
    "Data Science",
    "Web Development",
    "Mobile Development",
    "Cloud Computing",
    "AI & ML",
    "Cybersecurity"
  ];
  
  const title = `${titles[index % titles.length]} - Course ${courseNumber}`;
  const price = Math.floor(Math.random() * 10000) + 2000; // 2000 to 12000
  const discountPrice = Math.floor(price * 0.8);
  
  return {
    title,
    description: generateLargeDescription(title, index),
    category: categories[index % categories.length],
    type: courseTypes[index % courseTypes.length],
    price,
    discountPrice,
    thumbnail: `https://picsum.photos/600/400?random=${index}`,
    level: levels[index % levels.length],
    language: languages[index % languages.length],
    duration: Math.floor(Math.random() * 50) + 20,
    rating: Math.min(5, Math.random() * 2 + 3.5),
    ratingsCount: Math.floor(Math.random() * 500),
    studentsEnrolled: Math.floor(Math.random() * 5000),
    instructorId,
    isPublished: true,
    isFeatured: index < 50, // First 50 as featured
    isAdminApproved: true,
    isRegistrationOpen: true,
    registrationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    tags: [
      "professional",
      "hands-on",
      "industry-standard",
      "certificate",
      "updated-2025"
    ],
    learningOutcomes: [
      `Master the core concepts of ${title}`,
      `Build professional-grade projects`,
      `Get industry-ready with best practices`,
      `Earn a recognized certificate`,
      `Access lifetime learning materials`
    ],
    prerequisites: [
      `Basic computer literacy`,
      `Motivation to learn`
    ]
  };
};

// Generate modules for a course
const generateModules = (courseId: mongoose.Types.ObjectId, courseIndex: number): any[] => {
  const moduleCount = Math.floor(Math.random() * 8) + 4; // 4-12 modules
  const modules = [];
  
  const moduleTopics = [
    "Introduction & Basics",
    "Fundamentals",
    "Core Concepts",
    "Advanced Topics",
    "Practical Applications",
    "Best Practices",
    "Real-World Projects",
    "Optimization & Performance",
    "Integration & Deployment",
    "Troubleshooting & Debugging",
    "Case Studies",
    "Final Project & Recap"
  ];
  
  for (let i = 0; i < moduleCount; i++) {
    modules.push({
      courseId,
      title: moduleTopics[i % moduleTopics.length] + (i > 0 ? ` - Part ${Math.floor(i / moduleTopics.length) + 1}` : ""),
      description: `In-depth coverage of ${moduleTopics[i % moduleTopics.length].toLowerCase()}. This module contains comprehensive lessons and practical examples to help you master this section of the course.`,
      orderIndex: i,
      isPublished: true
    });
  }
  
  return modules;
};

// Generate lessons for a module
const generateLessons = (moduleId: mongoose.Types.ObjectId, moduleIndex: number): any[] => {
  const lessonCount = Math.floor(Math.random() * 10) + 5; // 5-15 lessons per module
  const lessons = [];
  
  const lessonTypes = ["video", "pdf", "quiz", "assignment", "article"];
  const lessonTitles = [
    "Introduction to the Topic",
    "Understanding Core Concepts",
    "Getting Started",
    "Advanced Techniques",
    "Hands-on Practice",
    "Real-world Examples",
    "Common Mistakes & Solutions",
    "Best Practices",
    "Case Study Analysis",
    "Quiz & Assessment",
    "Assignment Project",
    "Q&A & Discussion",
    "Optimization Strategies",
    "Deployment Guide",
    "Wrap-up & Review"
  ];
  
  for (let i = 0; i < lessonCount; i++) {
    const lessonType = lessonTypes[i % lessonTypes.length];
    lessons.push({
      moduleId,
      title: lessonTitles[i % lessonTitles.length],
      description: `Comprehensive lesson on ${lessonTitles[i % lessonTitles.length].toLowerCase()}. This lesson covers all essential aspects with examples and practical applications.`,
      type: lessonType,
      contentUrl: lessonType === "video" ? `https://www.youtube.com/watch?v=video${moduleIndex}-${i}` : "",
      duration: lessonType === "video" ? Math.floor(Math.random() * 60) + 15 : null,
      orderIndex: i,
      isPublished: true,
      isFreePreview: i === 0 // First lesson is free preview
    });
  }
  
  return lessons;
};

async function seed500Courses() {
  let conn: any = null;
  try {
    console.log("🚀 Starting seed for 500 courses with modules and lessons...");
    
    conn = await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check or create instructor
    let instructor = await User.findOne({ email: "test@gmail.com" });
    
    if (!instructor) {
      console.log("📝 Creating instructor: test@gmail.com");
      const hashedPassword = await bcrypt.hash("123456", 10);
      instructor = await User.create({
        name: "Test Instructor",
        email: "test@gmail.com",
        password: hashedPassword,
        phone: "1234567890",
        role: "instructor",
        isVerified: true,
        isApproved: true,
        bio: "Professional instructor with 15+ years of experience",
        expertise: ["Web Development", "Programming", "Data Science"],
        qualification: "M.Tech in Computer Science",
        institution: "Learn Grow Academy",
        yearsOfExperience: 15
      });
      console.log("✅ Instructor created:", instructor.email);
    } else {
      console.log("✅ Instructor already exists:", instructor.email);
    }

    // Clear existing courses for this instructor (optional - comment out to keep old data)
    const deleteResult = await Course.deleteMany({ instructorId: instructor._id });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing courses`);

    // Create 500 courses with modules and lessons
    console.log("📚 Creating 500 courses...");
    const courses = [];
    const allModules: any[] = [];
    const allLessons: any[] = [];

    for (let i = 0; i < 500; i++) {
      // Create course
      const courseData = generateCourse(i, instructor._id);
      const course = await Course.create(courseData);
      courses.push(course);

      // Generate and create modules
      const modulesData = generateModules(course._id, i);
      const createdModules = await Module.insertMany(modulesData);
      allModules.push(...createdModules);

      // Generate and create lessons for each module
      for (let j = 0; j < createdModules.length; j++) {
        const lessonsData = generateLessons(createdModules[j]._id, j);
        const createdLessons = await Lesson.insertMany(lessonsData);
        allLessons.push(...createdLessons);
      }

      // Log progress every 50 courses
      if ((i + 1) % 50 === 0) {
        console.log(`  ✅ Created ${i + 1} courses with modules and lessons`);
      }
    }

    console.log("\n📊 Seeding Complete!");
    console.log(`  ✅ Courses: ${courses.length}`);
    console.log(`  ✅ Modules: ${allModules.length}`);
    console.log(`  ✅ Lessons: ${allLessons.length}`);
    console.log(`  ✅ Instructor: ${instructor.email}`);
    console.log(`  ✅ All courses: Published & Admin Approved`);
    console.log("\n🎉 Seeding successful! All 500 courses created.");

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

// Run the seed
seed500Courses();
