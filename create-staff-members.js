// Script to create 4 staff members for Valdor Hotel
// Run this script to create test staff accounts

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './backend/models/User.js';
import StaffProfile from './backend/models/profiles/StaffProfile.js';
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

// Create staff member
const createStaffMember = async (staffData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: staffData.email });
    if (existingUser) {
      console.log(`⚠️  User ${staffData.email} already exists, skipping...`);
      return existingUser;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(staffData.password, saltRounds);

    // Create user
    const user = new User({
      name: staffData.name,
      email: staffData.email,
      password: hashedPassword,
      role: 'staff',
      emailVerified: true,
      isActive: true,
      isApproved: true
    });

    await user.save();
    console.log(`✅ Created user: ${staffData.email}`);

    // Create staff profile
    const staffProfile = new StaffProfile({
      userId: user._id,
      department: staffData.department,
      position: staffData.position,
      shift: staffData.shift,
      skills: staffData.skills,
      emergencyContact: staffData.emergencyContact
    });

    await staffProfile.save();
    console.log(`✅ Created staff profile for: ${staffData.name}`);

    // Update user with staff profile reference
    user.staffProfile = staffProfile._id;
    await user.save();

    return user;
  } catch (error) {
    console.error(`❌ Error creating staff member ${staffData.email}:`, error);
    throw error;
  }
};

// Staff data
const staffMembers = [
  {
    name: "Chef Maria Rodriguez",
    email: "chefanoji@gmail.com",
    password: "kitchen123",
    department: "kitchen",
    position: "Head Chef",
    shift: "morning",
    skills: ["cooking", "food_preparation", "inventory_management"],
    emergencyContact: {
      name: "Carlos Rodriguez",
      relationship: "Spouse",
      phone: "+1-555-0101",
      email: "carlos.rodriguez@email.com"
    }
  },
  {
    name: "Mike Johnson",
    email: "maintenanceanoji@gmail.com", 
    password: "maintenance123",
    department: "maintenance",
    position: "Senior Maintenance Technician",
    shift: "flexible",
    skills: ["electrical", "plumbing", "hvac", "general_repair"],
    emergencyContact: {
      name: "Sarah Johnson",
      relationship: "Spouse",
      phone: "+1-555-0102",
      email: "sarah.johnson@email.com"
    }
  },
  {
    name: "Lisa Brown",
    email: "cleaninganoji@gmail.com",
    password: "cleaning123",
    department: "cleaning",
    position: "Housekeeping Supervisor",
    shift: "morning",
    skills: ["deep_cleaning", "laundry", "inspection", "restocking"],
    emergencyContact: {
      name: "Robert Brown",
      relationship: "Spouse",
      phone: "+1-555-0103",
      email: "robert.brown@email.com"
    }
  },
  {
    name: "Sarah Wilson",
    email: "serviceanoji@gmail.com",
    password: "service123",
    department: "service",
    position: "Guest Services Manager",
    shift: "flexible",
    skills: ["guest_relations", "concierge", "room_service", "transportation"],
    emergencyContact: {
      name: "David Wilson",
      relationship: "Spouse",
      phone: "+1-555-0104",
      email: "david.wilson@email.com"
    }
  }
];

// Main function
const main = async () => {
  try {
    console.log('🏨 Valdor Hotel - Creating Staff Members');
    console.log('==========================================');

    await connectDB();

    console.log('\n📝 Creating staff members...\n');

    for (const staffData of staffMembers) {
      await createStaffMember(staffData);
      console.log(`   Department: ${staffData.department.toUpperCase()}`);
      console.log(`   Email: ${staffData.email}`);
      console.log(`   Password: ${staffData.password}\n`);
    }

    console.log('✅ All staff members created successfully!');
    console.log('\n📋 Login Credentials Summary:');
    console.log('=============================');
    
    staffMembers.forEach(staff => {
      console.log(`${staff.department.toUpperCase()}:`);
      console.log(`  Email: ${staff.email}`);
      console.log(`  Password: ${staff.password}`);
      console.log('');
    });

    console.log('🎉 You can now test the handoff workflow!');
    console.log('\n📖 Test Instructions:');
    console.log('1. Login as kitchen staff → create task → handoff to service');
    console.log('2. Login as maintenance staff → create task → handoff to cleaning');
    console.log('3. Login as guest → view staff updates');

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