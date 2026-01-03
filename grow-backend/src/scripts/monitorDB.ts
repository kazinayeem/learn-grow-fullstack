import mongoose from 'mongoose';
import { ENV } from '../config/env.js';

const monitorDB = async () => {
  try {
    await mongoose.connect(ENV.MONGODB_URI);
    const db = mongoose.connection.db;

    // Get database stats
    const stats = await db.stats();
    console.log('\n📊 Database Statistics:');
    console.log(`- Database: ${stats.db}`);
    console.log(`- Collections: ${stats.collections}`);
    console.log(`- Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Indexes: ${stats.indexes}`);
    console.log(`- Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);

    // Get collection details
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections:');
    for (const coll of collections) {
      const collStats = await db.command({ collStats: coll.name });
      console.log(`\n${coll.name}:`);
      console.log(`  - Documents: ${collStats.count}`);
      console.log(`  - Avg Document Size: ${collStats.avgObjSize} bytes`);
      console.log(`  - Total Size: ${(collStats.size / 1024 / 1024).toFixed(2)} MB`);
      
      // List indexes
      const indexes = await db.collection(coll.name).listIndexes().toArray();
      console.log(`  - Indexes: ${indexes.length}`);
      indexes.forEach(idx => {
        console.log(`    * ${JSON.stringify(idx.key)}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

monitorDB();
