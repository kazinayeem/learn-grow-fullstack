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
    isPublished: false,
    isRemote: false,
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
    console.log(`  - Published: ${insertedJobs.filter(j => j.isPublished).length}`);
    console.log(`  - Unpublished: ${insertedJobs.filter(j => !j.isPublished).length}`);
    console.log(`  - Remote: ${insertedJobs.filter(j => j.isRemote).length}`);
    console.log(`  - On-site: ${insertedJobs.filter(j => !j.isRemote).length}`);
    
    console.log("\n✨ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding job posts:", error);
    process.exit(1);
  }
}

seedJobs();
