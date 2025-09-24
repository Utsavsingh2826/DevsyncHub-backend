import mongoose from "mongoose";

function connect() {
    // Use environment variable or fallback to local MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsync';
    
    if (!process.env.MONGODB_URI) {
        console.warn('MONGODB_URI not found in environment variables, using default: mongodb://localhost:27017/devsync');
        console.warn('Please create a .env file with your MongoDB connection string');
    }
    
    mongoose.connect(mongoUri)
        .then(() => {
            console.log("Connected to MongoDB successfully");
        })
        .catch(err => {
            console.error("MongoDB connection error:", err.message);
            console.error("Please ensure MongoDB is running and the connection string is correct");
            process.exit(1);
        })
}

export default connect;