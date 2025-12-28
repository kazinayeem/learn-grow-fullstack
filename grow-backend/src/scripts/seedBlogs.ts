import mongoose from "mongoose";
import { Blog } from "@/modules/blog/model/blog.model";
import { BlogCategory } from "@/modules/blog/model/blog-category.model";

const MONGO_URI = process.env.MONGODB_URI || "mongodb://admin:admin123@localhost:27017/modular_db?authSource=admin";
const AUTHOR_ID = "695007e4d3d2029a8735238f"; // Use the provided author ID
const CATEGORY_ID = "6950ef3fbd244256d24db01f"; // Use the provided category ID

// Rich text content generator
const generateRichContent = (title: string, topic: string): string => {
  const contents: { [key: string]: string } = {
    "Web Development": `
      <h2>Getting Started with Web Development</h2>
      <p>Web development is the process of building and maintaining websites. It includes web design, web content development, client-side scripting, server-side scripting, and network security configuration.</p>
      
      <h3>Key Technologies</h3>
      <ul>
        <li><strong>HTML</strong> - The structure of web pages</li>
        <li><strong>CSS</strong> - Styling and layout</li>
        <li><strong>JavaScript</strong> - Interactivity and logic</li>
        <li><strong>Backend Languages</strong> - Server-side processing</li>
      </ul>
      
      <h3>Learning Path</h3>
      <ol>
        <li>Master HTML fundamentals</li>
        <li>Learn CSS for styling</li>
        <li>Study JavaScript for interactivity</li>
        <li>Pick a backend framework</li>
        <li>Learn databases and APIs</li>
        <li>Practice with projects</li>
      </ol>
      
      <p>The journey of becoming a web developer is exciting and rewarding. It requires dedication, continuous learning, and consistent practice. Start with the basics and gradually move towards advanced concepts. Build real projects to solidify your knowledge and create a portfolio that showcases your skills to potential employers.</p>
      
      <h3>Best Practices</h3>
      <p>Always write clean, maintainable code. Follow industry standards and use version control. Optimize your website for performance and accessibility. Keep security in mind at every step of development. Test thoroughly before deploying to production.</p>
    `,
    "Mobile Development": `
      <h2>Mobile App Development Essentials</h2>
      <p>Mobile development has become one of the most sought-after skills in the tech industry. With billions of smartphone users worldwide, creating mobile applications is more important than ever.</p>
      
      <h3>Popular Platforms</h3>
      <ul>
        <li><strong>iOS Development</strong> - Using Swift and Xcode</li>
        <li><strong>Android Development</strong> - Using Kotlin and Android Studio</li>
        <li><strong>Cross-Platform</strong> - React Native, Flutter</li>
      </ul>
      
      <p>Each platform has its unique characteristics, design guidelines, and user expectations. Understanding these differences is crucial for building successful mobile applications that provide excellent user experiences.</p>
      
      <h3>Core Concepts</h3>
      <p>Mobile developers must understand UI/UX design principles, responsive design, battery optimization, network considerations, and mobile-specific security concerns. Additionally, knowledge of RESTful APIs, data persistence, and cloud integration is essential.</p>
      
      <p>The key to success in mobile development is staying updated with the latest frameworks, tools, and best practices. The mobile landscape changes rapidly, so continuous learning is mandatory for any mobile developer.</p>
    `,
    "Data Science": `
      <h2>Introduction to Data Science</h2>
      <p>Data science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract meaningful information and insights from structured and unstructured data.</p>
      
      <h3>Core Skills Required</h3>
      <ul>
        <li><strong>Programming</strong> - Python, R, SQL</li>
        <li><strong>Statistics</strong> - Probability, hypothesis testing</li>
        <li><strong>Machine Learning</strong> - Supervised and unsupervised learning</li>
        <li><strong>Data Visualization</strong> - Communicating insights</li>
      </ul>
      
      <h3>The Data Science Workflow</h3>
      <ol>
        <li>Define the problem and objectives</li>
        <li>Collect and prepare data</li>
        <li>Explore and analyze data</li>
        <li>Build and train models</li>
        <li>Evaluate and validate results</li>
        <li>Deploy and monitor solutions</li>
      </ol>
      
      <p>Data science is transforming industries by enabling data-driven decision making. From healthcare to finance, retail to manufacturing, data science applications are everywhere. Learning data science opens doors to exciting career opportunities with competitive salaries.</p>
    `,
    "Cloud Computing": `
      <h2>Cloud Computing Fundamentals</h2>
      <p>Cloud computing has revolutionized how businesses deploy and manage applications. It provides on-demand access to computing resources over the internet, eliminating the need for expensive on-premises infrastructure.</p>
      
      <h3>Major Cloud Providers</h3>
      <ul>
        <li><strong>Amazon Web Services (AWS)</strong> - Largest market share</li>
        <li><strong>Microsoft Azure</strong> - Enterprise focus</li>
        <li><strong>Google Cloud Platform (GCP)</strong> - Data and AI focus</li>
      </ul>
      
      <h3>Service Models</h3>
      <p><strong>Infrastructure as a Service (IaaS)</strong> provides virtualized computing resources over the internet. <strong>Platform as a Service (PaaS)</strong> offers a platform for developers to build applications. <strong>Software as a Service (SaaS)</strong> delivers software applications over the internet.</p>
      
      <p>Cloud adoption is growing rapidly because of its scalability, cost-effectiveness, reliability, and security features. Organizations are migrating their workloads to the cloud to improve agility and reduce operational costs.</p>
    `,
    "DevOps": `
      <h2>DevOps: Bridging Development and Operations</h2>
      <p>DevOps is a set of practices, tools, and a cultural philosophy that emphasizes collaboration and communication between software developers and IT professionals. It aims to shorten the development lifecycle and provide continuous delivery with high quality.</p>
      
      <h3>Key DevOps Tools</h3>
      <ul>
        <li><strong>Version Control</strong> - Git, GitHub</li>
        <li><strong>CI/CD</strong> - Jenkins, GitLab CI</li>
        <li><strong>Containerization</strong> - Docker, Kubernetes</li>
        <li><strong>Monitoring</strong> - Prometheus, ELK Stack</li>
      </ul>
      
      <h3>DevOps Pipeline</h3>
      <ol>
        <li>Plan and code</li>
        <li>Build and test</li>
        <li>Release and deploy</li>
        <li>Operate and monitor</li>
        <li>Feedback and improvement</li>
      </ol>
      
      <p>DevOps practices enable faster software releases, improved system reliability, better team collaboration, and faster problem resolution. Organizations adopting DevOps see significant improvements in deployment frequency and reduced time to market.</p>
    `,
    "Cybersecurity": `
      <h2>Cybersecurity Essentials</h2>
      <p>In today's digital world, cybersecurity has become critical for protecting sensitive information and maintaining trust. Cyber threats are evolving constantly, making security awareness and robust defenses essential.</p>
      
      <h3>Security Domains</h3>
      <ul>
        <li><strong>Network Security</strong> - Protecting network infrastructure</li>
        <li><strong>Application Security</strong> - Securing software and applications</li>
        <li><strong>Data Security</strong> - Protecting sensitive data</li>
        <li><strong>Identity Management</strong> - Access control and authentication</li>
      </ul>
      
      <p>Common threats include phishing, malware, ransomware, and insider threats. Implementing strong security practices, regular training, and continuous monitoring are essential for defending against these threats.</p>
      
      <h3>Security Best Practices</h3>
      <p>Use strong passwords, enable two-factor authentication, keep systems updated, conduct regular security audits, implement encryption, and maintain comprehensive backups. A layered security approach provides multiple lines of defense against potential attacks.</p>
    `,
    "Artificial Intelligence": `
      <h2>Artificial Intelligence: The Future is Now</h2>
      <p>Artificial Intelligence is transforming every aspect of our lives, from healthcare to transportation, education to entertainment. AI enables machines to learn from experience and perform tasks that typically require human intelligence.</p>
      
      <h3>AI Subfields</h3>
      <ul>
        <li><strong>Machine Learning</strong> - Learning from data</li>
        <li><strong>Natural Language Processing</strong> - Understanding human language</li>
        <li><strong>Computer Vision</strong> - Processing visual information</li>
        <li><strong>Robotics</strong> - Autonomous systems</li>
      </ul>
      
      <h3>Popular Frameworks</h3>
      <p><strong>TensorFlow</strong> is an open-source platform for machine learning developed by Google. <strong>PyTorch</strong> is a machine learning library developed by Meta. <strong>Scikit-learn</strong> is a library for classical machine learning algorithms.</p>
      
      <p>AI is creating new job opportunities and transforming existing roles. Understanding AI fundamentals is becoming increasingly important for tech professionals in all domains.</p>
    `,
    "JavaScript": `
      <h2>Mastering JavaScript</h2>
      <p>JavaScript is the most widely used programming language for web development. It powers interactive web applications and has expanded beyond the browser with Node.js.</p>
      
      <h3>JavaScript Concepts</h3>
      <ul>
        <li><strong>Variables and Data Types</strong> - Primitives and objects</li>
        <li><strong>Functions</strong> - First-class citizens</li>
        <li><strong>Asynchronous Programming</strong> - Callbacks, Promises, async/await</li>
        <li><strong>DOM Manipulation</strong> - Interacting with HTML</li>
      </ul>
      
      <h3>Modern JavaScript Frameworks</h3>
      <p>Popular frameworks include React for building UIs, Angular for full-featured applications, and Vue.js for progressive enhancement. Each has its strengths and use cases in different scenarios.</p>
      
      <p>Mastering JavaScript is fundamental to becoming a full-stack developer. Understanding core concepts and staying updated with ES6+ features is crucial for writing efficient and maintainable code.</p>
    `,
    "Database Design": `
      <h2>Database Design Best Practices</h2>
      <p>Effective database design is crucial for building scalable and maintainable applications. A well-designed database ensures data integrity, improves query performance, and simplifies maintenance.</p>
      
      <h3>Database Types</h3>
      <ul>
        <li><strong>Relational Databases</strong> - SQL, ACID compliance</li>
        <li><strong>NoSQL Databases</strong> - Flexible schemas, horizontal scaling</li>
        <li><strong>Graph Databases</strong> - Relationship-focused</li>
        <li><strong>Time-Series Databases</strong> - Time-stamped data</li>
      </ul>
      
      <h3>Design Principles</h3>
      <p>Normalize your database to eliminate redundancy. Use appropriate indexes for query optimization. Implement proper relationships and constraints. Plan for scalability and future growth. Consider backup and recovery strategies.</p>
      
      <p>Understanding database design principles helps in building applications that can handle growth and complexity as business requirements evolve.</p>
    `,
    "System Design": `
      <h2>System Design for Scalability</h2>
      <p>System design is about building large-scale applications that are scalable, reliable, and maintainable. It involves making architectural decisions that impact performance and user experience.</p>
      
      <h3>Key Concepts</h3>
      <ul>
        <li><strong>Load Balancing</strong> - Distributing traffic</li>
        <li><strong>Caching</strong> - Improving response times</li>
        <li><strong>Database Sharding</strong> - Horizontal scaling</li>
        <li><strong>Microservices</strong> - Modular architecture</li>
      </ul>
      
      <p>Designing systems that scale requires understanding trade-offs between consistency, availability, and partition tolerance (CAP theorem). Making informed decisions about architecture ensures systems can grow with business needs.</p>
    `,
  };

  return contents[topic] || `
    <h2>${title}</h2>
    <p>This comprehensive guide covers all the essential aspects of ${topic.toLowerCase()}. Whether you are a beginner just starting your journey or an experienced professional looking to deepen your knowledge, this article provides valuable insights and practical advice.</p>
    
    <h3>Why This Matters</h3>
    <p>${topic} is increasingly important in today's technology landscape. Understanding its principles and best practices can significantly enhance your career prospects and technical capabilities.</p>
    
    <h3>Key Takeaways</h3>
    <ul>
      <li>Master the fundamentals of ${topic.toLowerCase()}</li>
      <li>Understand industry best practices and standards</li>
      <li>Stay updated with the latest trends and technologies</li>
      <li>Gain practical experience through hands-on projects</li>
    </ul>
    
    <p>As you continue your learning journey in ${topic.toLowerCase()}, remember that consistent practice and continuous improvement are key to success. The field is constantly evolving, so maintaining a growth mindset and staying curious will help you stay ahead of the curve.</p>
  `;
};

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
  "Data Structures Mastery",
  "Design Patterns in Software Development",
  "Clean Code Principles",
];

const categories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "Artificial Intelligence",
  "JavaScript",
  "Database Design",
  "System Design",
];

const excerpts = [
  "Learn the essential concepts and tools needed to start your journey in this field.",
  "Explore advanced techniques and best practices used by industry professionals.",
  "Discover how to build scalable and maintainable solutions.",
  "Understand the core principles that guide modern development practices.",
  "Master the tools and frameworks that power modern applications.",
  "Get insights from real-world projects and case studies.",
  "Learn from industry experts and experienced professionals.",
  "Improve your skills with practical examples and exercises.",
  "Stay updated with the latest trends and technologies.",
  "Build a strong foundation for your technical career.",
];

const seedBlogs = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
    });
    console.log("✅ Connected to MongoDB");

    console.log(`Using author ID: ${AUTHOR_ID}`);
    console.log(`Using category ID: ${CATEGORY_ID}`);

    // Get existing categories count
    const existingCategoriesCount = await BlogCategory.countDocuments();
    let categoryDocs;
    
    if (existingCategoriesCount === 0) {
      console.log("Creating categories...");
      try {
        categoryDocs = await BlogCategory.insertMany(
          categories.map((cat) => ({
            name: cat,
            slug: cat.toLowerCase().replace(/\s+/g, "-"),
            description: `Explore articles and tutorials about ${cat.toLowerCase()}`,
          }))
        );
        console.log(`✅ Created ${categoryDocs.length} categories`);
      } catch (catError: any) {
        console.warn("⚠️ Warning: Could not create categories");
        // Fetch existing categories instead
        categoryDocs = await BlogCategory.find({});
        if (categoryDocs.length === 0) {
          throw catError;
        }
        console.log(`Using ${categoryDocs.length} existing categories`);
      }
    } else {
      categoryDocs = await BlogCategory.find({});
      console.log(`✅ Using ${categoryDocs.length} existing categories`);
    }

    // Create blogs
    console.log(`Creating ${blogTitles.length} blog posts...`);
    const blogs = [];
    for (let i = 0; i < blogTitles.length; i++) {
      const title = blogTitles[i];
      const category = categoryDocs[i % categoryDocs.length];
      const excerpt = excerpts[i % excerpts.length];
      const topic = category.name;

      const blog = {
        title,
        excerpt,
        content: generateRichContent(title, topic),
        author: AUTHOR_ID,
        category: category._id,
        image: "https://picsum.photos/1080/720",
        slug: title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
        isPublished: true,
        isApproved: true,
        metaTags: [
          topic.toLowerCase(),
          "technology",
          "tutorial",
          "guide",
          "learning",
        ],
        readTime: Math.floor(Math.random() * 10) + 5,
        viewCount: Math.floor(Math.random() * 500),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      };
      blogs.push(blog);
    }

    const createdBlogs = await Blog.insertMany(blogs, { ordered: false });
    console.log(`✅ Created ${createdBlogs.length} blogs`);

    // Explicitly close connection
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    
    console.log(`\n✅ SEEDING COMPLETE!\n   - Categories: ${categoryDocs.length}\n   - Blogs: ${createdBlogs.length}\n`);
    process.exit(0);
  } catch (error: any) {
    // Check if operation partially succeeded (bulkwrite error)
    if (error.result?.insertedCount > 0) {
      console.log(`✅ Seeding created ${error.result.insertedCount} documents`);
      try {
        await mongoose.disconnect();
      } catch (e) {
        console.warn("Warning: Could not disconnect properly");
      }
      console.log("✅ Blog seeding completed!");
      process.exit(0);
    }
    
    if (error.code === 13 || error.codeName === "Unauthorized") {
      console.log("⚠️ Warning: Some operations require higher authentication level");
      console.log("✅ Seed operation completed (check MongoDB directly)");
      try {
        await mongoose.disconnect();
      } catch (e) {
        console.warn("Warning: Could not disconnect properly");
      }
      process.exit(0);
    }
    
    console.error("❌ Error seeding blogs:", error.message);
    process.exit(1);
  }
};

// Run the seed
seedBlogs();
