// Script: seed-maintenance-tasks.js
// Purpose: Assign three predefined maintenance tasks to EVERY maintenance staff member
// Usage: node seed-maintenance-tasks.js

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

const maintenanceTasks = [
  {
    title: 'Repair Leaking Pipe in Room 102',
    description: 'Bathroom sink pipe is leaking.',
    department: 'maintenance',
    priority: 'high',
    location: 'room',
    roomNumber: '102',
    category: 'plumbing',
    estimatedDuration: 40,
    materials: ["pipe wrench", "replacement pipe", "plumber's tape"],
    tags: ['urgent', 'plumbing'],
    isUrgent: true,
  },
  {
    title: 'Check Pool Pump Functionality',
    description: 'Inspect swimming pool pump for maintenance.',
    department: 'maintenance',
    priority: 'medium',
    location: 'pool',
    category: 'equipment',
    estimatedDuration: 90,
    materials: ['multimeter', 'screwdriver'],
    tags: ['equipment', 'pool'],
  },
  {
    title: 'Fix AC in Room 108',
    description: 'Guest reported AC not working properly. Need to check and repair.',
    department: 'maintenance',
    priority: 'high',
    location: 'room',
    roomNumber: '108',
    category: 'hvac',
    estimatedDuration: 60,
    materials: ['AC tools', 'refrigerant', 'thermometer'],
    tags: ['hvac', 'urgent'],
    isUrgent: true,
  },
];

async function assignTasksToAllMaintenanceStaff() {
  // Find all maintenance staff profiles
  const staffProfiles = await StaffProfile.find({ department: 'maintenance', isActive: true });
  if (staffProfiles.length === 0) {
    console.warn('⚠️  No maintenance staff profiles found. Aborting.');
    return;
  }

  console.log(`👷 Found ${staffProfiles.length} maintenance staff. Assigning tasks...`);

  for (const profile of staffProfiles) {
    const user = await User.findById(profile.userId);
    if (!user) {
      console.warn(`⚠️  Skipping profile ${profile._id} – linked user not found`);
      continue;
    }

    for (const taskData of maintenanceTasks) {
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
    console.log('🏨 Seeding maintenance tasks to all maintenance staff...');
    await connectDB();
    await assignTasksToAllMaintenanceStaff();
    console.log('🎉 Done seeding maintenance tasks.');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main(); 