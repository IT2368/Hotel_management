// 📁 test-staff-system.js
// Simple test script to verify the staff management system

console.log('🧪 Testing Staff Management System...\n');

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'backend/models/StaffTask.js',
  'backend/models/StaffNotification.js',
  'backend/models/profiles/StaffProfile.js',
  'backend/controllers/staff/taskController.js',
  'backend/controllers/staff/notificationController.js',
  'backend/controllers/staff/staffController.js',
  'backend/controllers/staff/scheduleController.js',
  'backend/routes/staff.js',
  'backend/utils/responseFormatter.js',
  'backend/utils/logger.js',
  'frontend/src/pages/staff/StaffDashboardPage.jsx',
  'frontend/src/components/staff/TaskManager.jsx',
  'frontend/src/components/staff/NotificationCenter.jsx',
  'frontend/src/services/staffService.js',
  'STAFF_MANAGEMENT_README.md'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n' + (allFilesExist ? '✅ All files exist!' : '❌ Some files are missing!'));

// Test 2: Check server.js integration
console.log('\n🔧 Checking server integration...');
const serverContent = fs.readFileSync('backend/server.js', 'utf8');

if (serverContent.includes('import staffRoutes from "./routes/staff.js"')) {
  console.log('✅ Staff routes imported in server.js');
} else {
  console.log('❌ Staff routes not imported in server.js');
}

if (serverContent.includes('app.use("/api/staff", staffRoutes)')) {
  console.log('✅ Staff routes mounted in server.js');
} else {
  console.log('❌ Staff routes not mounted in server.js');
}

// Test 3: Check App.jsx integration
console.log('\n🎨 Checking frontend integration...');
const appContent = fs.readFileSync('frontend/src/App.jsx', 'utf8');

if (appContent.includes('StaffDashboardPage')) {
  console.log('✅ StaffDashboardPage imported in App.jsx');
} else {
  console.log('❌ StaffDashboardPage not imported in App.jsx');
}

if (appContent.includes('/staff/dashboard')) {
  console.log('✅ Staff dashboard route configured in App.jsx');
} else {
  console.log('❌ Staff dashboard route not configured in App.jsx');
}

// Test 4: Check package.json for required dependencies
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['express', 'mongoose', 'cors', 'helmet'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} dependency found`);
    } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep} dev dependency found`);
    } else {
      console.log(`❌ ${dep} dependency missing`);
    }
  });
} catch (error) {
  console.log('❌ Could not read package.json');
}

// Test 5: Check environment variables
console.log('\n🔐 Checking environment setup...');
const envFile = '.env';
if (fs.existsSync(envFile)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  if (envContent.includes('MONGODB_URI')) {
    console.log('✅ MONGODB_URI configured');
  } else {
    console.log('❌ MONGODB_URI not configured');
  }
  
  if (envContent.includes('JWT_SECRET')) {
    console.log('✅ JWT_SECRET configured');
  } else {
    console.log('❌ JWT_SECRET not configured');
  }
} else {
  console.log('❌ .env file not found');
}

console.log('\n🎉 Staff Management System Test Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Start the backend server: npm run dev:backend');
console.log('2. Start the frontend: npm run dev:frontend');
console.log('3. Navigate to /staff/dashboard to test the system');
console.log('4. Check the API endpoints at /api/staff/*');
console.log('\n📚 For detailed documentation, see STAFF_MANAGEMENT_README.md'); 