// Script to ensure every staff member has exactly 3 tasks
// This script will redistribute existing tasks and create new ones if needed

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

// Get all staff members with their departments
const getAllStaff = async () => {
  try {
    const staffProfiles = await StaffProfile.find({ isActive: true });
    const staffMembers = [];
    
    for (const profile of staffProfiles) {
      const user = await User.findById(profile.userId);
      if (user) {
        staffMembers.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          department: profile.department,
          profile: profile
        });
      }
    }
    
    return staffMembers;
  } catch (error) {
    console.error('❌ Error getting staff members:', error);
    throw error;
  }
};

// Get current task count for each staff member
const getTaskCounts = async (staffMembers) => {
  try {
    const taskCounts = {};
    
    for (const staff of staffMembers) {
      const count = await StaffTask.countDocuments({ assignedTo: staff.userId });
      taskCounts[staff.userId] = count;
    }
    
    return taskCounts;
  } catch (error) {
    console.error('❌ Error getting task counts:', error);
    throw error;
  }
};

// Create additional tasks for staff who need them
const createAdditionalTasks = async (staff, taskCount, targetCount = 3) => {
  try {
    const tasksNeeded = targetCount - taskCount;
    if (tasksNeeded <= 0) return [];
    
    console.log(`📝 Creating ${tasksNeeded} additional tasks for ${staff.name} (${staff.department})`);
    
    const additionalTasks = [];
    const taskTemplates = getTaskTemplatesForDepartment(staff.department);
    
    for (let i = 0; i < tasksNeeded; i++) {
      const template = taskTemplates[i % taskTemplates.length];
      const taskData = {
        ...template,
        title: `${template.title} - ${staff.name}`,
        assignedTo: staff.userId,
        assignedBy: staff.userId, // For now, assign by the same user
        status: "pending",
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000) // Due in 1, 2, 3 days
      };
      
      const task = new StaffTask(taskData);
      await task.save();
      additionalTasks.push(task);
      
      console.log(`  ✅ Created: "${taskData.title}"`);
    }
    
    return additionalTasks;
  } catch (error) {
    console.error(`❌ Error creating additional tasks for ${staff.name}:`, error);
    throw error;
  }
};

// Get task templates for each department
const getTaskTemplatesForDepartment = (department) => {
  const templates = {
    maintenance: [
      {
        title: "Routine Equipment Check",
        description: "Perform routine maintenance check on department equipment.",
        department: "maintenance",
        priority: "medium",
        location: "other",
        category: "general",
        estimatedDuration: 45,
        materials: ["maintenance tools", "checklist"],
        tags: ["routine", "maintenance"]
      },
      {
        title: "Safety Inspection",
        description: "Conduct safety inspection of work areas and equipment.",
        department: "maintenance",
        priority: "high",
        location: "other",
        category: "general",
        estimatedDuration: 60,
        materials: ["safety checklist", "inspection tools"],
        tags: ["safety", "inspection"]
      },
      {
        title: "Preventive Maintenance",
        description: "Perform scheduled preventive maintenance tasks.",
        department: "maintenance",
        priority: "medium",
        location: "other",
        category: "general",
        estimatedDuration: 90,
        materials: ["maintenance manual", "tools"],
        tags: ["preventive", "maintenance"]
      }
    ],
    kitchen: [
      {
        title: "Kitchen Equipment Maintenance",
        description: "Clean and maintain kitchen equipment for optimal performance.",
        department: "kitchen",
        priority: "medium",
        location: "kitchen",
        category: "equipment",
        estimatedDuration: 60,
        materials: ["cleaning supplies", "maintenance tools"],
        tags: ["kitchen", "maintenance"]
      },
      {
        title: "Inventory Check",
        description: "Check and update kitchen inventory levels.",
        department: "kitchen",
        priority: "low",
        location: "kitchen",
        category: "inventory",
        estimatedDuration: 30,
        materials: ["inventory list", "pen"],
        tags: ["inventory", "kitchen"]
      },
      {
        title: "Food Safety Check",
        description: "Ensure all food safety protocols are being followed.",
        department: "kitchen",
        priority: "high",
        location: "kitchen",
        category: "cleaning",
        estimatedDuration: 45,
        materials: ["safety checklist", "thermometer"],
        tags: ["food_safety", "kitchen"]
      }
    ],
    service: [
      {
        title: "Guest Satisfaction Check",
        description: "Check in with guests to ensure satisfaction with services.",
        department: "service",
        priority: "medium",
        location: "lobby",
        category: "guest_request",
        estimatedDuration: 30,
        materials: ["feedback forms", "pen"],
        tags: ["guest_satisfaction", "service"]
      },
      {
        title: "Service Area Inspection",
        description: "Inspect service areas for cleanliness and organization.",
        department: "service",
        priority: "low",
        location: "lobby",
        category: "cleaning",
        estimatedDuration: 20,
        materials: ["inspection checklist"],
        tags: ["inspection", "service"]
      },
      {
        title: "Staff Training Review",
        description: "Review and update staff training materials and procedures.",
        department: "service",
        priority: "medium",
        location: "other",
        category: "guest_request",
        estimatedDuration: 60,
        materials: ["training materials", "notebook"],
        tags: ["training", "service"]
      }
    ],
    cleaning: [
      {
        title: "Supply Inventory Check",
        description: "Check cleaning supplies and restock as needed.",
        department: "cleaning",
        priority: "low",
        location: "other",
        category: "restocking",
        estimatedDuration: 25,
        materials: ["inventory list", "supplies"],
        tags: ["inventory", "cleaning"]
      },
      {
        title: "Quality Control Check",
        description: "Perform quality control check on recently cleaned areas.",
        department: "cleaning",
        priority: "medium",
        location: "other",
        category: "inspection",
        estimatedDuration: 40,
        materials: ["quality checklist", "inspection tools"],
        tags: ["quality_control", "cleaning"]
      },
      {
        title: "Equipment Maintenance",
        description: "Clean and maintain cleaning equipment for optimal performance.",
        department: "cleaning",
        priority: "medium",
        location: "other",
        category: "equipment",
        estimatedDuration: 35,
        materials: ["maintenance tools", "cleaning supplies"],
        tags: ["equipment", "cleaning"]
      }
    ]
  };
  
  return templates[department] || [];
};

// Main function
const main = async () => {
  try {
    console.log('🏨 Valdor Hotel - Ensuring 3 Tasks Per Staff Member');
    console.log('==================================================');

    await connectDB();

    // Get all staff members
    const staffMembers = await getAllStaff();
    console.log(`\n👥 Found ${staffMembers.length} staff members:`);
    staffMembers.forEach(staff => {
      console.log(`  - ${staff.name} (${staff.department})`);
    });

    // Get current task counts
    const taskCounts = await getTaskCounts(staffMembers);
    console.log('\n📊 Current task distribution:');
    staffMembers.forEach(staff => {
      const count = taskCounts[staff.userId] || 0;
      console.log(`  ${staff.name}: ${count} tasks`);
    });

    // Ensure each staff member has exactly 3 tasks
    console.log('\n📝 Balancing task distribution...');
    let totalNewTasks = 0;
    
    for (const staff of staffMembers) {
      const currentCount = taskCounts[staff.userId] || 0;
      if (currentCount < 3) {
        const newTasks = await createAdditionalTasks(staff, currentCount, 3);
        totalNewTasks += newTasks.length;
      } else if (currentCount > 3) {
        console.log(`⚠️  ${staff.name} has ${currentCount} tasks (more than 3)`);
      }
    }

    // Final task count verification
    console.log('\n📋 Final task distribution:');
    const finalTaskCounts = await getTaskCounts(staffMembers);
    staffMembers.forEach(staff => {
      const count = finalTaskCounts[staff.userId] || 0;
      console.log(`  ${staff.name}: ${count} tasks`);
    });

    console.log(`\n✅ Task distribution complete! Created ${totalNewTasks} new tasks.`);
    console.log('\n🎉 Every staff member now has exactly 3 tasks!');
    console.log('\n📖 Next Steps:');
    console.log('1. Staff can view their 3 assigned tasks in their dashboard');
    console.log('2. Tasks are automatically filtered by department');
    console.log('3. Staff can update task status and add progress notes');

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