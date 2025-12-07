const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.log('MONGODB_URI not found, using in-memory storage');
      return null;
    }
    
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(uri);
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    
    return mongoose.connection;
    
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Using in-memory storage for development');
      return null;
    }
    
    throw error;
  }
};

module.exports = connectDB();