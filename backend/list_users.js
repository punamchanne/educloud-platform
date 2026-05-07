import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const listUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/educloud');
    console.log('Connected to MongoDB');

    const users = await User.find({}, 'username email role');
    console.log('--- List of Users ---');
    users.forEach(u => console.log(`[${u.role}] ${u.username} - ${u.email}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
};

listUsers();
