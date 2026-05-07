import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const examAttemptSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  attemptDate: { type: Date, default: Date.now },
  duration: { type: Number }, // in minutes
  status: { type: String, enum: ['passed', 'failed', 'incomplete', 'timed-out'], default: 'incomplete' }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'parent', 'student', 'staff'], required: true },
  profile: {
    fullName: { type: String },
    profilePic: { type: String }, // Cloudinary URL
    phone: { type: String },
    address: { type: String }
  },
  examHistory: [examAttemptSchema], // Array for exam history
  examCount: { type: Number, default: 0 }, // Total exams attempted (derived or incremented)
  averageScore: { type: Number, default: 0 }, // Calculated average for profile
  totalNotifications: { type: Number, default: 0 }, // Count for unread notifications
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update exam counts and average after attempt
userSchema.methods.updateExamStats = function() {
  this.examCount = this.examHistory.length;
  if (this.examCount > 0) {
    const totalScores = this.examHistory.reduce((sum, attempt) => sum + attempt.score, 0);
    this.averageScore = totalScores / this.examCount;
  } else {
    this.averageScore = 0;
  }
};

export default mongoose.model('User', userSchema);
