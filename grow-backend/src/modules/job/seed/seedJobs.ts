import { connectDB } from "@/database/mongoose";
import { JobPost } from "../model/jobPost.model";
import { config } from "@/config/index";

const jobData = [
  {
    title: "Senior Full Stack Developer",
    jobType: "Full-time",
    department: "Engineering",
    location: "New York, NY",
    salaryRange: {
      min: 120000,
      max: 180000,
      currency: "USD",
    },
    description: "We are seeking an experienced Full Stack Developer to join our growing engineering team. You will work on cutting-edge web applications using modern technologies and contribute to the architecture and design of our platform.",
    requirements: [
      "5+ years of experience in web development",
      "Strong proficiency in React and Node.js",
      "Experience with MongoDB and TypeScript",
      "Knowledge of cloud platforms (AWS/Azure)",
      "Excellent problem-solving skills",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Frontend Developer",
    jobType: "Full-time",
    department: "Engineering",
    location: "San Francisco, CA",
    salaryRange: {
      min: 90000,
      max: 140000,
      currency: "USD",
    },
    description: "Join our team as a Frontend Developer and help build beautiful, responsive user interfaces. You'll work closely with designers and backend developers to create seamless user experiences.",
    requirements: [
      "3+ years of React experience",
      "Strong CSS and HTML skills",
      "Experience with state management (Redux/Zustand)",
      "Understanding of responsive design principles",
      "Portfolio of previous work",
    ],
    isPublished: true,
    isRemote: false,
  },
  {
    title: "Backend Engineer",
    jobType: "Full-time",
    department: "Engineering",
    location: "Austin, TX",
    salaryRange: {
      min: 100000,
      max: 150000,
      currency: "USD",
    },
    description: "We're looking for a Backend Engineer to design and develop scalable APIs and microservices. You'll work on high-performance systems that power our platform.",
    requirements: [
      "4+ years of backend development experience",
      "Expertise in Node.js or Python",
      "Experience with RESTful API design",
      "Knowledge of database optimization",
      "Familiarity with Docker and Kubernetes",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Marketing Manager",
    jobType: "Full-time",
    department: "Marketing",
    location: "Los Angeles, CA",
    salaryRange: {
      min: 80000,
      max: 120000,
      currency: "USD",
    },
    description: "Lead our marketing initiatives and drive brand awareness. You'll develop marketing strategies, manage campaigns, and work with cross-functional teams to achieve business goals.",
    requirements: [
      "5+ years of marketing experience",
      "Strong understanding of digital marketing",
      "Experience with marketing analytics tools",
      "Excellent communication skills",
      "Proven track record of successful campaigns",
    ],
    isPublished: true,
    isRemote: false,
  },
  {
    title: "UX/UI Designer",
    jobType: "Contract",
    department: "Design",
    location: "Remote",
    salaryRange: {
      min: 70000,
      max: 110000,
      currency: "USD",
    },
    description: "Create intuitive and visually appealing user interfaces for our products. You'll conduct user research, create wireframes, and collaborate with developers to implement designs.",
    requirements: [
      "3+ years of UX/UI design experience",
      "Proficiency in Figma or Sketch",
      "Strong portfolio demonstrating design process",
      "Understanding of user-centered design principles",
      "Experience with prototyping tools",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Data Analyst",
    jobType: "Full-time",
    department: "Analytics",
    location: "Chicago, IL",
    salaryRange: {
      min: 75000,
      max: 105000,
      currency: "USD",
    },
    description: "Analyze complex datasets to provide actionable insights that drive business decisions. You'll work with stakeholders across the organization to identify trends and opportunities.",
    requirements: [
      "3+ years of data analysis experience",
      "Strong SQL skills",
      "Experience with Python or R",
      "Knowledge of data visualization tools (Tableau, Power BI)",
      "Excellent analytical and communication skills",
    ],
    isPublished: true,
    isRemote: false,
  },
  {
    title: "DevOps Engineer",
    jobType: "Full-time",
    department: "Engineering",
    location: "Seattle, WA",
    salaryRange: {
      min: 110000,
      max: 160000,
      currency: "USD",
    },
    description: "Build and maintain our infrastructure and deployment pipelines. You'll work on automating processes, improving system reliability, and ensuring smooth deployments.",
    requirements: [
      "4+ years of DevOps experience",
      "Strong knowledge of AWS or GCP",
      "Experience with CI/CD tools (Jenkins, GitHub Actions)",
      "Proficiency in Infrastructure as Code (Terraform, CloudFormation)",
      "Strong scripting skills (Bash, Python)",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Product Manager",
    jobType: "Full-time",
    department: "Product",
    location: "Boston, MA",
    salaryRange: {
      min: 95000,
      max: 140000,
      currency: "USD",
    },
    description: "Lead product strategy and execution for our flagship product. You'll work with engineering, design, and business teams to define features and prioritize the product roadmap.",
    requirements: [
      "5+ years of product management experience",
      "Strong technical background",
      "Experience with Agile methodologies",
      "Excellent stakeholder management skills",
      "Data-driven decision making",
    ],
    isPublished: true,
    isRemote: false,
  },
  {
    title: "Junior Software Developer",
    jobType: "Internship",
    department: "Engineering",
    location: "Denver, CO",
    salaryRange: {
      min: 50000,
      max: 65000,
      currency: "USD",
    },
    description: "Start your career in software development with our internship program. You'll work on real projects, learn from experienced developers, and gain hands-on experience with modern technologies.",
    requirements: [
      "Recent computer science graduate or final year student",
      "Basic knowledge of programming (JavaScript, Python, or Java)",
      "Strong desire to learn",
      "Good problem-solving skills",
      "Team player with good communication",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Customer Success Manager",
    jobType: "Part-time",
    department: "Customer Success",
    location: "Miami, FL",
    salaryRange: {
      min: 55000,
      max: 75000,
      currency: "USD",
    },
    description: "Help our customers achieve success with our platform. You'll provide support, conduct training sessions, and work to improve customer satisfaction and retention.",
    requirements: [
      "2+ years of customer success experience",
      "Excellent communication skills",
      "Problem-solving mindset",
      "Experience with CRM tools",
      "Empathy and patience",
    ],
    isPublished: true,
    isRemote: false,
  },
  // Additional 10+ jobs for 20+ total
  {
    title: "Mobile App Developer (iOS)",
    jobType: "Full-time",
    department: "Engineering",
    location: "San Francisco, CA",
    salaryRange: {
      min: 100000,
      max: 160000,
      currency: "USD",
    },
    description: "Develop native iOS applications with Swift. You'll work on building high-performance mobile apps that delight our users.",
    requirements: [
      "4+ years of iOS development experience",
      "Strong Swift and Objective-C knowledge",
      "Experience with iOS frameworks and APIs",
      "Understanding of mobile UI/UX patterns",
      "App Store deployment experience",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Android Developer",
    jobType: "Full-time",
    department: "Engineering",
    location: "Austin, TX",
    salaryRange: {
      min: 95000,
      max: 150000,
      currency: "USD",
    },
    description: "Create powerful Android applications using Kotlin and Java. You'll build apps that reach millions of users.",
    requirements: [
      "3+ years of Android development experience",
      "Proficiency in Kotlin and Java",
      "Experience with Android frameworks",
      "Knowledge of Material Design principles",
      "Google Play deployment experience",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Solutions Architect",
    jobType: "Full-time",
    department: "Engineering",
    location: "New York, NY",
    salaryRange: {
      min: 130000,
      max: 180000,
      currency: "USD",
    },
    description: "Design comprehensive technical solutions for enterprise clients. You'll work with stakeholders to understand requirements and create scalable architectures.",
    requirements: [
      "8+ years of software architecture experience",
      "Deep knowledge of cloud platforms",
      "Experience with enterprise systems",
      "Strong communication skills",
      "Certifications (AWS Solutions Architect, etc.)",
    ],
    isPublished: true,
    isRemote: false,
  },
  {
    title: "QA Engineer",
    jobType: "Full-time",
    department: "Quality Assurance",
    location: "Boston, MA",
    salaryRange: {
      min: 70000,
      max: 105000,
      currency: "USD",
    },
    description: "Ensure product quality through comprehensive testing strategies. You'll design test cases, identify bugs, and work with developers to resolve issues.",
    requirements: [
      "3+ years of QA testing experience",
      "Experience with automated testing tools",
      "Knowledge of testing frameworks",
      "Understanding of QA best practices",
      "Good attention to detail",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Business Analyst",
    jobType: "Full-time",
    department: "Business Operations",
    location: "Chicago, IL",
    salaryRange: {
      min: 75000,
      max: 115000,
      currency: "USD",
    },
    description: "Bridge the gap between business and technology. You'll analyze business requirements, create functional specifications, and ensure successful project delivery.",
    requirements: [
      "4+ years of business analysis experience",
      "Strong requirements gathering skills",
      "Experience with process improvement",
      "Excellent documentation abilities",
      "Stakeholder communication skills",
    ],
    isPublished: true,
    isRemote: false,
  },
  {
    title: "Machine Learning Engineer",
    jobType: "Full-time",
    department: "AI/ML",
    location: "San Francisco, CA",
    salaryRange: {
      min: 130000,
      max: 190000,
      currency: "USD",
    },
    description: "Build and train machine learning models that power our intelligent features. You'll work on NLP, computer vision, and predictive analytics.",
    requirements: [
      "4+ years of ML engineering experience",
      "Proficiency in Python and TensorFlow/PyTorch",
      "Experience with data preprocessing and feature engineering",
      "Understanding of ML algorithms and statistics",
      "Strong mathematical background",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Cloud Engineer",
    jobType: "Full-time",
    department: "Infrastructure",
    location: "Seattle, WA",
    salaryRange: {
      min: 105000,
      max: 155000,
      currency: "USD",
    },
    description: "Manage and optimize our cloud infrastructure. You'll work on scaling systems, improving performance, and ensuring high availability.",
    requirements: [
      "4+ years of cloud engineering experience",
      "Expert knowledge of AWS/Azure/GCP",
      "Experience with containerization (Docker, Kubernetes)",
      "Infrastructure automation skills",
      "Strong networking and security knowledge",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Content Writer",
    jobType: "Part-time",
    department: "Marketing",
    location: "Remote",
    salaryRange: {
      min: 40000,
      max: 60000,
      currency: "USD",
    },
    description: "Create engaging content for blogs, documentation, and marketing materials. You'll help communicate our product's value to customers.",
    requirements: [
      "2+ years of technical writing experience",
      "Strong writing and editing skills",
      "SEO knowledge",
      "Familiarity with markdown and documentation tools",
      "Research and fact-checking abilities",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Sales Executive",
    jobType: "Full-time",
    department: "Sales",
    location: "Los Angeles, CA",
    salaryRange: {
      min: 60000,
      max: 120000,
      currency: "USD",
    },
    description: "Drive revenue growth by identifying and closing deals. You'll build relationships with enterprise clients and manage the entire sales cycle.",
    requirements: [
      "3+ years of B2B sales experience",
      "Experience with SaaS products",
      "Strong negotiation skills",
      "CRM proficiency (Salesforce preferred)",
      "Self-motivated and results-oriented",
    ],
    isPublished: true,
    isRemote: false,
  },
  {
    title: "Security Engineer",
    jobType: "Full-time",
    department: "Security",
    location: "Boston, MA",
    salaryRange: {
      min: 115000,
      max: 165000,
      currency: "USD",
    },
    description: "Protect our systems and data from security threats. You'll implement security best practices, conduct vulnerability assessments, and respond to incidents.",
    requirements: [
      "5+ years of security engineering experience",
      "Knowledge of OWASP and security frameworks",
      "Experience with penetration testing",
      "Understanding of cryptography",
      "Security certifications (CISSP, CEH) preferred",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Technical Recruiter",
    jobType: "Full-time",
    department: "HR",
    location: "New York, NY",
    salaryRange: {
      min: 60000,
      max: 95000,
      currency: "USD",
    },
    description: "Build our engineering team by identifying and recruiting top tech talent. You'll conduct interviews and manage the recruitment process.",
    requirements: [
      "2+ years of technical recruiting experience",
      "Strong technical knowledge",
      "Excellent communication skills",
      "Networking abilities",
      "ATS platform proficiency",
    ],
    isPublished: true,
    isRemote: true,
  },
  {
    title: "Database Administrator",
    jobType: "Full-time",
    department: "Engineering",
    location: "Chicago, IL",
    salaryRange: {
      min: 85000,
      max: 130000,
      currency: "USD",
    },
    description: "Manage and optimize our database systems. You'll ensure data integrity, performance, and availability across our infrastructure.",
    requirements: [
      "4+ years of database administration experience",
      "Expertise in SQL and NoSQL databases",
      "Experience with backup and recovery procedures",
      "Performance tuning skills",
      "Strong problem-solving abilities",
    ],
    isPublished: true,
    isRemote: false,
  },
  {
    title: "Project Manager",
    jobType: "Full-time",
    department: "Project Management",
    location: "Denver, CO",
    salaryRange: {
      min: 80000,
      max: 120000,
      currency: "USD",
    },
    description: "Lead cross-functional projects from conception to completion. You'll manage timelines, budgets, and stakeholder expectations.",
    requirements: [
      "4+ years of project management experience",
      "PMP or Agile certification preferred",
      "Strong organizational skills",
      "Experience with project management tools",
      "Excellent leadership abilities",
    ],
    isPublished: true,
    isRemote: true,
  },
];

async function seedJobs() {
  try {
    console.log("🌱 Starting job posts seeding...");
    
    // Connect to database
    await connectDB(config.MONGODB_URI);
    
    // Clear existing job posts
    const deleteResult = await JobPost.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing job posts`);
    
    // Insert new job posts
    const insertedJobs = await JobPost.insertMany(jobData);
    console.log(`✅ Successfully seeded ${insertedJobs.length} job posts`);
    
    // Display summary
    console.log("\n📊 Job Posts Summary:");
    console.log(`  - Total: ${insertedJobs.length}`);
    console.log(`  - Published: ${insertedJobs.filter(j => j.isPublished).length}`);
    console.log(`  - Unpublished: ${insertedJobs.filter(j => !j.isPublished).length}`);
    console.log(`  - Remote: ${insertedJobs.filter(j => j.isRemote).length}`);
    console.log(`  - On-site: ${insertedJobs.filter(j => !j.isRemote).length}`);
    
    // Department breakdown
    const departments = new Map();
    insertedJobs.forEach(job => {
      departments.set(job.department, (departments.get(job.department) || 0) + 1);
    });
    console.log("\n📂 Jobs by Department:");
    departments.forEach((count, dept) => {
      console.log(`  - ${dept}: ${count}`);
    });
    
    console.log("\n✨ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding job posts:", error);
    process.exit(1);
  }
}

seedJobs();
