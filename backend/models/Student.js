import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  studentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  }, // Unique ID like roll number

  academicInfo: {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    className: String, // e.g., '10th Grade A'
    section: String,
    rollNumber: String,
    admissionDate: Date,
    graduationDate: Date
  },

  personalInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    bloodGroup: String,
    nationality: String,
    religion: String,
    caste: String,
    motherTongue: String
  },

  contactInfo: {
    address: {
      permanent: String,
      current: String
    },
    phone: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },

  // Fee Management
  fees: {
    totalDue: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    paymentHistory: [{
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      method: {
        type: String,
        enum: ['cash', 'bank_transfer', 'online', 'cheque']
      },
      transactionId: String,
      remarks: String
    }]
  },

  // Academic Performance
  performance: {
    overallGPA: { type: Number, default: 0, min: 0, max: 4 },
    totalCredits: { type: Number, default: 0 },
    subjects: [{
      subject: { type: String, required: true },
      grade: { type: String },
      score: { type: Number, min: 0, max: 100 },
      credits: { type: Number, default: 1 },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
      }
    }]
  },

  // Medical Information
  medicalInfo: {
    allergies: [String],
    medications: [String],
    conditions: [String],
    doctorName: String,
    doctorPhone: String,
    bloodGroup: String,
    height: Number, // in cm
    weight: Number  // in kg
  },

  // Extracurricular Activities
  extracurricular: [{
    activity: String,
    role: String,
    achievements: [String],
    startDate: Date,
    endDate: Date
  }],

  // Behavioral Records
  behavioralRecords: [{
    type: {
      type: String,
      enum: ['achievement', 'warning', 'commendation', 'disciplinary']
    },
    description: String,
    date: { type: Date, default: Date.now },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],

  // Status and Permissions
  status: {
    type: String,
    enum: ['active', 'inactive', 'transferred', 'graduated', 'suspended'],
    default: 'active'
  },

  // Portal Access
  portalAccess: {
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lockReason: String
  },

  // Audit fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware
studentSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Calculate pending fees
  this.fees.pending = this.fees.totalDue - this.fees.paid;

  next();
});

// Virtual for full name from User model
studentSchema.virtual('fullName').get(async function() {
  const user = await mongoose.model('User').findById(this.user);
  return user ? user.profile.fullName : '';
});

// Method to calculate unpaid fees
studentSchema.methods.getUnpaidFees = function() {
  return this.fees.pending;
};

// Method to add payment
studentSchema.methods.addPayment = function(amount, method, transactionId = '', remarks = '') {
  this.fees.paid += amount;
  this.fees.paymentHistory.push({
    amount,
    method,
    transactionId,
    remarks,
    date: new Date()
  });

  return this.save();
};

// Method to update academic performance
studentSchema.methods.updatePerformance = function(subject, score, grade = '') {
  const subjectIndex = this.performance.subjects.findIndex(s => s.subject === subject);

  if (subjectIndex >= 0) {
    this.performance.subjects[subjectIndex].score = score;
    this.performance.subjects[subjectIndex].grade = grade;
  } else {
    this.performance.subjects.push({ subject, score, grade });
  }

  // Recalculate GPA
  this.calculateGPA();

  return this.save();
};

// Method to calculate GPA
studentSchema.methods.calculateGPA = function() {
  if (this.performance.subjects.length === 0) {
    this.performance.overallGPA = 0;
    return;
  }

  let totalPoints = 0;
  let totalCredits = 0;

  this.performance.subjects.forEach(subject => {
    const gradePoint = this.convertGradeToPoint(subject.grade);
    totalPoints += gradePoint * subject.credits;
    totalCredits += subject.credits;
  });

  this.performance.overallGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;
  this.performance.totalCredits = totalCredits;
};

// Helper method to convert grade to GPA points
studentSchema.methods.convertGradeToPoint = function(grade) {
  const gradeMap = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  return gradeMap[grade] || 0;
};

// Method to get attendance summary
studentSchema.methods.getAttendanceSummary = async function(timeframe = 30) {
  const Attendance = mongoose.model('Attendance');
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

  const attendanceRecords = await Attendance.find({
    student: this._id,
    date: { $gte: startDate }
  });

  const stats = {
    totalDays: attendanceRecords.length,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0
  };

  attendanceRecords.forEach(record => {
    if (record.status === 'present') stats.presentDays++;
    else if (record.status === 'absent') stats.absentDays++;
    else if (record.status === 'late') stats.lateDays++;
  });

  stats.attendancePercentage = stats.totalDays > 0
    ? Math.round((stats.presentDays / stats.totalDays) * 100)
    : 0;

  return stats;
};

// Method to add behavioral record
studentSchema.methods.addBehavioralRecord = function(type, description, reportedBy, severity = 'low') {
  this.behavioralRecords.push({
    type,
    description,
    reportedBy,
    severity,
    date: new Date()
  });

  return this.save();
};

export default mongoose.model('Student', studentSchema);
