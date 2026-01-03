const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learn-grow';

// Define User schema inline
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String },
  role: { type: String, enum: ['student', 'instructor', 'guardian', 'admin', 'manager', 'super_admin'], default: 'student' },
  isVerified: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

const testUsers = [
  {
    name: 'M. Jabed (Admin)',
    phone: '01706276447',
    email: 'admin@example.com',
    password: '@M.jabed3834',
    role: 'admin',
  },
  {
    name: 'Teacher One',
    phone: '01711111111',
    email: 'instructor@example.com',
    password: 'teacher123',
    role: 'instructor',
  },
  {
    name: 'Student One',
    phone: '01722222222',
    email: 'student@example.com',
    password: 'student123',
    role: 'student',
  },
  {
    name: 'Guardian One',
    phone: '01733333333',
    email: 'guardian@example.com',
    password: 'guardian123',
    role: 'guardian',
  },
];

async function seedTestUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI}\n`);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check existing users
    const existingCount = await User.countDocuments();
    console.log(`📊 Existing users: ${existingCount}`);

    // Create test users
    console.log('\n📝 Seeding test users...\n');

    for (const userData of testUsers) {
      try {
        // Check if user with this phone already exists
        const existingUser = await User.findOne({ phone: userData.phone });

        if (existingUser) {
          console.log(`⏭️  User with phone ${userData.phone} already exists. Skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const user = await User.create({
          ...userData,
          password: hashedPassword,
          isVerified: true,
          isApproved: true,
        });

        console.log(`✅ Created ${userData.role.toUpperCase()}`);
        console.log(`   Name: ${userData.name}`);
        console.log(`   Phone: ${userData.phone}`);
        console.log(`   Password: ${userData.password} (hashed)`);
        console.log(`   ID: ${user._id}\n`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Duplicate entry for ${userData.phone}. Skipping...\n`);
        } else {
          console.error(`❌ Error creating user:`, error.message);
        }
      }
    }

    console.log('✨ Test users seeding completed!');
    console.log('\n📋 Test Login Credentials:');
    console.log('─'.repeat(50));
    testUsers.forEach((user) => {
      console.log(`\n[${user.role.toUpperCase()}]`);
      console.log(`  Phone: ${user.phone}`);
      console.log(`  Password: ${user.password}`);
    });
    console.log('\n' + '─'.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedTestUsers();
