import mongoose from "mongoose";
import { Blog } from "../modules/blog/model/blog.model";
import { BlogCategory } from "../modules/blog/model/blog-category.model";
import { User } from "../modules/user/model/user.model";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

// Working image URLs from Unsplash
const workingImages = [
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1488590012039-e59758a1a1c8?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560439513-74b037a25d84?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1573167243872-43c6433b9d40?w=800&h=400&fit=crop",
];

// Rich text content with images, bold, italic, links, lists
const richContentTemplates = [
  `<h2><strong>Understanding Modern JavaScript Development</strong></h2>
<p>In today's rapidly evolving tech landscape, <strong>JavaScript has become one of the most powerful and versatile programming languages</strong>. Whether you're building <em>web applications, mobile apps, or even server-side applications</em>, understanding JavaScript is essential for any developer.</p>
<img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400" alt="JavaScript Development" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Key Features of Modern JavaScript</strong></h3>
<ul>
<li><strong>ES6+ Features:</strong> Arrow functions, destructuring, async/await, and more</li>
<li><strong>Type Safety:</strong> With TypeScript integration for larger projects</li>
<li><strong>Performance:</strong> Optimized engines and execution models</li>
<li><strong>Community:</strong> Massive ecosystem with millions of packages</li>
<li><strong>Versatility:</strong> Works across frontend, backend, and mobile platforms</li>
</ul>
<p>For more information, visit <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" style="color: #0066cc; text-decoration: underline;">MDN Web Docs</a> and explore the comprehensive JavaScript documentation.</p>
<h3><strong>Best Practices to Follow</strong></h3>
<ol>
<li>Always use <em>strict mode</em> to catch common coding mistakes</li>
<li>Implement proper <strong>error handling</strong> with try-catch blocks</li>
<li>Write <em>clean, readable code</em> that follows naming conventions</li>
<li>Use <strong>modern JavaScript features</strong> instead of older patterns</li>
<li>Optimize <strong>performance</strong> by avoiding unnecessary re-renders and computations</li>
</ol>
<p>By following these practices, you'll write code that is <strong>more maintainable, efficient, and easier to understand</strong> for both yourself and your team members.</p>`,

  `<h2><strong>React Development: Building Modern User Interfaces</strong></h2>
<p><em>React</em> has revolutionized the way developers build user interfaces. With its <strong>component-based architecture and virtual DOM</strong>, React provides a powerful and efficient way to create interactive web applications.</p>
<img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400" alt="React Development" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Essential React Concepts</strong></h3>
<ul>
<li><strong>Components:</strong> Reusable building blocks for your UI</li>
<li><strong>Props:</strong> Pass data between components</li>
<li><strong>State:</strong> Manage dynamic data within components</li>
<li><strong>Hooks:</strong> Add state and lifecycle features to functional components</li>
<li><strong>Context:</strong> Share data across the component tree</li>
<li><strong>JSX:</strong> Write HTML-like syntax in JavaScript</li>
</ul>
<p>Learn more about React by visiting <a href="https://react.dev" target="_blank" style="color: #0066cc; text-decoration: underline;">the official React documentation</a>, which includes interactive examples and tutorials.</p>
<h3><strong>Performance Optimization</strong></h3>
<p>Optimizing React applications is crucial for <strong>delivering fast user experiences</strong>:</p>
<ol>
<li><strong>Code Splitting:</strong> Load only necessary code for each route</li>
<li><strong>Memoization:</strong> Use React.memo() and useMemo() wisely</li>
<li><strong>Lazy Loading:</strong> Defer loading of components until needed</li>
<li><strong>Virtual Scrolling:</strong> Render only visible items in large lists</li>
<li><strong>Optimize Re-renders:</strong> Use useCallback() for function references</li>
</ol>`,

  `<h2><strong>Database Design: Building Scalable Data Architecture</strong></h2>
<p>A <em>well-designed database</em> is the foundation of any successful application. It ensures <strong>data integrity, performance, and scalability</strong>. Whether you're using SQL or NoSQL databases, understanding design principles is crucial.</p>
<img src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400" alt="Database Design" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Core Database Design Principles</strong></h3>
<ol>
<li><strong>Normalization:</strong> Reduce data redundancy and improve consistency</li>
<li><strong>Relationships:</strong> Properly define foreign keys and relationships</li>
<li><strong>Indexing:</strong> Optimize query performance with strategic indexes</li>
<li><strong>Constraints:</strong> Use unique, primary, and check constraints</li>
<li><strong>Backup Strategy:</strong> Implement regular backups and recovery procedures</li>
</ol>
<p>For comprehensive database learning, visit <a href="https://www.postgresql.org/docs/" target="_blank" style="color: #0066cc; text-decoration: underline;">PostgreSQL documentation</a> or <a href="https://docs.mongodb.com/" target="_blank" style="color: #0066cc; text-decoration: underline;">MongoDB documentation</a>.</p>
<h3><strong>Performance Optimization Tips</strong></h3>
<ul>
<li><strong>Query Optimization:</strong> Write efficient queries with proper WHERE clauses</li>
<li><strong>Connection Pooling:</strong> Manage database connections efficiently</li>
<li><strong>Caching Strategy:</strong> Implement caching for frequently accessed data</li>
<li><strong>Monitoring:</strong> Use <em>monitoring tools</em> to track performance metrics</li>
</ul>
<p>Good database design can <strong>dramatically improve application performance</strong> and reduce operational costs.</p>`,

  `<h2><strong>API Development: Building Robust Web Services</strong></h2>
<p>Building robust, scalable APIs requires careful planning and adherence to <em>industry best practices</em>. A well-designed API is <strong>easy to use, maintain, and extend</strong> as your business grows.</p>
<img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400" alt="API Development" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Essential API Design Principles</strong></h3>
<ul>
<li><strong>RESTful Design:</strong> Follow REST conventions for resource-oriented APIs</li>
<li><strong>Versioning:</strong> Use <em>API versioning</em> to maintain backward compatibility</li>
<li><strong>Authentication:</strong> Implement <strong>OAuth 2.0 or JWT</strong> for security</li>
<li><strong>Rate Limiting:</strong> Protect your API from abuse</li>
<li><strong>Documentation:</strong> Provide <strong>clear, comprehensive documentation</strong></li>
<li><strong>Error Handling:</strong> Return meaningful error messages</li>
</ul>
<p>Learn more about API design at <a href="https://swagger.io/specification/" target="_blank" style="color: #0066cc; text-decoration: underline;">OpenAPI Specification</a>.</p>
<h3><strong>HTTP Status Codes</strong></h3>
<p>Use appropriate status codes for different scenarios:</p>
<ul>
<li><strong>200 OK:</strong> Successful request</li>
<li><strong>201 Created:</strong> Resource successfully created</li>
<li><strong>400 Bad Request:</strong> Invalid request parameters</li>
<li><strong>401 Unauthorized:</strong> Missing or invalid authentication</li>
<li><strong>404 Not Found:</strong> Resource doesn't exist</li>
<li><strong>500 Internal Server Error:</strong> Server-side error</li>
</ul>`,

  `<h2><strong>Cloud Computing: Scaling Your Applications</strong></h2>
<p><em>Cloud computing</em> has transformed how we build and deploy applications. Instead of managing physical servers, cloud platforms provide <strong>flexible, scalable infrastructure</strong> with pay-as-you-go pricing.</p>
<img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400" alt="Cloud Computing" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Major Cloud Platforms</strong></h3>
<ul>
<li><strong>AWS (Amazon Web Services):</strong> Comprehensive service offerings</li>
<li><strong>Google Cloud Platform:</strong> Strong in data analytics and AI</li>
<li><strong>Microsoft Azure:</strong> Excellent enterprise integration</li>
<li><strong>DigitalOcean:</strong> Simple and affordable for startups</li>
<li><strong>Vercel:</strong> Optimized for Next.js and frontend deployments</li>
</ul>
<p>Explore <a href="https://aws.amazon.com/getting-started/" target="_blank" style="color: #0066cc; text-decoration: underline;">AWS Getting Started</a> or <a href="https://cloud.google.com/docs" target="_blank" style="color: #0066cc; text-decoration: underline;">Google Cloud documentation</a>.</p>
<h3><strong>Key Cloud Services</strong></h3>
<ol>
<li><strong>Compute:</strong> Virtual machines, containers, and serverless functions</li>
<li><strong>Storage:</strong> Object storage, databases, and file systems</li>
<li><strong>Networking:</strong> CDN, load balancers, and VPNs</li>
<li><strong>Security:</strong> Identity management, encryption, and compliance</li>
<li><strong>Analytics:</strong> Data warehousing and machine learning services</li>
</ol>`,

  `<h2><strong>DevOps: Automating Your Development Pipeline</strong></h2>
<p><strong>DevOps</strong> is a set of practices that combines software development and IT operations. It aims to shorten development cycles and provide <em>continuous integration, continuous deployment, and high-quality deployments</em>.</p>
<img src="https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=400" alt="DevOps Pipeline" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>DevOps Essential Tools</strong></h3>
<ul>
<li><strong>Version Control:</strong> Git and GitHub for code management</li>
<li><strong>CI/CD Pipelines:</strong> Jenkins, GitLab CI, GitHub Actions</li>
<li><strong>Containerization:</strong> Docker for consistent environments</li>
<li><strong>Orchestration:</strong> Kubernetes for managing containers at scale</li>
<li><strong>Monitoring:</strong> <em>Prometheus, Grafana, ELK Stack</em></li>
<li><strong>Infrastructure as Code:</strong> Terraform, Ansible</li>
</ul>
<p>Start your DevOps journey with <a href="https://docs.docker.com/" target="_blank" style="color: #0066cc; text-decoration: underline;">Docker documentation</a> and <a href="https://kubernetes.io/docs/" target="_blank" style="color: #0066cc; text-decoration: underline;">Kubernetes guides</a>.</p>
<h3><strong>Benefits of DevOps</strong></h3>
<ul>
<li><strong>Faster deployments:</strong> Ship features to production quickly</li>
<li><strong>Higher quality:</strong> Automated testing catches bugs early</li>
<li><strong>Better collaboration:</strong> Developers and operations work together</li>
<li><strong>Reduced downtime:</strong> Better monitoring and response times</li>
</ul>`,
];

const blogTitles = [
  "Complete Guide to Modern JavaScript Development",
  "React Hooks: Mastering Modern State Management",
  "Database Design for Scalable Applications",
  "Building Production-Ready REST APIs",
  "Cloud Computing Fundamentals for Developers",
  "DevOps Essentials: CI/CD Pipeline Automation",
  "Web Security Best Practices 2026",
  "Performance Optimization: Making Apps Fast",
  "Machine Learning Integration for Web Apps",
  "TypeScript: Strong Typing for JavaScript",
  "Docker Containerization Complete Guide",
  "Kubernetes Orchestration in Production",
  "Testing Strategies for Enterprise Applications",
  "Microservices Architecture Patterns",
  "Building Real-Time WebSocket Applications",
  "GraphQL vs REST: Choosing the Right API",
  "Authentication and Authorization Best Practices",
  "Progressive Web Apps Development Guide",
  "Advanced CSS: Grid, Flexbox, and Animations",
  "Data Structures and Algorithms Simplified",
];

const categories = [
  "Web Development", "Backend Development", "Frontend Development", "DevOps",
  "Database", "Security", "Performance", "Best Practices", "Architecture",
  "Cloud Computing", "AI & Machine Learning", "Tutorials", "Tools & Frameworks", "Career Development",
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 100);
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedBlogs() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing blogs
    console.log("🗑️  Clearing existing blogs...");
    await Blog.deleteMany({});

    // Setup categories
    console.log("📂 Setting up blog categories...");
    const categoryDocs = await Promise.all(
      categories.map(async (name) => {
        let cat = await BlogCategory.findOne({ name });
        if (!cat) {
          cat = await BlogCategory.create({
            name,
            slug: generateSlug(name),
            description: `Comprehensive articles and tutorials about ${name.toLowerCase()}`,
          });
        }
        return cat;
      })
    );

    // Find or create admin user
    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      admin = await User.create({
        name: "Blog Administrator",
        phone: "+8801234567890",
        email: "admin@learngrow.com",
        role: "admin",
        password: "admin123",
        isVerified: true,
      });
    }

    console.log("✏️  Creating 500 blog posts with working images...");
    const blogs = [];
    const baseDate = new Date();

    for (let i = 1; i <= 500; i++) {
      const titleBase = blogTitles[(i - 1) % blogTitles.length];
      const title = `${titleBase} - Part ${Math.ceil(i / blogTitles.length)}`;
      const slug = generateSlug(title) + `-${i}`;
      const category = categoryDocs[(i - 1) % categoryDocs.length];

      const date = new Date(baseDate);
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));

      blogs.push({
        title,
        content: getRandomItem(richContentTemplates),
        excerpt: `Comprehensive guide covering key concepts, best practices, and practical implementation techniques for ${titleBase.toLowerCase()}. Learn from industry experts.`,
        author: admin._id,
        category: category._id,
        slug,
        isPublished: true,
        isApproved: true,
        metaTags: ["development", "programming", "tutorial", "guide"],
        image: workingImages[i % workingImages.length],
        readTime: Math.floor(Math.random() * 20) + 8,
        viewCount: Math.floor(Math.random() * 15000),
        createdAt: date,
        updatedAt: date,
      });
    }

    const created = await Blog.insertMany(blogs);
    console.log(`✅ Created ${created.length} blog posts`);

    console.log("\n📊 ===== SEEDING COMPLETE =====");
    console.log(`✅ Total Blogs: ${created.length}`);
    console.log(`✅ All Published: true`);
    console.log(`✅ All Approved: true`);
    console.log(`✅ Categories: ${categoryDocs.length}`);
    console.log(`✅ Working Images: ${workingImages.length} unique images`);
    console.log(`✅ Rich Content: Bold, Italic, Links, Embedded Images, Lists`);
    console.log("\n🎯 Blogs ready to view on /blog page!");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedBlogs();
