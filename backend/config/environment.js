// Placeholder for backend/config/environment.jsimport dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};

// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default config;