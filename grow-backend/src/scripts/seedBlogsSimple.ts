import mongoose from "mongoose";
import { Blog } from "@/modules/blog/model/blog.model";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://admin:admin123@localhost:27017/modular_db?authSource=admin";
const AUTHOR_ID = "695007e4d3d2029a8735238f";
const CATEGORY_ID = "6950ef3fbd244256d24db01f";

// Blog titles
const blogTitles = [
  "Getting Started with Web Development",
  "Advanced CSS Techniques for Modern Web Design",
  "JavaScript ES6+ Features You Should Know",
  "Building Responsive Websites",
  "RESTful API Design Best Practices",
  "Introduction to React and Component Architecture",
  "Vue.js: Progressive JavaScript Framework",
  "Angular: Enterprise-Grade Web Framework",
  "Mobile App Development Fundamentals",
  "iOS Development with Swift",
  "Android Development with Kotlin",
  "Cross-Platform Mobile Development with React Native",
  "Flutter: Building Beautiful Mobile Apps",
  "Introduction to Machine Learning",
  "Deep Learning and Neural Networks",
  "Natural Language Processing Basics",
  "Computer Vision Applications",
  "Data Science Workflow and Tools",
  "Python for Data Science",
  "Pandas and Data Manipulation",
  "NumPy for Numerical Computing",
  "Data Visualization with Matplotlib and Seaborn",
  "Cloud Computing Fundamentals",
  "AWS Services Overview",
  "Azure Solutions Architecture",
  "Google Cloud Platform Essentials",
  "Docker and Containerization",
  "Kubernetes Orchestration",
  "DevOps Practices and Tools",
  "CI/CD Pipeline Implementation",
  "Git Version Control Mastery",
  "Database Design Principles",
  "SQL Query Optimization",
  "MongoDB NoSQL Database",
  "Redis Caching Solutions",
  "System Design Interviews",
  "Microservices Architecture",
  "API Gateway Implementation",
  "Cybersecurity Fundamentals",
  "Network Security Essentials",
  "Web Application Security",
  "OWASP Top 10 Vulnerabilities",
  "Encryption and Data Protection",
  "Ethical Hacking Basics",
  "Penetration Testing Guide",
  "Artificial Intelligence Overview",
  "Machine Learning Algorithms",
  "Supervised vs Unsupervised Learning",
  "Time Series Forecasting",
  "Computer Science Fundamentals",
  "Algorithm Design and Analysis",
];

const generateContent = (title: string): string => {
  return `
    <h2>${title}</h2>
    <p>This comprehensive guide covers all the essential aspects of this topic. Whether you are a beginner just starting your journey or an experienced professional looking to deepen your knowledge, this article provides valuable insights and practical advice.</p>
    
    <h3>Why This Matters</h3>
    <p>This topic is increasingly important in today's technology landscape. Understanding its principles and best practices can significantly enhance your career prospects and technical capabilities.</p>
    
    <h3>Key Concepts</h3>
    <ul>
      <li>Master the fundamentals</li>
      <li>Understand industry best practices and standards</li>
      <li>Stay updated with the latest trends and technologies</li>
      <li>Gain practical experience through hands-on projects</li>
    </ul>
    
    <h3>Getting Started</h3>
    <p>Begin with the basics and gradually move towards advanced concepts. Build real projects to solidify your knowledge and create a portfolio that showcases your skills to potential employers. Remember that consistent practice and continuous improvement are key to success in this field.</p>
    
    <h3>Best Practices</h3>
    <p>Always follow industry standards and use proven patterns. Test thoroughly before deployment. Keep learning and stay updated with new developments. Collaborate with other professionals and contribute to the community.</p>
  `;
};

const seedBlogs = async () => {
  const client = new mongoose.mongo.MongoClient(MONGO_URI, {
    maxPoolSize: 10,
  });

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    const db = client.db();
    const blogsCollection = db.collection("blogs");

    console.log("✅ Connected to MongoDB");

    // Delete existing blogs
    const deleteResult = await blogsCollection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing blogs`);

    // Create blog documents
    const blogs = blogTitles.map((title) => ({
      title,
      content: generateContent(title),
      excerpt: `Learn about ${title.toLowerCase()}. This comprehensive guide covers essential concepts and best practices.`,
      author: new mongoose.Types.ObjectId(AUTHOR_ID),
      category: new mongoose.Types.ObjectId(CATEGORY_ID),
      image: "https://picsum.photos/1080/720",
      slug: title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 100),
      isPublished: true,
      isApproved: true,
      metaTags: ["technology", "tutorial", "guide", "learning"],
      readTime: Math.floor(Math.random() * 10) + 5,
      viewCount: Math.floor(Math.random() * 500),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    }));

    // Insert blogs
    console.log(`Inserting ${blogs.length} blogs...`);
    const insertResult = await blogsCollection.insertMany(blogs);
    console.log(`✅ Successfully inserted ${Object.keys(insertResult.insertedIds).length} blogs!`);

    // Verify insertion
    const count = await blogsCollection.countDocuments({});
    console.log(`✅ Total blogs in database: ${count}`);

    console.log("\n✅ Blog seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding blogs:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
};

// Run the seed
seedBlogs();
