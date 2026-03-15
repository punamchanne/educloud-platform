import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }], // For MCQ
  correctAnswer: { type: String }, // Or index for MCQ
  type: { type: String, enum: ['mcq', 'short', 'essay'], default: 'mcq' },
  marks: { type: Number, default: 1 }
});

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true }, // Subject/Topic of the exam
  scheduledDate: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  totalQuestions: { type: Number, default: 0 }, // Total number of questions
  timeLimit: { type: Number }, // Time limit in minutes (can be different from duration)
  questions: [questionSchema], // AI-generated
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Students
  invigilator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Staff/Admin
  results: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number },
    submittedAt: { type: Date }
  }],
  status: { type: String, enum: ['scheduled', 'live', 'ongoing', 'completed'], default: 'ongoing' },
  proctoringEnabled: { type: Boolean, default: false }, // For AI proctoring
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Method to calculate average score
examSchema.methods.getAverageScore = function() {
  if (this.results.length === 0) return 0;
  const total = this.results.reduce((sum, res) => sum + res.score, 0);
  return total / this.results.length;
};

export default mongoose.model('Exam', examSchema);
