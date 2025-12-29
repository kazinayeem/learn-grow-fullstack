import mongoose from "mongoose";
import { Blog } from "../modules/blog/model/blog.model";
import { BlogCategory } from "../modules/blog/model/blog-category.model";
import { User } from "../modules/user/model/user.model";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

// Rich text content templates with substantial paragraphs
const richTextTemplates = [
  `<h2>Introduction to Modern Development</h2><p>In today's rapidly evolving digital landscape, staying updated with the latest technologies and best practices is crucial for success. Whether you're a beginner just starting your coding journey or an experienced developer looking to enhance your skills, understanding the fundamentals of modern development is essential.</p><p>This comprehensive guide will walk you through the essential concepts, tools, and methodologies that every developer should know. We'll explore best practices, industry standards, and practical techniques that have been proven effective by leading tech companies around the world.</p><h2>Core Concepts</h2><p>Modern development is built on several fundamental principles that have stood the test of time. These include clean code practices, design patterns, testing methodologies, and performance optimization. By mastering these concepts, you'll be able to write more efficient, maintainable, and scalable code.</p><p>The importance of understanding these core concepts cannot be overstated. They form the foundation upon which all successful projects are built, and they help developers avoid common pitfalls and technical debt that can plague projects later in their lifecycle.</p><h2>Practical Applications</h2><p>Learning theory is important, but nothing beats hands-on experience. In this section, we'll explore practical applications of these concepts through real-world examples and case studies. You'll see how leading companies implement these practices and how you can apply similar techniques to your own projects.</p><p>Through practical examples and detailed explanations, you'll gain the confidence to implement these practices in your own work. We'll cover everything from project setup to deployment, ensuring you have a complete understanding of the development workflow.</p>`,
  
  `<h2>Mastering Advanced Techniques</h2><p>As you progress in your development career, you'll encounter increasingly complex challenges that require advanced techniques and deep technical knowledge. This guide is designed to help you master these advanced concepts and take your skills to the next level.</p><p>Advanced development techniques often require a combination of theoretical knowledge and practical experience. We'll explore how to approach complex problems methodically, break them down into manageable pieces, and implement elegant solutions that are both efficient and maintainable.</p><h2>Performance Optimization</h2><p>Performance is a critical aspect of modern development. Users expect fast, responsive applications, and search engines reward sites that load quickly. In this section, we'll explore various optimization techniques that can dramatically improve your application's performance.</p><p>From database query optimization to front-end rendering techniques, we'll cover a wide range of optimization strategies. You'll learn how to identify bottlenecks, measure performance improvements, and implement changes that have a real impact on user experience.</p><h2>Scaling and Architecture</h2><p>As your application grows, scalability becomes increasingly important. We'll discuss architectural patterns and design decisions that enable your application to handle growing user bases and increasing data volumes. From microservices to caching strategies, you'll learn how to build systems that can scale effectively.</p>`,
  
  `<h2>Best Practices in Code Design</h2><p>Writing good code is more than just making things work. It's about creating code that is readable, maintainable, and easy to understand by other developers. This guide explores the best practices that have been refined over decades of software development.</p><p>Clean code is not just about personal preference; it's a professional responsibility. Code is read far more often than it is written, and taking the time to write clean, well-organized code saves time and money in the long run. Your future self and your team members will thank you for it.</p><h2>Design Patterns and Principles</h2><p>Design patterns are proven solutions to common problems in software design. By using established patterns, you can avoid reinventing the wheel and benefit from the collective wisdom of the software development community. We'll explore the most important patterns and how to apply them effectively.</p><p>Understanding SOLID principles, KISS (Keep It Simple, Stupid), DRY (Don't Repeat Yourself), and other fundamental principles will help you make better design decisions. These principles guide you toward creating flexible, maintainable code that can adapt to changing requirements.</p><h2>Testing and Quality Assurance</h2><p>Comprehensive testing is essential for building reliable software. We'll discuss different testing approaches, from unit testing to integration testing, and show you how to implement effective testing strategies. Good tests not only catch bugs but also serve as documentation for your code.</p><p>Quality assurance is an ongoing process, not something that happens only at the end of development. By incorporating testing from the beginning and maintaining high testing standards throughout your project, you'll build more reliable and robust applications.</p>`,
  
  `<h2>The Future of Technology</h2><p>The tech industry is constantly evolving, with new technologies and frameworks emerging regularly. Staying ahead of these changes is important for career growth and professional development. In this guide, we'll explore emerging trends and discuss how to prepare for the future of technology.</p><p>While it's impossible to predict the future with certainty, we can identify trends and patterns that suggest where technology is heading. By understanding these trends, you can make informed decisions about what skills to develop and what technologies to focus on.</p><h2>Emerging Technologies</h2><p>From artificial intelligence and machine learning to blockchain and quantum computing, there are numerous emerging technologies that are reshaping the industry. We'll discuss how these technologies work, their potential applications, and how they might affect the development landscape.</p><p>The key to adapting to new technologies is maintaining a growth mindset and staying curious. By continuously learning and experimenting with new tools and frameworks, you'll be better prepared to adapt to whatever changes come next.</p><h2>Preparing for Tomorrow</h2><p>The best way to prepare for the future is to focus on developing fundamental skills and understanding core concepts. While specific technologies may become obsolete, the underlying principles of good software design remain constant. By mastering these fundamentals, you'll be better equipped to learn new technologies as they emerge.</p><p>Invest in your professional development, stay connected with the community, and never stop learning. The developers who thrive are those who embrace change and view challenges as opportunities for growth and learning.</p>`,
];

// Blog post titles
const blogTitles = [
  "Complete Guide to Modern Web Development",
  "Mastering Async Programming in JavaScript",
  "Building Scalable Applications with Node.js",
  "React Hooks: A Deep Dive into Modern Patterns",
  "Understanding TypeScript Type System",
  "Database Design Best Practices",
  "Introduction to Cloud Computing",
  "API Design Patterns and Best Practices",
  "Security Fundamentals for Web Developers",
  "Performance Optimization Techniques",
  "Testing Strategies for Large Projects",
  "Containerization with Docker",
  "Kubernetes: Orchestrating Your Containers",
  "Microservices Architecture Explained",
  "Event-Driven Architecture",
  "Design Patterns Every Developer Should Know",
  "REST vs GraphQL: Choosing the Right API",
  "Authentication and Authorization in Web Apps",
  "Building Real-Time Applications",
  "Data Structures and Algorithms Essentials",
];

const blogCategories = [
  "Web Development",
  "Backend Development",
  "Frontend Development",
  "DevOps",
  "Database",
  "Security",
  "Performance",
  "Best Practices",
  "Architecture",
  "Cloud Computing",
  "Mobile Development",
  "AI & Machine Learning",
  "Tutorials",
  "Career Development",
  "Tools & Technologies",
];

const keywords = [
  "development", "code", "programming", "tutorial", "guide", "learning",
  "skills", "techniques", "best practices", "optimization", "performance",
  "architecture", "design", "implementation", "workflow", "process",
  "tools", "frameworks", "libraries", "platforms", "systems",
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(getRandomItem(array));
  }
  return items;
}

function generateRichContent(): string {
  return getRandomItem(richTextTemplates);
}

function generateExcerpt(): string {
  const excerpts = [
    "Explore comprehensive insights into modern development practices and techniques that can transform your coding journey and improve your project outcomes.",
    "Discover essential strategies for building robust, scalable applications with proven methodologies and industry best practices.",
    "Learn advanced concepts and practical techniques from experienced professionals in the field.",
    "A deep dive into the tools, frameworks, and approaches that leading tech companies use to build world-class applications.",
    "Understand the fundamental principles that guide successful software development and how to apply them in your projects.",
    "Master the art of writing clean, maintainable code that stands the test of time and adapts to changing requirements.",
    "Explore real-world examples and case studies that demonstrate effective implementation of modern development practices.",
    "Comprehensive guide to improving code quality, performance, and maintainability in your projects.",
    "Learn from industry experts about the latest trends, tools, and technologies shaping the future of development.",
    "Practical guide to implementing best practices and avoiding common pitfalls in software development.",
  ];
  return getRandomItem(excerpts);
}

async function seedBlogs() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing blogs
    console.log("🗑️  Clearing existing blogs...");
    await Blog.deleteMany({});
    console.log("✅ Blogs cleared");

    // Ensure categories exist
    console.log("📂 Setting up blog categories...");
    const categoryData = blogCategories.map((name) => ({
      name,
      slug: generateSlug(name),
      description: `Collection of articles and tutorials about ${name.toLowerCase()}`,
    }));

    const createdCategories = await BlogCategory.insertMany(categoryData, {
      ordered: false,
    }).catch((err) => {
      // Some categories might already exist, that's ok
      return categoryData.map((cat) => ({ _id: undefined, ...cat }));
    });

    // Get all categories from database (in case some were already there)
    const allCategories = await BlogCategory.find({});
    console.log(`✅ ${allCategories.length} blog categories available`);

    // Find or create author user
    let authorUser = await User.findOne({ role: "admin" });
    if (!authorUser) {
      console.log("👤 Creating admin user for blogs...");
      authorUser = await User.create({
        name: "Blog Admin",
        phone: "+8801234567890",
        email: "admin@learngrow.com",
        role: "admin",
        password: "admin123",
        isVerified: true,
      });
    }
    console.log(`✅ Using author: ${authorUser.name}`);

    // Create 500 blogs
    console.log("✏️  Creating 500 blog posts...");
    const blogData = [];
    const baseDate = new Date();

    for (let i = 1; i <= 500; i++) {
      const titleIndex = (i - 1) % blogTitles.length;
      const categoryIndex = (i - 1) % allCategories.length;
      const title = `${blogTitles[titleIndex]} - Part ${Math.ceil(i / blogTitles.length)}`;
      const slug = generateSlug(title) + `-${i}`;

      const blogDate = new Date(baseDate);
      blogDate.setDate(blogDate.getDate() - Math.floor(Math.random() * 365)); // Random date in past year

      blogData.push({
        title,
        content: generateRichContent(),
        excerpt: generateExcerpt(),
        author: authorUser._id,
        category: allCategories[categoryIndex]._id,
        metaTags: getRandomItems(keywords, Math.floor(Math.random() * 3) + 3),
        image: `https://picsum.photos/800/400?random=${i}`,
        slug,
        isPublished: true, // All published
        isApproved: true, // All approved
        readTime: Math.floor(Math.random() * 20) + 5, // 5-25 minutes
        viewCount: Math.floor(Math.random() * 10000), // 0-10000 views
        createdAt: blogDate,
        updatedAt: blogDate,
      });
    }

    const createdBlogs = await Blog.insertMany(blogData);
    console.log(`✅ Created ${createdBlogs.length} blog posts`);

    // Get statistics
    const publishedCount = await Blog.countDocuments({ isPublished: true });
    const approvedCount = await Blog.countDocuments({ isApproved: true });
    const categoryCounts = await Blog.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    console.log("\n📊 ===== BLOG SEEDING COMPLETE =====");
    console.log(`✅ Total Blogs Created: ${createdBlogs.length}`);
    console.log(`✅ Published: ${publishedCount}`);
    console.log(`✅ Approved: ${approvedCount}`);
    console.log(`✅ Categories: ${allCategories.length}`);
    console.log(`✅ Author: ${authorUser.name}`);

    console.log("\n🎯 Blogs Created Successfully!");
    console.log("   - 500 blog posts with rich text content");
    console.log("   - All posts are published and approved");
    console.log("   - Distributed across 15 categories");
    console.log("   - Realistic metadata, tags, and view counts");

    console.log("\n💡 All blogs are ready to view on the blog page!");

    await mongoose.disconnect();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding blogs:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seeding
seedBlogs();
