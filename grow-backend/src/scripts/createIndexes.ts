import mongoose from 'mongoose';
import { ENV } from '../config/env.js';

const createIndexes = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    console.log('Creating indexes...');

    // User collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ isApproved: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ role: 1, isApproved: 1 });
    await db.collection('users').createIndex({ email: 1, role: 1 });

    // Course collection indexes
    await db.collection('courses').createIndex({ title: 'text', description: 'text' });
    await db.collection('courses').createIndex({ categoryId: 1 });
    await db.collection('courses').createIndex({ instructorId: 1 });
    await db.collection('courses').createIndex({ status: 1 });
    await db.collection('courses').createIndex({ createdAt: -1 });
    await db.collection('courses').createIndex({ price: 1 });
    await db.collection('courses').createIndex({ status: 1, categoryId: 1 });
    await db.collection('courses').createIndex({ instructorId: 1, status: 1 });

    // Enrollment collection indexes
    await db.collection('enrollments').createIndex({ studentId: 1, courseId: 1 }, { unique: true });
    await db.collection('enrollments').createIndex({ courseId: 1 });
    await db.collection('enrollments').createIndex({ studentId: 1 });
    await db.collection('enrollments').createIndex({ enrolledAt: -1 });

    // Order collection indexes
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ userId: 1, status: 1 });

    // Blog collection indexes
    await db.collection('blogs').createIndex({ title: 'text', content: 'text' });
    await db.collection('blogs').createIndex({ slug: 1 }, { unique: true });
    await db.collection('blogs').createIndex({ published: 1 });
    await db.collection('blogs').createIndex({ createdAt: -1 });
    await db.collection('blogs').createIndex({ authorId: 1 });

    // LiveClass collection indexes
    await db.collection('liveclasses').createIndex({ courseId: 1 });
    await db.collection('liveclasses').createIndex({ instructorId: 1 });
    await db.collection('liveclasses').createIndex({ scheduledAt: 1 });
    await db.collection('liveclasses').createIndex({ status: 1 });
    await db.collection('liveclasses').createIndex({ scheduledAt: 1, status: 1 });

    // Event collection indexes
    await db.collection('events').createIndex({ date: 1 });
    await db.collection('events').createIndex({ createdAt: -1 });
    
    // Category collection
    await db.collection('categories').createIndex({ name: 1 }, { unique: true });

    console.log('✅ All indexes created successfully');
    
    // List all indexes for verification
    const collections = ['users', 'courses', 'enrollments', 'orders', 'blogs', 'liveclasses', 'events'];
    for (const collName of collections) {
      try {
        const indexes = await db.collection(collName).indexes();
        console.log(`\n📊 ${collName} indexes:`, indexes.length);
        indexes.forEach(idx => {
          console.log(`  - ${JSON.stringify(idx.key)}`);
        });
      } catch (err) {
        console.log(`  - Collection ${collName} does not exist yet`);
      }
    }

  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createIndexes();
