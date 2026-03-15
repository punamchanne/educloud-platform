import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Timetable from './models/Timetable.js';
import User from './models/User.js';

dotenv.config();

const addSampleTimetable = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/educloud';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing timetables
    await Timetable.deleteMany({});
    console.log('Cleared existing timetables');

    const sampleSlots = [
      { day: 'Monday', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', location: 'Room 101' },
      { day: 'Monday', startTime: '10:00', endTime: '10:45', subject: 'Science', location: 'Lab A' },
      { day: 'Monday', startTime: '11:00', endTime: '11:45', subject: 'English', location: 'Room 202' },
      { day: 'Tuesday', startTime: '09:00', endTime: '09:45', subject: 'History', location: 'Room 303' },
      { day: 'Tuesday', startTime: '10:00', endTime: '10:45', subject: 'Mathematics', location: 'Room 101' },
      { day: 'Wednesday', startTime: '09:00', endTime: '09:45', subject: 'Science', location: 'Lab A' },
      { day: 'Wednesday', startTime: '10:00', endTime: '10:45', subject: 'Art', location: 'Studio' },
      { day: 'Thursday', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', location: 'Room 101' },
      { day: 'Friday', startTime: '09:00', endTime: '09:45', subject: 'English', location: 'Room 202' },
      { day: 'Friday', startTime: '10:00', endTime: '10:45', subject: 'Physical Education', location: 'Gym' },
    ];

    const timetable = new Timetable({
      class: '10th Grade',
      section: 'A',
      slots: sampleSlots,
      schoolHours: {
        startTime: '08:00',
        endTime: '15:00',
        slotDuration: 45
      }
    });

    await timetable.save();
    console.log('Sample timetable added successfully!');

  } catch (error) {
    console.error('Error adding sample timetable:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

addSampleTimetable();
