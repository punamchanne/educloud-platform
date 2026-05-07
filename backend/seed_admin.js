import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Remove existing test admin if any
    await User.deleteOne({ email: 'admin@test.com' });

    const admin = new User({
      username: 'admin_test',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        fullName: 'System Administrator',
        phone: '1234567890',
        address: 'Main Office, EduCloud'
      }
    });

    await admin.save();
    console.log('✅ Admin account created: admin@test.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
