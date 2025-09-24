import fs from 'fs';
import path from 'path';

const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/devsync

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}

# Server Configuration
PORT=3000

# Redis Configuration (optional - comment out if not using Redis)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# AI Configuration (if using Google Generative AI)
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
`;

const envPath = path.join(process.cwd(), '.env');

try {
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created successfully!');
        console.log('📝 Please update the values in .env file as needed:');
        console.log('   - MONGODB_URI: Your MongoDB connection string');
        console.log('   - JWT_SECRET: A secure secret key for JWT tokens');
        console.log('   - GOOGLE_AI_API_KEY: Your Google AI API key (if using AI features)');
    } else {
        console.log('⚠️  .env file already exists. Skipping creation.');
    }
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
}
