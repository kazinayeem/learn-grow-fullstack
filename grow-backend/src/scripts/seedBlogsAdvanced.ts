import mongoose from "mongoose";
import { Blog } from "../modules/blog/model/blog.model";
import { BlogCategory } from "../modules/blog/model/blog-category.model";
import { User } from "../modules/user/model/user.model";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/learn-grow";

// Rich text content with bold, italic, links, images, lists
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

  `<h2><strong>React Hooks: A Complete Guide to Modern State Management</strong></h2>
<p><em>React Hooks</em> have revolutionized the way developers manage state and side effects in functional components. Instead of relying on class components and complex lifecycle methods, hooks provide a <strong>cleaner, more intuitive approach</strong> to managing component logic.</p>
<img src="https://images.unsplash.com/photo-1517694712989-ba330ecc6942?w=800&h=400" alt="React Development" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Essential React Hooks Explained</strong></h3>
<ul>
<li><strong>useState:</strong> Manage component state with a simple API</li>
<li><strong>useEffect:</strong> Handle side effects and component lifecycle</li>
<li><strong>useContext:</strong> Access global state without prop drilling</li>
<li><strong>useReducer:</strong> Manage complex state logic like Redux</li>
<li><strong>useCallback:</strong> Optimize function references for performance</li>
<li><strong>useMemo:</strong> Cache expensive computations</li>
</ul>
<p>Learn more about React by visiting <a href="https://react.dev" target="_blank" style="color: #0066cc; text-decoration: underline;">the official React documentation</a>, which includes interactive examples and tutorials.</p>
<h3><strong>Common Patterns and Anti-Patterns</strong></h3>
<p><strong>Good Pattern:</strong> <em>Using multiple useState hooks for different pieces of state</em></p>
<p><strong>Anti-Pattern:</strong> <em>Storing complex objects in a single useState without proper updates</em></p>
<p>Remember to <strong>always follow the Rules of Hooks</strong> to ensure your code works correctly and avoid subtle bugs. For detailed guidance, check out <a href="https://react.dev/reference/rules/rules-of-hooks" target="_blank" style="color: #0066cc; text-decoration: underline;">React's official rules</a>.</p>`,

  `<h2><strong>Database Design: Building Scalable Data Architecture</strong></h2>
<p>A <em>well-designed database</em> is the foundation of any successful application. It ensures <strong>data integrity, performance, and scalability</strong>. Whether you're using SQL or NoSQL databases, understanding design principles is crucial.</p>
<img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400" alt="Database Design" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
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

  `<h2><strong>API Development Best Practices</strong></h2>
<p>Building robust, scalable APIs requires careful planning and adherence to <em>industry best practices</em>. A well-designed API is <strong>easy to use, maintain, and extend</strong> as your business grows.</p>
<img src="https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=800&h=400" alt="API Development" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Essential API Design Principles</strong></h3>
<ul>
<li><strong>RESTful Design:</strong> Follow REST conventions for resource-oriented APIs</li>
<li><strong>Versioning:</strong> Use <em>API versioning</em> to maintain backward compatibility</li>
<li><strong>Authentication:</strong> Implement <strong>OAuth 2.0 or JWT</strong> for security</li>
<li><strong>Rate Limiting:</strong> Protect your API from abuse</li>
<li><strong>Documentation:</strong> Provide <strong>clear, comprehensive documentation</strong></li>
</ul>
<p>Learn more about API design at <a href="https://swagger.io/specification/" target="_blank" style="color: #0066cc; text-decoration: underline;">OpenAPI Specification</a>.</p>
<h3><strong>Error Handling Strategy</strong></h3>
<p>Proper error handling is <strong>critical for API reliability</strong>. Always return <em>meaningful error messages</em> with appropriate HTTP status codes:</p>
<ul>
<li><strong>400 Bad Request:</strong> Invalid request parameters</li>
<li><strong>401 Unauthorized:</strong> Missing or invalid authentication</li>
<li><strong>403 Forbidden:</strong> Authenticated but not authorized</li>
<li><strong>404 Not Found:</strong> Resource doesn't exist</li>
<li><strong>500 Internal Server Error:</strong> Server-side error</li>
</ul>
<p>For more details, check <a href="https://restfulapi.net/http-status-codes/" target="_blank" style="color: #0066cc; text-decoration: underline;">HTTP status codes guide</a>.</p>`,

  `<h2><strong>Cloud Computing: Scaling Your Applications</strong></h2>
<p><em>Cloud computing</em> has transformed how we build and deploy applications. Instead of managing physical servers, cloud platforms provide <strong>flexible, scalable infrastructure</strong> with pay-as-you-go pricing.</p>
<img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400" alt="Cloud Computing" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Major Cloud Platforms</strong></h3>
<ul>
<li><strong>AWS (Amazon Web Services):</strong> Comprehensive service offerings</li>
<li><strong>Google Cloud Platform:</strong> Strong in data analytics and AI</li>
<li><strong>Microsoft Azure:</strong> Excellent enterprise integration</li>
<li><strong>Heroku:</strong> Simple deployment for smaller applications</li>
</ul>
<p>Explore <a href="https://aws.amazon.com/getting-started/" target="_blank" style="color: #0066cc; text-decoration: underline;">AWS Getting Started</a> or <a href="https://cloud.google.com/docs" target="_blank" style="color: #0066cc; text-decoration: underline;">Google Cloud documentation</a>.</p>
<h3><strong>Key Cloud Services</strong></h3>
<ol>
<li><strong>Compute:</strong> Virtual machines, containers, and serverless functions</li>
<li><strong>Storage:</strong> Object storage, databases, and file systems</li>
<li><strong>Networking:</strong> CDN, load balancers, and VPNs</li>
<li><strong>Security:</strong> Identity management, encryption, and compliance</li>
<li><strong>Analytics:</strong> Data warehousing and machine learning services</li>
</ol>
<p>Cloud adoption requires understanding <strong>security best practices, cost optimization, and infrastructure management</strong>.</p>`,

  `<h2><strong>DevOps: Automating Your Development Pipeline</strong></h2>
<p><strong>DevOps</strong> is a set of practices that combines software development and IT operations. It aims to shorten development cycles and provide <em>continuous integration, continuous deployment, and high-quality deployments</em>.</p>
<img src="https://images.unsplash.com/photo-1517694712636-c1a86408fbf7?w=800&h=400" alt="DevOps Pipeline" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
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
<p>Implementing DevOps practices can <strong>dramatically improve your team's productivity</strong>:</p>
<ul>
<li><strong>Faster deployments:</strong> Ship features to production quickly</li>
<li><strong>Higher quality:</strong> Automated testing catches bugs early</li>
<li><strong>Better collaboration:</strong> Developers and operations work together</li>
<li><strong>Reduced downtime:</strong> Better monitoring and response times</li>
<li><strong>Cost efficiency:</strong> Optimize resource utilization</li>
</ul>`,

  `<h2><strong>Security Best Practices for Web Applications</strong></h2>
<p>Security should be <strong>built into every stage of development</strong>, not added as an afterthought. Common vulnerabilities like <em>SQL injection, cross-site scripting (XSS), and insecure deserialization</em> can compromise your entire application.</p>
<img src="https://images.unsplash.com/photo-1516321325253-c1a89c0efd58?w=800&h=400" alt="Web Security" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>OWASP Top 10 Vulnerabilities</strong></h3>
<ol>
<li><strong>Broken Access Control:</strong> Users can access unauthorized resources</li>
<li><strong>Cryptographic Failures:</strong> Weak or missing encryption</li>
<li><strong>Injection:</strong> SQL injection, command injection attacks</li>
<li><strong>Insecure Design:</strong> Missing security controls</li>
<li><strong>Security Misconfiguration:</strong> Default credentials, unnecessary services</li>
<li><strong>Vulnerable Components:</strong> Using outdated or vulnerable libraries</li>
<li><strong>Authentication Failures:</strong> Weak password policies, session management issues</li>
<li><strong>Software and Data Integrity Failures:</strong> Insecure CI/CD pipelines</li>
<li><strong>Logging & Monitoring Failures:</strong> Insufficient security event logging</li>
<li><strong>SSRF:</strong> Server-side request forgery attacks</li>
</ol>
<p>Learn security best practices from <a href="https://owasp.org/" target="_blank" style="color: #0066cc; text-decoration: underline;">OWASP</a> and <a href="https://cheatsheetseries.owasp.org/" target="_blank" style="color: #0066cc; text-decoration: underline;">OWASP Cheat Sheets</a>.</p>
<h3><strong>Security Implementation Checklist</strong></h3>
<ul>
<li><strong>Input Validation:</strong> Never trust user input, always validate and sanitize</li>
<li><strong>Output Encoding:</strong> Encode data before displaying to prevent XSS</li>
<li><strong>Parameterized Queries:</strong> Use prepared statements to prevent SQL injection</li>
<li><strong>HTTPS Only:</strong> Encrypt all data in transit</li>
<li><strong>Strong Passwords:</strong> Enforce password policies and use hashing</li>
<li><strong>Regular Updates:</strong> Keep dependencies and frameworks updated</li>
<li><strong>Security Testing:</strong> Include security tests in your CI/CD pipeline</li>
</ul>`,

  `<h2><strong>Performance Optimization: Making Your App Lightning Fast</strong></h2>
<p>Users expect <strong>fast, responsive applications</strong>. Performance directly impacts user experience, conversion rates, and search engine rankings. Even a one-second delay can reduce conversion by 7%.</p>
<img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400" alt="Performance" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Frontend Performance Techniques</strong></h3>
<ul>
<li><strong>Code Splitting:</strong> Load only necessary code for each page</li>
<li><strong>Image Optimization:</strong> Use modern formats and responsive images</li>
<li><strong>Lazy Loading:</strong> Defer loading non-critical resources</li>
<li><strong>Caching Strategy:</strong> Use browser and CDN caching effectively</li>
<li><strong>Minification:</strong> Reduce CSS, JavaScript, and HTML file sizes</li>
<li><strong>Tree Shaking:</strong> Remove unused code from bundles</li>
</ul>
<p>Check <a href="https://web.dev/performance/" target="_blank" style="color: #0066cc; text-decoration: underline;">Google's Web Performance Guidance</a> for detailed optimization techniques.</p>
<h3><strong>Backend Performance Techniques</strong></h3>
<ol>
<li><strong>Database Optimization:</strong> <em>Proper indexing, query optimization</em></li>
<li><strong>Caching:</strong> Redis, Memcached for frequently accessed data</li>
<li><strong>Load Balancing:</strong> Distribute traffic across servers</li>
<li><strong>Compression:</strong> Gzip or Brotli compression for responses</li>
<li><strong>Monitoring:</strong> Track performance metrics and identify bottlenecks</li>
<li><strong>Asynchronous Processing:</strong> Use queues for long-running operations</li>
</ol>
<p>Performance optimization is <strong>an ongoing process</strong> that requires constant monitoring and improvement.</p>`,

  `<h2><strong>Machine Learning for Developers: Getting Started</strong></h2>
<p><em>Machine learning</em> is no longer exclusive to data scientists. Modern tools and frameworks make it <strong>accessible to developers</strong> who want to add intelligent features to their applications.</p>
<img src="https://images.unsplash.com/photo-1517694712989-ba330ecc6942?w=800&h=400" alt="Machine Learning" style="width: 100%; max-width: 600px; margin: 20px 0; border-radius: 8px;">
<h3><strong>Popular ML Frameworks</strong></h3>
<ul>
<li><strong>TensorFlow:</strong> Comprehensive ML platform by Google</li>
<li><strong>PyTorch:</strong> Flexible deep learning framework</li>
<li><strong>Scikit-learn:</strong> Machine learning library for Python</li>
<li><strong>OpenAI API:</strong> Access to powerful language models</li>
<li><strong>Hugging Face:</strong> Pre-trained models and datasets</li>
</ul>
<p>Start learning ML at <a href="https://www.tensorflow.org/learn" target="_blank" style="color: #0066cc; text-decoration: underline;">TensorFlow's educational resources</a> or <a href="https://pytorch.org/tutorials/" target="_blank" style="color: #0066cc; text-decoration: underline;">PyTorch tutorials</a>.</p>
<h3><strong>Common ML Use Cases</strong></h3>
<ol>
<li><strong>Classification:</strong> Predicting categories (spam detection, sentiment analysis)</li>
<li><strong>Regression:</strong> Predicting continuous values (price prediction)</li>
<li><strong>Clustering:</strong> Grouping similar data points</li>
<li><strong>NLP:</strong> <em>Natural language processing</em> for text understanding</li>
<li><strong>Computer Vision:</strong> Image recognition and analysis</li>
<li><strong>Recommendation Systems:</strong> Suggesting products or content</li>
</ol>
<p>Successful ML projects require <strong>good data, appropriate algorithms, and continuous improvement</strong>.</p>`,
];

const blogTitles = [
  "Complete Guide to Modern Web Development",
  "React Hooks: Mastering Modern State Management",
  "Database Design for Scalable Applications",
  "Building Production-Ready APIs",
  "Cloud Computing: A Developer's Guide",
  "DevOps Essentials: Automating Your Pipeline",
  "Web Security Best Practices",
  "Performance Optimization Techniques",
  "Machine Learning for Web Developers",
  "TypeScript Tips and Tricks",
  "Docker and Containerization Guide",
  "Kubernetes in Production",
  "Testing Strategies for Enterprise Apps",
  "Microservices Architecture Patterns",
  "Building Real-Time Applications",
  "GraphQL vs REST APIs",
  "Authentication and Authorization",
  "Building Progressive Web Apps",
  "Advanced CSS Techniques",
  "Data Structures Explained Simply",
];

const categories = [
  "Web Development", "Backend Development", "Frontend Development", "DevOps",
  "Database", "Security", "Performance", "Best Practices", "Architecture",
  "Cloud Computing", "AI & Machine Learning", "Tutorials", "Tools", "Career",
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
            description: `Articles about ${name.toLowerCase()}`,
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

    console.log("✏️  Creating 500 blog posts with rich content...");
    const blogs = [];
    const baseDate = new Date();

    for (let i = 1; i <= 500; i++) {
      const titleBase = blogTitles[(i - 1) % blogTitles.length];
      const title = `${titleBase} - Guide ${Math.ceil(i / blogTitles.length)}`;
      const slug = generateSlug(title) + `-${i}`;
      const category = categoryDocs[(i - 1) % categoryDocs.length];

      const date = new Date(baseDate);
      date.setDate(date.getDate() - Math.floor(Math.random() * 365));

      blogs.push({
        title,
        content: getRandomItem(richContentTemplates),
        excerpt: `Comprehensive guide covering key concepts, best practices, and practical implementation techniques for ${titleBase.toLowerCase()}.`,
        author: admin._id,
        category: category._id,
        slug,
        isPublished: true,
        isApproved: true,
        metaTags: ["development", "tutorial", "guide", "programming"],
        image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 20) + 1}?w=800&h=400`,
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
    console.log(`✅ Rich Content: Bold, Italic, Links, Images, Lists`);
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
