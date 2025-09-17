// Script to assign tasks to staff members based on department
// Run this script to properly assign tasks to the correct staff

import mongoose from 'mongoose';
import User from './backend/models/User.js';
import StaffProfile from './backend/models/profiles/StaffProfile.js';
import StaffTask from './backend/models/StaffTask.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Get staff member by department
const getStaffByDepartment = async (department) => {
  try {
    const staffProfile = await StaffProfile.findOne({ department });
    if (!staffProfile) {
      throw new Error(`No staff found for department: ${department}`);
    }
    
    const user = await User.findById(staffProfile.userId);
    if (!user) {
      throw new Error(`User not found for staff profile: ${staffProfile._id}`);
    }
    
    return { user, staffProfile };
  } catch (error) {
    console.error(`❌ Error finding staff for department ${department}:`, error);
    throw error;
  }
};

// Create and assign task
const createAndAssignTask = async (taskData) => {
  try {
    // Get the staff member for this department
    const { user } = await getStaffByDepartment(taskData.department);
    
    // Create the task
    const task = new StaffTask({
      ...taskData,
      assignedTo: user._id,
      assignedBy: user._id, // For now, assign by the same user
      status: "pending"
    });
    
    await task.save();
    console.log(`✅ Created task: "${taskData.title}" assigned to ${user.name} (${taskData.department})`);
    
    return task;
  } catch (error) {
    console.error(`❌ Error creating task "${taskData.title}":`, error);
    throw error;
  }
};

// Task data to be assigned
const tasksToAssign = [
  {
    title: "Repair Leaking Pipe in Room 102",
    description: "Bathroom sink pipe is leaking.",
    department: "maintenance",
    priority: "high",
    location: "room",
    roomNumber: "102",
    category: "plumbing",
    estimatedDuration: 40,
    materials: ["pipe wrench", "replacement pipe", "plumber's tape"],
    tags: ["urgent", "plumbing"]
  },
  {
    title: "Collect Laundry from All Floors",
    description: "Collect all dirty laundry for washing.",
    department: "cleaning",
    priority: "low",
    location: "other",
    category: "laundry",
    estimatedDuration: 60,
    materials: ["laundry cart"],
    tags: ["routine", "laundry"]
  },
  {
    title: "Serve Drinks at Pool Area",
    description: "Bring ordered drinks to guests at pool.",
    department: "service",
    priority: "medium",
    location: "pool",
    category: "guest_request",
    estimatedDuration: 20,
    materials: ["drink tray", "napkins"],
    tags: ["guest_service", "pool"]
  },
  {
    title: "Check Pool Pump Functionality",
    description: "Inspect swimming pool pump for maintenance.",
    department: "maintenance",
    priority: "medium",
    location: "pool",
    category: "equipment",
    estimatedDuration: 90,
    materials: ["multimeter", "screwdriver"],
    tags: ["equipment", "pool"]
  },
  {
    title: "Prepare Breakfast Buffet",
    description: "Set up and prepare breakfast buffet for hotel guests.",
    department: "kitchen",
    priority: "high",
    location: "kitchen",
    category: "food_preparation",
    estimatedDuration: 120,
    materials: ["cooking utensils", "ingredients"],
    tags: ["breakfast", "buffet"]
  },
  {
    title: "Deep Clean Room 205",
    description: "Guest checked out. Room needs deep cleaning and sanitization.",
    department: "cleaning",
    priority: "high",
    location: "room",
    roomNumber: "205",
    category: "deep_cleaning",
    estimatedDuration: 90,
    materials: ["cleaning supplies", "vacuum", "mop"],
    tags: ["deep_cleaning", "room"]
  },
  {
    title: "Guest Transportation Request",
    description: "Guest in Room 301 needs transportation to airport at 2 PM.",
    department: "service",
    priority: "medium",
    location: "lobby",
    roomNumber: "301",
    category: "transportation",
    estimatedDuration: 30,
    materials: ["vehicle", "guest list"],
    tags: ["transportation", "airport"]
  },
  {
    title: "Fix AC in Room 108",
    description: "Guest reported AC not working properly. Need to check and repair.",
    department: "maintenance",
    priority: "high",
    location: "room",
    roomNumber: "108",
    category: "hvac",
    estimatedDuration: 60,
    materials: ["AC tools", "refrigerant", "thermometer"],
    tags: ["hvac", "urgent"]
  },
  {
    title: "Restock Mini Bar in All Rooms",
    description: "Check and restock mini bar items in all guest rooms.",
    department: "cleaning",
    priority: "medium",
    location: "room",
    category: "restocking",
    estimatedDuration: 180,
    materials: ["mini bar items", "inventory list"],
    tags: ["restocking", "mini_bar"]
  },
  {
    title: "Prepare Dinner Menu Items",
    description: "Prepare main course items for dinner service.",
    department: "kitchen",
    priority: "medium",
    location: "kitchen",
    category: "cooking",
    estimatedDuration: 90,
    materials: ["cooking ingredients", "recipe book"],
    tags: ["dinner", "cooking"]
  }
];

// Main function
const main = async () => {
  try {
    console.log('🏨 Valdor Hotel - Assigning Tasks to Staff Members');
    console.log('==================================================');

    await connectDB();

    console.log('\n📝 Assigning tasks to staff members...\n');

    // Clear existing tasks first (optional - comment out if you want to keep existing)
    // await StaffTask.deleteMany({});
    // console.log('🗑️  Cleared existing tasks');

    for (const taskData of tasksToAssign) {
      await createAndAssignTask(taskData);
    }

    console.log('\n✅ All tasks assigned successfully!');
    console.log('\n📋 Task Assignment Summary:');
    console.log('============================');
    
    // Group tasks by department
    const tasksByDept = {};
    tasksToAssign.forEach(task => {
      if (!tasksByDept[task.department]) {
        tasksByDept[task.department] = [];
      }
      tasksByDept[task.department].push(task.title);
    });
    
    Object.entries(tasksByDept).forEach(([dept, tasks]) => {
      console.log(`\n${dept.toUpperCase()} DEPARTMENT:`);
      tasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task}`);
      });
    });

    console.log('\n🎉 Tasks are now properly assigned to staff members!');
    console.log('\n📖 Next Steps:');
    console.log('1. Staff can now see their assigned tasks in their dashboard');
    console.log('2. Tasks are filtered by department automatically');
    console.log('3. Staff can update task status and add notes');

  } catch (error) {
    console.error('❌ Error in main function:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
main(); 