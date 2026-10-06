import { connectMongoDB, syncDataStoreToMongoDB } from '../database/mongodb.js';
import { memoryDb } from '../database/db.js';
import mongoose from 'mongoose';

async function main() {
  console.log('🚀 Starting MongoDB Data Migration for OPMD Care...');
  memoryDb.load();
  console.log(`📦 Loaded ${memoryDb.users.length} users, ${memoryDb.patientProfiles.length} patients, ${memoryDb.doctorProfiles.length} doctors, ${memoryDb.screenings.length} scans from data_store.json`);

  const connected = await connectMongoDB();
  if (connected) {
    await syncDataStoreToMongoDB();
    console.log('🎉 Successfully migrated and synchronized all collections to MongoDB!');
    console.log('👉 You can now open MongoDB Compass and inspect the "opmd_care" database!');
  } else {
    console.log('⚠️ Could not connect to MongoDB server. Ensure MongoDB is running on localhost:27017 or set MONGODB_URI in backend/.env');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
