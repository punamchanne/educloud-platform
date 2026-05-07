import mongoose from 'mongoose';
import User from './models/User.js';
import Student from './models/Student.js';
import Parent from './models/Parent.js';
import dotenv from 'dotenv';
dotenv.config();

const fixParentProfile = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/educloud');
    console.log('Connected to MongoDB');

    // Find a student
    const student = await Student.findOne().populate('user');
    if (!student) {
      console.log('No students found. Please register a student first.');
      process.exit(0);
    }
    console.log(`Found student: ${student.user.profile.fullName} (${student.user.email})`);

    // Find the logged in parent (replace with your email or just pick the first parent)
    const parentUser = await User.findOne({ role: 'parent' });
    if (!parentUser) {
      console.log('No parent users found. Please register as a parent first.');
      process.exit(0);
    }
    console.log(`Found parent user: ${parentUser.email}`);

    // Create or update parent profile
    let parentProfile = await Parent.findOne({ user: parentUser._id });
    if (!parentProfile) {
      parentProfile = new Parent({
        user: parentUser._id,
        children: [{
          studentId: student._id,
          relationship: 'father'
        }],
        status: 'active'
      });
      await parentProfile.save();
      console.log('Created parent profile and linked to student.');
    } else {
      console.log('Parent profile already exists.');
      if (parentProfile.children.length === 0) {
        parentProfile.children.push({
          studentId: student._id,
          relationship: 'father'
        });
        await parentProfile.save();
        console.log('Linked student to existing parent profile.');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error fixing parent profile:', error);
    process.exit(1);
  }
};

fixParentProfile();
