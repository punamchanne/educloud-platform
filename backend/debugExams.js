import mongoose from 'mongoose';
import User from './models/User.js';
import Exam from './models/Exam.js';
import './config/db.js';

async function debugExamData() {
  try {
    console.log('🔍 Debugging Exam Data...\n');

    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`👥 Total Users: ${totalUsers}`);

    // Check total exams
    const totalExams = await Exam.countDocuments();
    console.log(`📝 Total Exams: ${totalExams}`);

    // Find users with exam history
    const usersWithExams = await User.find({ 'examHistory.0': { $exists: true } });
    console.log(`🎓 Users with Exam History: ${usersWithExams.length}`);

    // Show detailed user exam data
    for (const user of usersWithExams) {
      console.log(`\n📊 User: ${user.username} (${user.email})`);
      console.log(`   Exams Taken: ${user.examHistory.length}`);
      console.log(`   Average Score: ${user.averageScore}`);
      console.log(`   Exam Count: ${user.examCount}`);
      
      user.examHistory.forEach((exam, index) => {
        console.log(`   📋 Exam ${index + 1}: Score ${exam.score}/${exam.totalQuestions} (${exam.status})`);
      });
    }

    // Show all exams with their results
    const exams = await Exam.find({}).populate('invigilator', 'username');
    console.log(`\n📚 All Exams:`);
    exams.forEach((exam, index) => {
      console.log(`\n📋 Exam ${index + 1}: ${exam.title}`);
      console.log(`   Subject: ${exam.subject}`);
      console.log(`   Status: ${exam.status}`);
      console.log(`   Results: ${exam.results.length} submissions`);
      
      exam.results.forEach((result, i) => {
        console.log(`   📊 Submission ${i + 1}: Score ${result.score}, User ID: ${result.userId}`);
      });
    });

    // Check if there are any users at all
    const sampleUsers = await User.find({}).limit(3);
    console.log(`\n👤 Sample Users:`);
    sampleUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - Exams: ${user.examHistory.length}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugExamData();