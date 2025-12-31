const mongoose = require('mongoose');
require('dotenv').config();

const INSTRUCTOR_ID = '6952577980ee5a7cebb59a74';
const COURSE_ID = '6952bcab6b638e58891980ab';
const TOTAL_CLASSES = 500;

// MongoDB connection - use environment variable (MongoDB Atlas)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learn-grow';

// Define schema inline
const liveClassSchema = new mongoose.Schema({
  title: String,
  courseId: mongoose.Schema.Types.ObjectId,
  instructorId: mongoose.Schema.Types.ObjectId,
  scheduledAt: Date,
  duration: Number,
  platform: { type: String, enum: ['Zoom', 'Meet', 'Other'] },
  meetingLink: String,
  recordedLink: { type: String, default: null },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  isApproved: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date,
});

const LiveClass = mongoose.model('LiveClass', liveClassSchema);

async function seedLiveClasses() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI}\n`);

    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB\n');

    // Check existing
    const existingCount = await LiveClass.countDocuments();
    console.log(`📊 Existing live classes: ${existingCount}`);

    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} classes.\n`);
      const response = await question('Continue seeding? (y/n): ');
      if (response.toLowerCase() !== 'y') {
        console.log('❌ Seeding cancelled.\n');
        process.exit(0);
      }
    }

    console.log(`\n🌱 Seeding 500 live classes...`);
    console.log(`   - 400 COMPLETED classes (past dates with recordings)`);
    console.log(`   - 100 SCHEDULED classes (upcoming dates)`);
    console.log(`   Instructor ID: ${INSTRUCTOR_ID}`);
    console.log(`   Course ID: ${COURSE_ID}\n`);

    const platforms = ['Zoom', 'Meet', 'Other'];
    const titles = [
      'React Basics',
      'Advanced JavaScript',
      'Node.js Fundamentals',
      'Database Design',
      'API Development',
      'Frontend Optimization',
      'Testing Strategies',
      'Deployment Guide',
      'Cloud Architecture',
      'Mobile Development',
      'Web Security',
      'Performance Tuning',
      'Design Patterns',
      'Microservices',
      'DevOps Essentials',
    ];

    const classes = [];
    const now = new Date();

    // ====== CREATE 400 COMPLETED CLASSES (PAST DATES) ======
    console.log('📝 Creating 400 COMPLETED classes (past dates)...');
    for (let i = 1; i <= 400; i++) {
      // Past dates: -60 to -1 days
      const daysOffset = -(Math.floor(Math.random() * 60) + 1);
      const scheduledAt = new Date(now);
      scheduledAt.setDate(scheduledAt.getDate() + daysOffset);
      scheduledAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

      // Meeting link
      const meetingId = Math.random().toString(36).substring(2, 11);
      const meetingLink = `https://zoom.us/j/${meetingId}`;

      // Recording link for ALL completed classes (100% have recordings)
      const recordings = [
        `https://youtu.be/video${i}`,
        `https://vimeo.com/${1000000 + i}`,
        `https://drive.google.com/file/d/video${i}`,
      ];
      const recordedLink = recordings[Math.floor(Math.random() * recordings.length)];

      classes.push({
        title: `${titles[i % titles.length]} - Session ${Math.floor(i / 15) + 1}`,
        courseId: new mongoose.Types.ObjectId(COURSE_ID),
        instructorId: new mongoose.Types.ObjectId(INSTRUCTOR_ID),
        scheduledAt,
        duration: (Math.floor(Math.random() * 4) + 1) * 30,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        meetingLink,
        recordedLink,
        status: 'Completed',
        isApproved: true,
        createdAt: new Date(scheduledAt.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      });

      if (i % 100 === 0) {
        console.log(`   ✅ Created ${i} completed classes...`);
      }
    }

    // ====== CREATE 100 SCHEDULED CLASSES (UPCOMING DATES) ======
    console.log('📝 Creating 100 SCHEDULED classes (upcoming dates)...');
    for (let i = 401; i <= 500; i++) {
      // Future dates: +1 to +60 days
      const daysOffset = Math.floor(Math.random() * 60) + 1;
      const scheduledAt = new Date(now);
      scheduledAt.setDate(scheduledAt.getDate() + daysOffset);
      scheduledAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

      // Meeting link
      const meetingId = Math.random().toString(36).substring(2, 11);
      const meetingLink = `https://zoom.us/j/${meetingId}`;

      classes.push({
        title: `${titles[i % titles.length]} - Session ${Math.floor(i / 15) + 1}`,
        courseId: new mongoose.Types.ObjectId(COURSE_ID),
        instructorId: new mongoose.Types.ObjectId(INSTRUCTOR_ID),
        scheduledAt,
        duration: (Math.floor(Math.random() * 4) + 1) * 30,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        meetingLink,
        recordedLink: null,
        status: 'Scheduled',
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if ((i - 400) % 50 === 0) {
        console.log(`   ✅ Created ${i - 400} scheduled classes...`);
      }
    }

    console.log(`\n💾 Inserting ${classes.length} classes into database...`);
    const result = await LiveClass.insertMany(classes);
    console.log(`✅ Successfully inserted ${result.length} classes!\n`);

    // Statistics
    const total = await LiveClass.countDocuments();
    const scheduled = await LiveClass.countDocuments({ status: 'Scheduled' });
    const completed = await LiveClass.countDocuments({ status: 'Completed' });
    const cancelled = await LiveClass.countDocuments({ status: 'Cancelled' });
    const approved = await LiveClass.countDocuments({ isApproved: true });
    const pending = await LiveClass.countDocuments({ isApproved: false });
    const withRecordings = await LiveClass.countDocuments({ recordedLink: { $exists: true, $ne: null } });

    console.log('📊 Database Statistics:');
    console.log(`   Total Classes: ${total}`);
    console.log(`   Scheduled (Upcoming): ${scheduled}`);
    console.log(`   Completed (Past): ${completed}`);
    console.log(`   Cancelled: ${cancelled}`);
    console.log(`   Approved: ${approved}`);
    console.log(`   Pending Approval: ${pending}`);
    console.log(`   With Recordings: ${withRecordings}\n`);

    console.log('✅ Seeding complete!\n');
    console.log('🎬 All 400 completed classes have recordings ready!');
    console.log('📅 All 100 scheduled classes are upcoming!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure MongoDB is running: mongod');
    console.error('2. Check connection: mongodb://localhost:27017/learn-grow');
    console.error('3. Verify IDs are correct');
    console.error('4. Check database name: learn-grow\n');
    process.exit(1);
  }
}

// Simple question prompt for Node.js
function question(query) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

seedLiveClasses();
