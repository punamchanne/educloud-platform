import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Professional Information
  employeeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  department: {
    type: String,
    required: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  qualification: {
    type: String,
    required: true
  },
  experience: {
    type: Number, // years of experience
    default: 0
  },
  joiningDate: {
    type: Date,
    required: true
  },

  // Class and Student Management
  assignedClasses: [{
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    className: String,
    subject: String,
    academicYear: String
  }],

  // Schedule and Availability
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    periods: [{
      subject: String,
      className: String,
      startTime: String,
      endTime: String,
      room: String
    }]
  }],

  // Performance and Statistics
  performanceMetrics: {
    averageStudentRating: { type: Number, default: 0 },
    totalExamsCreated: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    attendanceRate: { type: Number, default: 0 }
  },

  // Communication and Notifications
  contactPreferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    parentCommunication: { type: Boolean, default: true }
  },

  // Status and Permissions
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'on_leave'],
    default: 'active'
  },
  permissions: {
    canCreateExams: { type: Boolean, default: true },
    canGradeStudents: { type: Boolean, default: true },
    canManageAttendance: { type: Boolean, default: true },
    canCommunicateWithParents: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true }
  },

  // Additional Information
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },

  // Audit fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamps
teacherSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for full name from User model
teacherSchema.virtual('fullName').get(async function() {
  const user = await mongoose.model('User').findById(this.user);
  return user ? user.profile.fullName : '';
});

// Method to get assigned students
teacherSchema.methods.getAssignedStudents = async function() {
  const Student = mongoose.model('Student');
  const assignedClassIds = this.assignedClasses.map(ac => ac.classId);

  return await Student.find({
    'academicInfo.class': { $in: assignedClassIds }
  }).populate('user');
};

// Method to get today's schedule
teacherSchema.methods.getTodaySchedule = function() {
  const today = new Date().toLocaleLowerCase();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[new Date().getDay()];

  return this.schedule.find(s => s.day.toLowerCase() === dayName) || null;
};

// Method to update performance metrics
teacherSchema.methods.updatePerformanceMetrics = async function() {
  try {
    // Calculate total students
    const Student = mongoose.model('Student');
    const assignedClassIds = this.assignedClasses.map(ac => ac.classId);
    const totalStudents = await Student.countDocuments({
      'academicInfo.class': { $in: assignedClassIds }
    });

    // Calculate attendance rate (simplified)
    const Attendance = mongoose.model('Attendance');
    const totalAttendanceRecords = await Attendance.countDocuments({
      teacher: this._id,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const presentRecords = await Attendance.countDocuments({
      teacher: this._id,
      status: 'present',
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const attendanceRate = totalAttendanceRecords > 0 ? (presentRecords / totalAttendanceRecords) * 100 : 0;

    this.performanceMetrics.totalStudents = totalStudents;
    this.performanceMetrics.attendanceRate = Math.round(attendanceRate * 100) / 100;

    await this.save();
  } catch (error) {
    console.error('Error updating teacher performance metrics:', error);
  }
};

export default mongoose.model('Teacher', teacherSchema);