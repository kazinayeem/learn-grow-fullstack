import mongoose from "mongoose";
import dotenv from "dotenv";
import { Course } from "../modules/course/model/course.model";
import { Module } from "../modules/course/model/module.model";
import { Lesson } from "../modules/course/model/lesson.model";
import { User } from "../modules/user/model/user.model";

// Load environment variables
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

async function createRoboticsCourse() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Find demo instructor
        const instructor = await User.findOne({ email: "instructor@learngrow.com" });
        if (!instructor) throw new Error("Demo instructor not found");

        // Create a robotics course
        const course = await Course.create({
            title: "Robotics for Kids - Build Your First Robot",
            description: "An exciting hands-on course where kids learn robotics, electronics, and programming by building real robots! Perfect for ages 8-14. No prior experience needed - just curiosity and creativity!",
            category: "Robotics",
            type: "live",
            price: 8500,
            discountPrice: 5999,
            thumbnail: "https://images.unsplash.com/photo-1535378433864-ed1c29cee23d?auto=format&fit=crop&w=600&q=80",
            level: "Beginner",
            language: "Bangla & English",
            duration: 40, // hours
            rating: 4.8,
            ratingsCount: 85,
            studentsEnrolled: 220,
            instructorId: instructor._id,
            isPublished: true,
            isFeatured: true,
            isAdminApproved: true,
            isRegistrationOpen: true,
            registrationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            tags: ["robotics", "kids", "stem", "electronics", "arduino", "programming"],
            learningOutcomes: [
                "Build and program your own robot from scratch",
                "Understand basic electronics and circuits",
                "Learn block-based and text-based programming",
                "Develop problem-solving and creative thinking skills",
                "Work with sensors, motors, and microcontrollers"
            ],
            prerequisites: [
                "Age 8-14 years (or curious adults!)",
                "No prior experience needed",
                "Robotics kit will be provided"
            ]
        });
        console.log("✅ Robotics course created:", course.title);

        // Create modules
        const modules = await Module.insertMany([
            {
                courseId: course._id,
                title: "Welcome to Robotics World",
                description: "Introduction to robotics, what we'll build, and safety basics.",
                orderIndex: 0,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Electronics Fundamentals",
                description: "Learn about circuits, LEDs, resistors, and breadboards.",
                orderIndex: 1,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Programming Your Robot",
                description: "Block coding and Arduino basics for robot control.",
                orderIndex: 2,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Building Your First Robot",
                description: "Assemble and program a complete robot with sensors.",
                orderIndex: 3,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Advanced Projects & Challenges",
                description: "Line follower, obstacle avoider, and custom projects.",
                orderIndex: 4,
                isPublished: true
            }
        ]);
        console.log("✅ Modules created:", modules.map(m => m.title));

        // Create lessons for each module
        const lessons = [
            // Module 1: Welcome to Robotics World
            {
                moduleId: modules[0]._id,
                title: "What is a Robot?",
                description: "Discover different types of robots and how they work in real life.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=gfRf43JKTtA",
                duration: 15,
                orderIndex: 0,
                isPublished: true,
                isFreePreview: true
            },
            {
                moduleId: modules[0]._id,
                title: "Your Robotics Kit Tour",
                description: "Unbox and explore all the components in your robotics kit.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=nL34zDTPkcs",
                duration: 20,
                orderIndex: 1,
                isPublished: true,
                isFreePreview: true
            },
            {
                moduleId: modules[0]._id,
                title: "Safety First!",
                description: "Important safety rules when working with electronics.",
                type: "article",
                contentUrl: "https://www.arduino.cc/en/Guide/Safety",
                duration: 10,
                orderIndex: 2,
                isPublished: true
            },

            // Module 2: Electronics Fundamentals
            {
                moduleId: modules[1]._id,
                title: "Understanding Electricity",
                description: "Learn about voltage, current, and how electricity flows.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=mc979OhitAg",
                duration: 25,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[1]._id,
                title: "Your First Circuit - Blinking LED",
                description: "Build a simple circuit to make an LED blink!",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=fCxzA9_kg6s",
                duration: 30,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[1]._id,
                title: "Breadboard Basics",
                description: "How to use a breadboard for building circuits.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=6WReFkfrUIk",
                duration: 20,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[1]._id,
                title: "Resistors and LEDs",
                description: "Understanding components and color codes.",
                type: "article",
                contentUrl: "https://www.electronics-tutorials.ws/resistor/res_2.html",
                duration: 15,
                orderIndex: 3,
                isPublished: true
            },

            // Module 3: Programming Your Robot
            {
                moduleId: modules[2]._id,
                title: "Introduction to Arduino",
                description: "Meet the brain of your robot - the Arduino board!",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=nL34zDTPkcs",
                duration: 25,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[2]._id,
                title: "Block Coding with Scratch",
                description: "Learn programming with fun visual blocks.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=jXUZaf5D12A",
                duration: 35,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[2]._id,
                title: "Your First Arduino Program",
                description: "Upload code to make your Arduino blink an LED.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=fJWR7dBuc18",
                duration: 30,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[2]._id,
                title: "Sensors and Input",
                description: "How robots sense the world - buttons, sensors, and more.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=dXmKCOlnDRw",
                duration: 25,
                orderIndex: 3,
                isPublished: true
            },
            {
                moduleId: modules[2]._id,
                title: "Motors and Movement",
                description: "Control DC motors and servo motors for robot movement.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=_1q0kLMqw0E",
                duration: 30,
                orderIndex: 4,
                isPublished: true
            },

            // Module 4: Building Your First Robot
            {
                moduleId: modules[3]._id,
                title: "Robot Chassis Assembly",
                description: "Put together the body and wheels of your robot.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=7vhvnaWUZjE",
                duration: 40,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[3]._id,
                title: "Wiring the Motors",
                description: "Connect motors to the motor driver and Arduino.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=dyjo_ggEtVU",
                duration: 35,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[3]._id,
                title: "Adding Sensors",
                description: "Install ultrasonic sensor for obstacle detection.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=6F1B_N6LuKw",
                duration: 30,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[3]._id,
                title: "Programming Robot Movement",
                description: "Write code to make your robot move forward, backward, and turn.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=1n_KjpMfVT0",
                duration: 45,
                orderIndex: 3,
                isPublished: true
            },
            {
                moduleId: modules[3]._id,
                title: "Testing Your Robot",
                description: "Debug, test, and improve your robot's performance.",
                type: "assignment",
                contentUrl: "https://github.com/your-org/robot-testing-guide",
                duration: 60,
                orderIndex: 4,
                isPublished: true
            },

            // Module 5: Advanced Projects & Challenges
            {
                moduleId: modules[4]._id,
                title: "Line Follower Robot",
                description: "Build a robot that follows a black line on the ground.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=1n_KjpMfVT0",
                duration: 50,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[4]._id,
                title: "Obstacle Avoiding Robot",
                description: "Program your robot to detect and avoid obstacles automatically.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=KtsWZPp0Z-w",
                duration: 45,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[4]._id,
                title: "Bluetooth Controlled Robot",
                description: "Control your robot wirelessly using a smartphone app.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=RPO6vZB_YKI",
                duration: 40,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[4]._id,
                title: "Robot Dance Challenge",
                description: "Program your robot to perform a choreographed dance routine!",
                type: "assignment",
                contentUrl: "https://github.com/your-org/robot-dance-challenge",
                duration: 90,
                orderIndex: 3,
                isPublished: true
            },
            {
                moduleId: modules[4]._id,
                title: "Final Project Showcase",
                description: "Design and build your own unique robot project.",
                type: "assignment",
                contentUrl: "https://github.com/your-org/robotics-final-project",
                duration: 120,
                orderIndex: 4,
                isPublished: true
            }
        ];
        await Lesson.insertMany(lessons);
        console.log("✅ Lessons created for all modules");

        console.log("🎉 Robotics course, modules, and lessons created successfully!");
        console.log(`📚 Course: ${course.title}`);
        console.log(`📦 Modules: ${modules.length}`);
        console.log(`📝 Lessons: ${lessons.length}`);
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Error creating robotics course:", error.message);
        process.exit(1);
    }
}

createRoboticsCourse();
