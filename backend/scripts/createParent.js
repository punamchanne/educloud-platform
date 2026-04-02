import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Parent from '../models/Parent.js';
import mongoose from 'mongoose';

dotenv.config();

const run = async () => {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node scripts/createParent.js <userId>');
    process.exit(1);
  }

  try {
    await connectDB();

    // Ensure userId is ObjectId
    const parentExists = await Parent.findOne({ user: mongoose.Types.ObjectId(userId) });
    if (parentExists) {
      console.log('Parent profile already exists for user:', userId);
      process.exit(0);
    }

    const parent = new Parent({
      user: mongoose.Types.ObjectId(userId),
      children: [],
      occupation: '',
      workplace: '',
      annualIncome: 'prefer_not_to_say',
      contactPreferences: {},
    });

    await parent.save();
    console.log('Parent profile created with id:', parent._id.toString());
    process.exit(0);
  } catch (error) {
    console.error('Error creating parent profile:', error);
    process.exit(1);
  }
};

run();
