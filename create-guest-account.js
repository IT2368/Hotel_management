// Script to create a guest account for Valdor Hotel
// Run this script to create a test guest account

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './backend/models/User.js';
import GuestProfile from './backend/models/profiles/GuestProfile.js';
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

// Create guest account
const createGuestAccount = async () => {
  try {
    const guestData = {
      name: "John Smith",
      email: "guestanoji@gmail.com",
      password: "guest123",
      phone: "+1-555-0200",
      address: {
        country: "USA",
        city: "New York",
        street: "123 Main Street",
        postalCode: "10001"
      }
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: guestData.email });
    if (existingUser) {
      console.log(`⚠️  Guest ${guestData.email} already exists, skipping...`);
      return existingUser;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(guestData.password, saltRounds);

    // Create user
    const user = new User({
      name: guestData.name,
      email: guestData.email,
      password: hashedPassword,
      phone: guestData.phone,
      address: guestData.address,
      role: 'guest',
      emailVerified: true,
      isActive: true,
      isApproved: true
    });

    await user.save();
    console.log(`✅ Created guest user: ${guestData.email}`);

    // Create guest profile
    const guestProfile = new GuestProfile({
      userId: user._id,
      preferences: {
        roomType: "standard",
        floor: "any",
        specialRequests: "None"
      },
      loyaltyPoints: 1250,
      totalStays: 5,
      averageRating: 4.5
    });

    await guestProfile.save();
    console.log(`✅ Created guest profile for: ${guestData.name}`);

    // Update user with guest profile reference
    user.guestProfile = guestProfile._id;
    await user.save();

    return user;
  } catch (error) {
    console.error(`❌ Error creating guest account:`, error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('🏨 Valdor Hotel - Creating Guest Account');
    console.log('========================================');

    await connectDB();

    console.log('\n📝 Creating guest account...\n');

    await createGuestAccount();

    console.log('✅ Guest account created successfully!');
    console.log('\n📋 Guest Login Credentials:');
    console.log('===========================');
    console.log('Email: guest.john@valdor.com');
    console.log('Password: guest123');
    console.log('');
    console.log('🎉 You can now test the guest dashboard!');
    console.log('\n📖 Test Instructions:');
    console.log('1. Login as guest → go to /guest/dashboard');
    console.log('2. Check "Staff Updates" tab to see handoff workflow');
    console.log('3. Filter by department and status');

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