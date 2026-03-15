import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Exam from './models/Exam.js';
import './config/db.js';

dotenv.config();

const addExamHistory = async () => {
  try {
    console.log('🔄 Adding exam history to users...\n');

    // Find all users with role student
    const students = await User.find({ role: 'student' });
    console.log(`📚 Found ${students.length} students`);

    // Find all exams
    const exams = await Exam.find({});
    console.log(`📝 Found ${exams.length} exams`);

    if (exams.length === 0) {
      console.log('❌ No exams found. Creating sample exams first...');
      
      // Create sample exams
      const sampleExams = [
        {
          title: 'Mathematics Final Exam - Calculus',
          description: 'Comprehensive exam covering limits, derivatives, and integration',
          subject: 'Mathematics',
          scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          duration: 120,
          status: 'completed',
          questions: [
            {
              question: 'What is the derivative of x²?',
              options: ['2x', 'x', '2', 'x²'],
              correctAnswer: '2x',
              marks: 5
            },
            {
              question: 'What is the limit of (x²-1)/(x-1) as x approaches 1?',
              options: ['0', '1', '2', 'undefined'],
              correctAnswer: '2',
              marks: 5
            },
            {
              question: 'What is the integral of 2x?',
              options: ['x²', 'x² + C', '2', '2x + C'],
              correctAnswer: 'x² + C',
              marks: 5
            },
            {
              question: 'What is the slope of the tangent line to y = x³ at x = 2?',
              options: ['6', '8', '12', '24'],
              correctAnswer: '12',
              marks: 5
            }
          ],
          totalMarks: 20,
          results: []
        },
        {
          title: 'Biology Test - Cell Division',
          description: 'Test on mitosis and meiosis processes',
          subject: 'Biology',
          scheduledDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          duration: 90,
          status: 'completed',
          questions: [
            {
              question: 'How many daughter cells are produced in mitosis?',
              options: ['2', '4', '6', '8'],
              correctAnswer: '2',
              marks: 5
            },
            {
              question: 'In which phase do chromosomes align at the cell equator?',
              options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
              correctAnswer: 'Metaphase',
              marks: 5
            },
            {
              question: 'What is the purpose of meiosis?',
              options: ['Growth', 'Repair', 'Sexual reproduction', 'Asexual reproduction'],
              correctAnswer: 'Sexual reproduction',
              marks: 5
            }
          ],
          totalMarks: 15,
          results: []
        },
        {
          title: 'English Literature Quiz - Shakespeare',
          description: 'Quiz on Hamlet character analysis and themes',
          subject: 'English',
          scheduledDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
          duration: 60,
          status: 'completed',
          questions: [
            {
              question: 'Who is the protagonist of Hamlet?',
              options: ['Claudius', 'Hamlet', 'Laertes', 'Horatio'],
              correctAnswer: 'Hamlet',
              marks: 3
            },
            {
              question: 'What is the main theme of Hamlet?',
              options: ['Love', 'Revenge', 'Adventure', 'Comedy'],
              correctAnswer: 'Revenge',
              marks: 3
            }
          ],
          totalMarks: 6,
          results: []
        },
        {
          title: 'Physics Mid-term - Mechanics',
          description: 'Mid-term examination on Newton\'s laws and mechanics',
          subject: 'Physics',
          scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          duration: 100,
          status: 'completed',
          questions: [
            {
              question: 'What is Newton\'s first law?',
              options: ['F=ma', 'Inertia', 'Action-reaction', 'Gravity'],
              correctAnswer: 'Inertia',
              marks: 4
            },
            {
              question: 'What is the SI unit of force?',
              options: ['Joule', 'Newton', 'Watt', 'Pascal'],
              correctAnswer: 'Newton',
              marks: 4
            }
          ],
          totalMarks: 8,
          results: []
        }
      ];

      const createdExams = await Exam.insertMany(sampleExams);
      console.log(`✅ Created ${createdExams.length} sample exams`);
      
      // Update the exams array with newly created exams
      const allExams = await Exam.find({});
      
      // Now add exam history to students
      for (const student of students) {
        console.log(`\n👤 Processing student: ${student.username}`);
        
        // Clear existing exam history
        student.examHistory = [];
        
        // Add exam attempts for each exam
        for (let i = 0; i < allExams.length; i++) {
          const exam = allExams[i];
          
          // Generate realistic scores (70-95%)
          const totalQuestions = exam.questions.length;
          const correctAnswers = Math.floor(totalQuestions * (0.7 + Math.random() * 0.25));
          const score = correctAnswers * (exam.totalMarks / totalQuestions);
          const status = score >= (exam.totalMarks * 0.6) ? 'passed' : 'failed';
          
          // Add to student's exam history
          student.examHistory.push({
            examId: exam._id,
            score: Math.round(score),
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            attemptDate: new Date(exam.scheduledDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            duration: exam.duration,
            status: status
          });
          
          // Add to exam results
          exam.results.push({
            userId: student._id,
            score: Math.round(score),
            submittedAt: new Date(exam.scheduledDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            answers: exam.questions.map(() => exam.questions[Math.floor(Math.random() * exam.questions.length)].correctAnswer)
          });
          
          await exam.save();
          
          console.log(`   📊 Added exam: ${exam.title} - Score: ${Math.round(score)}/${exam.totalMarks} (${status})`);
        }
        
        // Update exam statistics
        student.updateExamStats();
        await student.save();
        
        console.log(`   ✅ Updated ${student.username}: ${student.examHistory.length} exams, avg score: ${student.averageScore?.toFixed(1)}`);
      }
    } else {
      // If exams exist, just add history to students
      for (const student of students) {
        if (student.examHistory.length === 0) {
          console.log(`\n👤 Adding exam history to: ${student.username}`);
          
          // Add exam attempts for existing exams
          for (const exam of exams) {
            const totalQuestions = exam.questions.length;
            const correctAnswers = Math.floor(totalQuestions * (0.7 + Math.random() * 0.25));
            const totalMarks = exam.totalMarks || totalQuestions * 5;
            const score = correctAnswers * (totalMarks / totalQuestions);
            const status = score >= (totalMarks * 0.6) ? 'passed' : 'failed';
            
            student.examHistory.push({
              examId: exam._id,
              score: Math.round(score),
              totalQuestions: totalQuestions,
              correctAnswers: correctAnswers,
              attemptDate: new Date(exam.scheduledDate || Date.now()),
              duration: exam.duration || 60,
              status: status
            });
            
            console.log(`   📊 Added exam: ${exam.title} - Score: ${Math.round(score)}/${totalMarks} (${status})`);
          }
          
          student.updateExamStats();
          await student.save();
          
          console.log(`   ✅ Updated ${student.username}: ${student.examHistory.length} exams, avg score: ${student.averageScore?.toFixed(1)}`);
        } else {
          console.log(`   ⏭️  ${student.username} already has ${student.examHistory.length} exam(s)`);
        }
      }
    }

    console.log('\n🎉 Exam history setup completed!');
    console.log('\nSummary:');
    
    const updatedStudents = await User.find({ role: 'student' });
    for (const student of updatedStudents) {
      console.log(`   👤 ${student.username}: ${student.examHistory.length} exams, avg: ${student.averageScore?.toFixed(1) || 0}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

addExamHistory();