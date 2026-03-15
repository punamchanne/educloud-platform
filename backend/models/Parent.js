import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Children Information
  children: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    relationship: {
      type: String,
      enum: ['father', 'mother', 'guardian', 'other'],
      required: true
    },
    isPrimaryContact: { type: Boolean, default: false },
    emergencyContact: { type: Boolean, default: false }
  }],

  // Personal Information
  occupation: String,
  workplace: String,
  annualIncome: {
    type: String,
    enum: ['below_2L', '2L_5L', '5L_10L', 'above_10L', 'prefer_not_to_say']
  },

  // Communication Preferences
  contactPreferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    examResults: { type: Boolean, default: true },
    attendanceAlerts: { type: Boolean, default: true },
    feeReminders: { type: Boolean, default: true },
    teacherMessages: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false }
  },

  // Emergency Contact Information
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    alternatePhone: String
  },

  // Financial Information (for fee management)
  paymentMethods: [{
    type: {
      type: String,
      enum: ['bank_transfer', 'credit_card', 'debit_card', 'upi', 'cash']
    },
    details: String, // Masked or reference
    isDefault: { type: Boolean, default: false }
  }],

  // Communication History
  communicationLog: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'meeting']
    },
    subject: String,
    message: String,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    sentAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'responded'],
      default: 'sent'
    }
  }],

  // Portal Access and Preferences
  portalAccess: {
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    preferredLanguage: { type: String, default: 'en' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },

  // Audit fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
// Note: user field already has unique index from schema definition
parentSchema.index({ 'children.studentId': 1 });
parentSchema.index({ status: 1 });

// Pre-save middleware to update timestamps
parentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full name from User model
parentSchema.virtual('fullName').get(async function() {
  const user = await mongoose.model('User').findById(this.user);
  return user ? user.profile.fullName : '';
});

// Method to get all children details
parentSchema.methods.getChildrenDetails = async function() {
  const Student = mongoose.model('Student');
  const childrenIds = this.children.map(c => c.studentId);

  return await Student.find({
    _id: { $in: childrenIds }
  }).populate('user');
};

// Method to get children's academic performance
parentSchema.methods.getChildrenPerformance = async function() {
  const Student = mongoose.model('Student');
  const childrenIds = this.children.map(c => c.studentId);

  const children = await Student.find({
    _id: { $in: childrenIds }
  }).populate('user');

  const performance = [];

  for (const child of children) {
    const exams = await mongoose.model('Exam').find({
      'participants.studentId': child._id
    });

    const examResults = [];
    for (const exam of exams) {
      const participant = exam.participants.find(p => p.studentId.toString() === child._id.toString());
      if (participant && participant.score !== undefined) {
        examResults.push({
          examTitle: exam.title,
          score: participant.score,
          totalQuestions: exam.questions.length,
          date: participant.completedAt
        });
      }
    }

    performance.push({
      studentId: child._id,
      studentName: child.user.profile.fullName,
      class: child.academicInfo.class,
      exams: examResults,
      averageScore: examResults.length > 0
        ? examResults.reduce((sum, exam) => sum + exam.score, 0) / examResults.length
        : 0
    });
  }

  return performance;
};

// Method to get attendance summary for children
parentSchema.methods.getAttendanceSummary = async function(timeframe = 30) {
  const Attendance = mongoose.model('Attendance');
  const childrenIds = this.children.map(c => c.studentId);

  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

  const attendanceRecords = await Attendance.find({
    student: { $in: childrenIds },
    date: { $gte: startDate }
  }).populate('student');

  const summary = {};

  for (const record of attendanceRecords) {
    const studentId = record.student._id.toString();
    if (!summary[studentId]) {
      summary[studentId] = {
        studentName: record.student.user.profile.fullName,
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0
      };
    }

    summary[studentId].totalDays++;
    if (record.status === 'present') summary[studentId].presentDays++;
    else if (record.status === 'absent') summary[studentId].absentDays++;
    else if (record.status === 'late') summary[studentId].lateDays++;
  }

  // Calculate attendance percentage
  Object.keys(summary).forEach(studentId => {
    const student = summary[studentId];
    student.attendancePercentage = student.totalDays > 0
      ? Math.round((student.presentDays / student.totalDays) * 100)
      : 0;
  });

  return Object.values(summary);
};

// Method to send notification to parent
parentSchema.methods.sendNotification = async function(subject, message, sentBy) {
  this.communicationLog.push({
    type: 'email',
    subject,
    message,
    sentBy,
    sentAt: new Date()
  });

  await this.save();

  // Here you could integrate with email service
  console.log(`Notification sent to parent: ${subject}`);
};

// Method to update portal access
parentSchema.methods.updatePortalAccess = function() {
  this.portalAccess.lastLogin = new Date();
  this.portalAccess.loginCount++;
  return this.save();
};

export default mongoose.model('Parent', parentSchema);