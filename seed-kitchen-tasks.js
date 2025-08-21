// Script: seed-kitchen-tasks.js
// Purpose: Assign three predefined kitchen tasks to EVERY kitchen staff member
// Usage: node seed-kitchen-tasks.js

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

const kitchenTasks = [
  {
    title: 'Prepare Breakfast Buffet',
    description: 'Set up and prepare breakfast buffet for hotel guests.',
    department: 'kitchen',
    priority: 'high',
    location: 'kitchen',
    category: 'food_preparation',
    estimatedDuration: 120,
    materials: ['cooking utensils', 'ingredients'],
    tags: ['breakfast', 'buffet'],
    isUrgent: true,
  },
  {
    title: 'Prepare Dinner Menu Items',
    description: 'Prepare main course items for dinner service.',
    department: 'kitchen',
    priority: 'medium',
    location: 'kitchen',
    category: 'cooking',
    estimatedDuration: 90,
    materials: ['cooking ingredients', 'recipe book'],
    tags: ['dinner', 'cooking'],
  },
  {
    title: 'Kitchen Equipment Maintenance',
    description: 'Clean and maintain kitchen equipment for food safety.',
    department: 'kitchen',
    priority: 'low',
    location: 'kitchen',
    category: 'equipment',
    estimatedDuration: 60,
    materials: ['cleaning supplies', 'maintenance tools'],
    tags: ['equipment', 'maintenance'],
  },
];

async function assignTasksToAllKitchenStaff() {
  // Find all kitchen staff profiles
  const staffProfiles = await StaffProfile.find({ department: 'kitchen', isActive: true });
  if (staffProfiles.length === 0) {
    console.warn('⚠️  No kitchen staff profiles found. Aborting.');
    return;
  }

  console.log(`👨‍🍳 Found ${staffProfiles.length} kitchen staff. Assigning tasks...`);

  for (const profile of staffProfiles) {
    const user = await User.findById(profile.userId);
    if (!user) {
      console.warn(`⚠️  Skipping profile ${profile._id} – linked user not found`);
      continue;
    }

    for (const taskData of kitchenTasks) {
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
    console.log('🏨 Seeding kitchen tasks to all kitchen staff...');
    await connectDB();
    await assignTasksToAllKitchenStaff();
    console.log('🎉 Done seeding kitchen tasks.');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main(); 