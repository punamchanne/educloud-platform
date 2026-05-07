import mongoose from 'mongoose';
import User from './models/User.js';
import Student from './models/Student.js';
import Parent from './models/Parent.js';
import dotenv from 'dotenv';
dotenv.config();

const seedParentData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/educloud');
    console.log('Connected to MongoDB');

    // 1. Create a Student User
    let studentUser = await User.findOne({ email: 'student@example.com' });
    if (!studentUser) {
      studentUser = new User({
        username: 'student_test',
        email: 'student@example.com',
        password: 'password123',
        role: 'student',
        profile: {
          fullName: 'John Doe Student',
          phone: '1122334455',
          address: 'Student Hostel'
        }
      });
      await studentUser.save();
      console.log('Student user created');
    }

    // 2. Create Student Profile
    let studentProfile = await Student.findOne({ user: studentUser._id });
    if (!studentProfile) {
      studentProfile = new Student({
        user: studentUser._id,
        studentId: 'STU001',
        academicInfo: {
          rollNumber: '101',
          admissionDate: new Date()
        },
        status: 'active',
        performance: {
            overallGPA: 3.8
        }
      });
      await studentProfile.save();
      console.log('Student profile created');
    }

    // 3. Create/Find Parent User
    // We look for any parent if one already exists
    let parentUser = await User.findOne({ email: 'parent@example.com' });
    if (!parentUser) {
      parentUser = new User({
        username: 'parent_test',
        email: 'parent@example.com',
        password: 'password123',
        role: 'parent',
        profile: {
          fullName: 'Robert Doe Parent',
          phone: '9988776655',
          address: 'Parent Residence'
        }
      });
      await parentUser.save();
      console.log('Parent user created (parent@example.com / password123)');
    }

    // 4. Create Parent Profile and link to Student
    let parentProfile = await Parent.findOne({ user: parentUser._id });
    if (!parentProfile) {
      parentProfile = new Parent({
        user: parentUser._id,
        children: [{
          studentId: studentProfile._id,
          relationship: 'father'
        }],
        status: 'active'
      });
      await parentProfile.save();
      console.log('Parent profile created and linked to student.');
    } else {
      console.log('Parent profile already exists.');
      // Ensure the student is linked
      const alreadyLinked = parentProfile.children.some(c => c.studentId.toString() === studentProfile._id.toString());
      if (!alreadyLinked) {
        parentProfile.children.push({
          studentId: studentProfile._id,
          relationship: 'father'
        });
        await parentProfile.save();
        console.log('Linked student to existing parent profile.');
      }
    }

    console.log('\n--- SEEDING COMPLETE ---');
    console.log('Parent Login: parent@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding parent data:', error);
    process.exit(1);
  }
};

seedParentData();
