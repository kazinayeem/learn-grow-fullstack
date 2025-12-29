import mongoose from "mongoose";
import dotenv from "dotenv";
import { Course } from "../modules/course/model/course.model";
import { Module } from "../modules/course/model/module.model";
import { Lesson } from "../modules/course/model/lesson.model";
import { User } from "../modules/user/model/user.model";

// Load environment variables
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

async function createPythonCourse() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Find demo instructor
        const instructor = await User.findOne({ email: "instructor@learngrow.com" });
        if (!instructor) throw new Error("Demo instructor not found");

        // Create a Python programming course
        const course = await Course.create({
            title: "Python Programming - From Zero to Hero",
            description: "Master Python programming from scratch! Learn by building real projects including games, web scrapers, data analysis tools, and automation scripts. Perfect for complete beginners who want to start their coding journey.",
            category: "Programming",
            type: "live",
            price: 6500,
            discountPrice: 3999,
            thumbnail: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?auto=format&fit=crop&w=600&q=80",
            level: "Beginner",
            language: "Bangla & English",
            duration: 45, // hours
            rating: 4.9,
            ratingsCount: 245,
            studentsEnrolled: 580,
            instructorId: instructor._id,
            isPublished: true,
            isFeatured: true,
            isAdminApproved: true,
            isRegistrationOpen: true,
            registrationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            tags: ["python", "programming", "coding", "beginner", "projects", "automation"],
            learningOutcomes: [
                "Write Python code from scratch with confidence",
                "Build real-world projects and games",
                "Understand programming fundamentals and logic",
                "Work with files, APIs, and databases",
                "Automate boring tasks and save time",
                "Prepare for advanced topics like AI and Data Science"
            ],
            prerequisites: [
                "A computer (Windows, Mac, or Linux)",
                "Basic computer skills (typing, browsing)",
                "No prior programming experience needed!"
            ]
        });
        console.log("✅ Python course created:", course.title);

        // Create modules
        const modules = await Module.insertMany([
            {
                courseId: course._id,
                title: "Getting Started with Python",
                description: "Introduction, installation, and your first Python program.",
                orderIndex: 0,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Python Basics",
                description: "Variables, data types, operators, and basic input/output.",
                orderIndex: 1,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Control Flow & Logic",
                description: "If statements, loops, and decision making in code.",
                orderIndex: 2,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Functions & Modules",
                description: "Write reusable code with functions and import modules.",
                orderIndex: 3,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Data Structures",
                description: "Lists, tuples, dictionaries, and sets in Python.",
                orderIndex: 4,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "File Handling & APIs",
                description: "Read/write files and work with external data sources.",
                orderIndex: 5,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Object-Oriented Programming",
                description: "Classes, objects, inheritance, and OOP concepts.",
                orderIndex: 6,
                isPublished: true
            },
            {
                courseId: course._id,
                title: "Real-World Projects",
                description: "Build complete projects to showcase your skills.",
                orderIndex: 7,
                isPublished: true
            }
        ]);
        console.log("✅ Modules created:", modules.map(m => m.title));

        // Create lessons for each module
        const lessons = [
            // Module 1: Getting Started with Python
            {
                moduleId: modules[0]._id,
                title: "Why Learn Python?",
                description: "Discover why Python is the best language for beginners and its real-world applications.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=Y8Tko2YC5hA",
                duration: 15,
                orderIndex: 0,
                isPublished: true,
                isFreePreview: true
            },
            {
                moduleId: modules[0]._id,
                title: "Installing Python & VS Code",
                description: "Step-by-step guide to set up your Python development environment.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=VuKvR1J2LQE",
                duration: 20,
                orderIndex: 1,
                isPublished: true,
                isFreePreview: true
            },
            {
                moduleId: modules[0]._id,
                title: "Your First Python Program",
                description: "Write and run 'Hello World' and understand how Python code works.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
                duration: 15,
                orderIndex: 2,
                isPublished: true
            },

            // Module 2: Python Basics
            {
                moduleId: modules[1]._id,
                title: "Variables and Data Types",
                description: "Learn about strings, numbers, booleans, and how to store data.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=LKYFdHUuKEw",
                duration: 30,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[1]._id,
                title: "String Operations",
                description: "Manipulate text with string methods and formatting.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo",
                duration: 25,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[1]._id,
                title: "Math Operations & Operators",
                description: "Perform calculations and use arithmetic operators.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=v5MR5JnKcZI",
                duration: 20,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[1]._id,
                title: "Getting User Input",
                description: "Make interactive programs that respond to user input.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=rBqHLAXJdCA",
                duration: 15,
                orderIndex: 3,
                isPublished: true
            },

            // Module 3: Control Flow & Logic
            {
                moduleId: modules[2]._id,
                title: "If-Else Statements",
                description: "Make decisions in your code with conditional statements.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=AWek49wXGzI",
                duration: 25,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[2]._id,
                title: "Comparison & Logical Operators",
                description: "Compare values and combine conditions with and/or/not.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=7r0B8cNL_Lk",
                duration: 20,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[2]._id,
                title: "While Loops",
                description: "Repeat code blocks with while loops and avoid infinite loops.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
                duration: 25,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[2]._id,
                title: "For Loops & Range",
                description: "Iterate over sequences with for loops and the range function.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=94UHCEmprCY",
                duration: 30,
                orderIndex: 3,
                isPublished: true
            },
            {
                moduleId: modules[2]._id,
                title: "Project: Number Guessing Game",
                description: "Build a fun game using loops and conditionals.",
                type: "assignment",
                contentUrl: "https://github.com/your-org/python-guessing-game",
                duration: 45,
                orderIndex: 4,
                isPublished: true
            },

            // Module 4: Functions & Modules
            {
                moduleId: modules[3]._id,
                title: "Creating Functions",
                description: "Write reusable code blocks with functions and parameters.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=NE97ylAnrz4",
                duration: 30,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[3]._id,
                title: "Return Values & Scope",
                description: "Understand function returns and variable scope.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=BVfCWuca9nw",
                duration: 25,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[3]._id,
                title: "Built-in Functions",
                description: "Explore Python's powerful built-in functions like len, max, min.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=gOMW_n2-2Mw",
                duration: 20,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[3]._id,
                title: "Importing Modules",
                description: "Use external libraries and create your own modules.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=CqvZ3vGoGs0",
                duration: 25,
                orderIndex: 3,
                isPublished: true
            },

            // Module 5: Data Structures
            {
                moduleId: modules[4]._id,
                title: "Lists - The Basics",
                description: "Store multiple items in lists and access them by index.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=tw7ror9x32s",
                duration: 30,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[4]._id,
                title: "List Methods & Operations",
                description: "Add, remove, sort, and manipulate list items.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=1yUn-ydsgKk",
                duration: 25,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[4]._id,
                title: "Tuples & Sets",
                description: "Learn about immutable tuples and unique sets.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=Mf7eFtbVxFM",
                duration: 20,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[4]._id,
                title: "Dictionaries - Key-Value Pairs",
                description: "Store and retrieve data using dictionaries.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=XCcpzWs-CI4",
                duration: 30,
                orderIndex: 3,
                isPublished: true
            },
            {
                moduleId: modules[4]._id,
                title: "List Comprehensions",
                description: "Write elegant one-line loops with list comprehensions.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=AhSvKGTh28Q",
                duration: 25,
                orderIndex: 4,
                isPublished: true
            },

            // Module 6: File Handling & APIs
            {
                moduleId: modules[5]._id,
                title: "Reading Files",
                description: "Open and read text files in Python.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=Uh2ebFW8OYM",
                duration: 25,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[5]._id,
                title: "Writing to Files",
                description: "Create and write data to files.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=aequTxAvQq4",
                duration: 20,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[5]._id,
                title: "Working with CSV Files",
                description: "Read and write CSV files for data storage.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=q5uM4VKywbA",
                duration: 30,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[5]._id,
                title: "JSON Data Handling",
                description: "Parse and create JSON data in Python.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=pTT7HMqDnJw",
                duration: 25,
                orderIndex: 3,
                isPublished: true
            },
            {
                moduleId: modules[5]._id,
                title: "API Requests with Python",
                description: "Fetch data from web APIs using the requests library.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=tb8gHvYlCFs",
                duration: 35,
                orderIndex: 4,
                isPublished: true
            },

            // Module 7: Object-Oriented Programming
            {
                moduleId: modules[6]._id,
                title: "Introduction to OOP",
                description: "Understand classes, objects, and why OOP matters.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=Ej_02ICOIgs",
                duration: 30,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[6]._id,
                title: "Creating Classes & Objects",
                description: "Define your own classes and create object instances.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=apACNr7DC_s",
                duration: 35,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[6]._id,
                title: "Methods & Attributes",
                description: "Add functionality and data to your classes.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=rJzjDszODTI",
                duration: 30,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[6]._id,
                title: "Inheritance & Polymorphism",
                description: "Extend classes and reuse code with inheritance.",
                type: "video",
                contentUrl: "https://www.youtube.com/watch?v=Cn7AkDb4pIU",
                duration: 35,
                orderIndex: 3,
                isPublished: true
            },

            // Module 8: Real-World Projects
            {
                moduleId: modules[7]._id,
                title: "Project 1: To-Do List App",
                description: "Build a command-line to-do list with file storage.",
                type: "assignment",
                contentUrl: "https://github.com/your-org/python-todo-app",
                duration: 90,
                orderIndex: 0,
                isPublished: true
            },
            {
                moduleId: modules[7]._id,
                title: "Project 2: Weather App",
                description: "Fetch and display weather data using an API.",
                type: "assignment",
                contentUrl: "https://github.com/your-org/python-weather-app",
                duration: 90,
                orderIndex: 1,
                isPublished: true
            },
            {
                moduleId: modules[7]._id,
                title: "Project 3: Password Manager",
                description: "Create a secure password storage application.",
                type: "assignment",
                contentUrl: "https://github.com/your-org/python-password-manager",
                duration: 120,
                orderIndex: 2,
                isPublished: true
            },
            {
                moduleId: modules[7]._id,
                title: "Project 4: Web Scraper",
                description: "Extract data from websites automatically.",
                type: "assignment",
                contentUrl: "https://github.com/your-org/python-web-scraper",
                duration: 120,
                orderIndex: 3,
                isPublished: true
            },
            {
                moduleId: modules[7]._id,
                title: "Final Capstone Project",
                description: "Design and build your own Python application from scratch!",
                type: "assignment",
                contentUrl: "https://github.com/your-org/python-capstone-project",
                duration: 180,
                orderIndex: 4,
                isPublished: true
            }
        ];
        await Lesson.insertMany(lessons);
        console.log("✅ Lessons created for all modules");

        console.log("🎉 Python course, modules, and lessons created successfully!");
        console.log(`📚 Course: ${course.title}`);
        console.log(`📦 Modules: ${modules.length}`);
        console.log(`📝 Lessons: ${lessons.length}`);
        process.exit(0);
    } catch (error: any) {
        console.error("❌ Error creating Python course:", error.message);
        process.exit(1);
    }
}

createPythonCourse();
