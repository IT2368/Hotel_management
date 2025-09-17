// Script: seed-service-tasks.js
// Purpose: Assign three predefined service tasks to EVERY service staff member
// Usage: node seed-service-tasks.js

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

const serviceTasks = [
  {
    title: 'Serve Drinks at Pool Area',
    description: 'Bring ordered drinks to guests at pool.',
    department: 'service',
    priority: 'medium',
    location: 'pool',
    category: 'guest_request',
    estimatedDuration: 20,
    materials: ['drink tray', 'napkins'],
    tags: ['guest_service', 'pool'],
  },
  {
    title: 'Guest Transportation Request',
    description: 'Guest in Room 301 needs transportation to airport at 2 PM.',
    department: 'service',
    priority: 'medium',
    location: 'lobby',
    roomNumber: '301',
    category: 'transportation',
    estimatedDuration: 30,
    materials: ['vehicle', 'guest list'],
    tags: ['transportation', 'airport'],
  },
  {
    title: 'Concierge Guest Assistance',
    description: 'Assist guest with restaurant reservations and local attractions.',
    department: 'service',
    priority: 'low',
    location: 'lobby',
    category: 'concierge',
    estimatedDuration: 45,
    materials: ['concierge guide', 'reservation system'],
    tags: ['concierge', 'guest_assistance'],
  },
];

async function assignTasksToAllServiceStaff() {
  // Find all service staff profiles
  const staffProfiles = await StaffProfile.find({ department: 'service', isActive: true });
  if (staffProfiles.length === 0) {
    console.warn('⚠️  No service staff profiles found. Aborting.');
    return;
  }

  console.log(`👔 Found ${staffProfiles.length} service staff. Assigning tasks...`);

  for (const profile of staffProfiles) {
    const user = await User.findById(profile.userId);
    if (!user) {
      console.warn(`⚠️  Skipping profile ${profile._id} – linked user not found`);
      continue;
    }

    for (const taskData of serviceTasks) {
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
    console.log('🏨 Seeding service tasks to all service staff...');
    await connectDB();
    await assignTasksToAllServiceStaff();
    console.log('🎉 Done seeding service tasks.');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main(); 