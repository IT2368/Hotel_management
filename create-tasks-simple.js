// Simple script to create tasks for staff members
// This script will create tasks and assign them to the appropriate staff

const tasks = [
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

// Function to create a task
async function createTask(taskData) {
  try {
    const response = await fetch('http://localhost:5000/api/staff/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // You'll need to get this from admin login
      },
      body: JSON.stringify(taskData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created task: ${taskData.title}`);
      return result;
    } else {
      console.error(`❌ Failed to create task: ${taskData.title}`);
      const error = await response.json();
      console.error('Error details:', error);
    }
  } catch (error) {
    console.error(`❌ Error creating task ${taskData.title}:`, error);
  }
}

// Function to get staff members by department
async function getStaffByDepartment(department) {
  try {
    const response = await fetch(`http://localhost:5000/api/admin/users?role=staff&department=${department}`, {
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // You'll need to get this from admin login
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data?.users || [];
    } else {
      console.error(`❌ Failed to get staff for department: ${department}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error getting staff for department ${department}:`, error);
    return [];
  }
}

// Main function to create all tasks
async function createAllTasks() {
  console.log('🏨 Valdor Hotel - Creating Tasks for Staff Members');
  console.log('==================================================');
  
  for (const task of tasks) {
    console.log(`\n📝 Creating task: ${task.title}`);
    console.log(`   Department: ${task.department}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Category: ${task.category}`);
    
    // For now, we'll create tasks without assignedTo (they'll be assigned by admin later)
    const taskToCreate = {
      ...task,
      status: "pending"
    };
    
    await createTask(taskToCreate);
  }
  
  console.log('\n✅ Task creation process completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Login as admin to assign tasks to specific staff members');
  console.log('2. Or use the admin dashboard to manage task assignments');
  console.log('3. Staff members will then see their assigned tasks');
}

// Instructions for manual task creation
console.log('🚀 Manual Task Creation Instructions:');
console.log('====================================');
console.log('');
console.log('Since the automated script has issues, here are the manual steps:');
console.log('');
console.log('1. Login to your admin account');
console.log('2. Go to the admin dashboard');
console.log('3. Navigate to Task Management');
console.log('4. Create each task manually with the following details:');
console.log('');

tasks.forEach((task, index) => {
  console.log(`${index + 1}. ${task.title}`);
  console.log(`   Department: ${task.department}`);
  console.log(`   Priority: ${task.priority}`);
  console.log(`   Category: ${task.category}`);
  console.log(`   Location: ${task.location}`);
  if (task.roomNumber) console.log(`   Room: ${task.roomNumber}`);
  console.log(`   Duration: ${task.estimatedDuration} minutes`);
  console.log('');
});

console.log('📱 Alternative: Use the frontend to create tasks');
console.log('1. Login as admin in the frontend');
console.log('2. Go to Staff Management > Tasks');
console.log('3. Click "Create New Task"');
console.log('4. Fill in the details for each task above');
console.log('');
console.log('🎯 Each staff member will then see tasks for their department!'); 