import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },

  date: {
    type: Date,
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  period: {
    type: Number,
    min: 1,
    max: 8,
    required: true
  },

  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused', 'half_day'],
    required: true
  },

  checkInTime: {
    type: Date
  },

  checkOutTime: {
    type: Date
  },

  duration: {
    type: Number, // in minutes
  },

  remarks: {
    type: String,
    maxlength: 500
  },

  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // For bulk attendance marking
  isBulkEntry: {
    type: Boolean,
    default: false
  },

  // Location tracking (optional)
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },

  // Device information for audit
  deviceInfo: {
    userAgent: String,
    ipAddress: String
  },

  // Notification status
  notificationsSent: {
    parentNotified: { type: Boolean, default: false },
    parentNotificationTime: Date,
    adminNotified: { type: Boolean, default: false },
    adminNotificationTime: Date
  },

  // Audit fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound indexes for better performance
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ teacherId: 1, date: 1 });
attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ studentId: 1, date: -1, subject: 1 });

// Pre-save middleware
attendanceSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Calculate duration if both check-in and check-out times are available
  if (this.checkInTime && this.checkOutTime) {
    this.duration = Math.round((this.checkOutTime - this.checkInTime) / (1000 * 60)); // in minutes
  }

  next();
});

// Static method to get attendance for a specific date range
attendanceSchema.statics.getAttendanceReport = async function(studentId, startDate, endDate, subject = null) {
  const query = {
    studentId: studentId,
    date: { $gte: startDate, $lte: endDate }
  };

  if (subject) {
    query.subject = subject;
  }

  return await this.find(query)
    .populate('teacherId', 'username')
    .populate('studentId', 'username')
    .sort({ date: 1 });
};

// Static method to get class attendance for a specific date
attendanceSchema.statics.getClassAttendance = async function(classId, date, subject = null) {
  const query = {
    classId: classId,
    date: date
  };

  if (subject) {
    query.subject = subject;
  }

  return await this.find(query)
    .populate('studentId', 'username profile')
    .populate('teacherId', 'username')
    .sort({ 'studentId.username': 1 });
};

// Static method to get attendance statistics
attendanceSchema.statics.getAttendanceStats = async function(studentId, timeframe = 30) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);

  const stats = await this.aggregate([
    {
      $match: {
        studentId: mongoose.Types.ObjectId(studentId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalDays = stats.reduce((sum, stat) => sum + stat.count, 0);
  const presentDays = stats.find(s => s._id === 'present')?.count || 0;
  const absentDays = stats.find(s => s._id === 'absent')?.count || 0;
  const lateDays = stats.find(s => s._id === 'late')?.count || 0;

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
    breakdown: stats
  };
};

// Method to send notification to parent
attendanceSchema.methods.notifyParent = async function() {
  try {
    const User = mongoose.model('User');
    const Notification = mongoose.model('Notification');

    const student = await User.findById(this.studentId);
    if (!student) return;

    // Create notification for the student about their attendance
    const message = `Attendance Update: You were marked ${this.status} for ${this.subject} on ${this.date.toDateString()}`;

    await Notification.create({
      userId: this.studentId,
      createdBy: this.teacherId,
      title: 'Attendance Update',
      type: 'attendance',
      message: message,
      priority: this.status === 'absent' ? 'high' : 'medium'
    });

    this.notificationsSent.parentNotified = true;
    this.notificationsSent.parentNotificationTime = new Date();
    
    await this.save();
  } catch (error) {
    console.error('Error sending attendance notification:', error);
  }
};

// Method to mark attendance with validation
attendanceSchema.methods.markAttendance = async function(status, remarks = '', markedBy) {
  // Prevent duplicate attendance for same student, date, subject, period
  const existingAttendance = await mongoose.model('Attendance').findOne({
    studentId: this.studentId,
    date: this.date,
    subject: this.subject,
    period: this.period
  });

  if (existingAttendance && existingAttendance._id.toString() !== this._id.toString()) {
    throw new Error('Attendance already marked for this student, date, subject, and period');
  }

  this.status = status;
  this.remarks = remarks;
  this.markedBy = markedBy;

  // Set check-in time for present/late status
  if (status === 'present' || status === 'late') {
    this.checkInTime = this.checkInTime || new Date();
  }

  await this.save();

  // Send notification if student is absent
  if (status === 'absent') {
    await this.notifyParent();
  }

  return this;
};

export default mongoose.model('Attendance', attendanceSchema);