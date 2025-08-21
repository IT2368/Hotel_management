// Script to create an admin user for Valdor Hotel
// Run this script to create an admin account that can manage tasks

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './backend/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@valdorhotel.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists, skipping...');
      return existingAdmin;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = new User({
      name: 'Hotel Administrator',
      email: 'admin@valdorhotel.com',
      password: hashedPassword,
      role: 'admin',
      emailVerified: true,
      isActive: true,
      isApproved: true
    });

    await adminUser.save();
    console.log('✅ Created admin user: admin@valdorhotel.com');
    console.log('   Password: admin123');
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('🏨 Valdor Hotel - Creating Admin User');
    console.log('=====================================');

    await connectDB();

    console.log('\n📝 Creating admin user...\n');

    const admin = await createAdminUser();

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('============================');
    console.log('Email: admin@valdorhotel.com');
    console.log('Password: admin123');
    console.log('Role: Admin');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Login as admin in the frontend');
    console.log('2. Go to admin dashboard');
    console.log('3. Create tasks for each department');
    console.log('4. Assign tasks to staff members');

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