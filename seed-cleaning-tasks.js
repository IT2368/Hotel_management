// Script: seed-cleaning-tasks.js
// Purpose: Assign three predefined cleaning tasks to EVERY cleaning staff member
// Usage: node seed-cleaning-tasks.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models from backend
import User from './backend/models/User.js';
import StaffProfile from './backend/models/profiles/StaffProfile.js';
import StaffTask from './backend/models/StaffTask.js';

dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected to MongoDB: ${MONGODB_URI}`);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

const cleaningTasks = [
  {
    title: 'Collect Laundry from All Floors',
    description: 'Collect all dirty laundry for washing.',
    department: 'cleaning',
    priority: 'low',
    location: 'other',
    category: 'laundry',
    estimatedDuration: 60,
    materials: ['laundry cart'],
    tags: ['routine', 'laundry'],
  },
  {
    title: 'Deep Clean Room 205',
    description: 'Guest checked out. Room needs deep cleaning and sanitization.',
    department: 'cleaning',
    priority: 'high',
    location: 'room',
    roomNumber: '205',
    category: 'deep_cleaning',
    estimatedDuration: 90,
    materials: ['cleaning supplies', 'vacuum', 'mop'],
    tags: ['deep_cleaning', 'room'],
    isUrgent: true,
  },
  {
    title: 'Restock Mini Bar in All Rooms',
    description: 'Check and restock mini bar items in all guest rooms.',
    department: 'cleaning',
    priority: 'medium',
    location: 'room',
    category: 'restocking',
    estimatedDuration: 180,
    materials: ['mini bar items', 'inventory list'],
    tags: ['restocking', 'mini_bar'],
  },
];

async function assignTasksToAllCleaningStaff() {
  // Find all cleaning staff profiles
  const staffProfiles = await StaffProfile.find({ department: 'cleaning', isActive: true });
  if (staffProfiles.length === 0) {
    console.warn('⚠️  No cleaning staff profiles found. Aborting.');
    return;
  }

  console.log(`🧹 Found ${staffProfiles.length} cleaning staff. Assigning tasks...`);

  for (const profile of staffProfiles) {
    const user = await User.findById(profile.userId);
    if (!user) {
      console.warn(`⚠️  Skipping profile ${profile._id} – linked user not found`);
      continue;
    }

    for (const taskData of cleaningTasks) {
      // Avoid duplicates (same title assigned to same user)
      const exists = await StaffTask.findOne({ title: taskData.title, assignedTo: user._id });
      if (exists) {
        console.log(`↺ Skipping existing task for ${user.name}: ${taskData.title}`);
        continue;
      }

      const task = new StaffTask({
        ...taskData,
        assignedTo: user._id,
        assignedBy: user._id, // Adjust if you want a manager/admin as assigner
        status: 'pending',
      });

      await task.save();
      console.log(`✅ Created task for ${user.name}: ${task.title}`);
    }
  }
}

async function main() {
  try {
    console.log('🏨 Seeding cleaning tasks to all cleaning staff...');
    await connectDB();
    await assignTasksToAllCleaningStaff();
    console.log('🎉 Done seeding cleaning tasks.');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main(); 