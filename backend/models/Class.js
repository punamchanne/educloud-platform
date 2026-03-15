import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    unique: true,
    index: true
  }, // e.g., '10th Grade A', '9th Grade B'

  grade: {
    type: String,
    required: true
  }, // e.g., '10th', '9th', '8th'

  section: {
    type: String,
    required: true,
    default: 'A'
  }, // e.g., 'A', 'B', 'C'

  academicYear: {
    type: String,
    required: true
  }, // e.g., '2024-2025'

  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },

  subjectTeachers: [{
    subject: {
      type: String,
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    }
  }],

  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],

  // Class Schedule
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    periods: [{
      period: {
        type: Number,
        required: true,
        min: 1,
        max: 8
      },
      subject: {
        type: String,
        required: true
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      room: String
    }]
  }],

  // Class Statistics
  statistics: {
    totalStudents: { type: Number, default: 0 },
    averageAttendance: { type: Number, default: 0 },
    averageGPA: { type: Number, default: 0 },
    topPerformer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }
  },

  // Class Settings
  settings: {
    maxStudents: { type: Number, default: 40 },
    isActive: { type: Boolean, default: true },
    allowLateAdmission: { type: Boolean, default: false }
  },

  // Audit fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware
classSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.statistics.totalStudents = this.students.length;
  next();
});

// Method to add student to class
classSchema.methods.addStudent = async function(studentId) {
  if (this.students.length >= this.settings.maxStudents) {
    throw new Error('Class is at maximum capacity');
  }

  if (!this.students.includes(studentId)) {
    this.students.push(studentId);
    await this.save();

    // Update student's academic info
    const Student = mongoose.model('Student');
    await Student.findByIdAndUpdate(studentId, {
      'academicInfo.class': this._id,
      'academicInfo.className': this.className
    });
  }

  return this;
};

// Method to remove student from class
classSchema.methods.removeStudent = async function(studentId) {
  this.students = this.students.filter(id => id.toString() !== studentId.toString());
  await this.save();

  // Update student's academic info
  const Student = mongoose.model('Student');
  await Student.findByIdAndUpdate(studentId, {
    'academicInfo.class': null,
    'academicInfo.className': null
  });

  return this;
};

// Method to assign subject teacher
classSchema.methods.assignSubjectTeacher = function(subject, teacherId) {
  const existingIndex = this.subjectTeachers.findIndex(st => st.subject === subject);

  if (existingIndex >= 0) {
    this.subjectTeachers[existingIndex].teacher = teacherId;
  } else {
    this.subjectTeachers.push({ subject, teacher: teacherId });
  }

  return this.save();
};

// Method to get today's schedule
classSchema.methods.getTodaySchedule = function() {
  const today = new Date().toLocaleLowerCase();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[new Date().getDay()];

  return this.schedule.find(s => s.day.toLowerCase() === dayName) || null;
};

// Method to get attendance for a specific date
classSchema.methods.getAttendanceForDate = async function(date) {
  const Attendance = mongoose.model('Attendance');

  const attendanceRecords = await Attendance.find({
    class: this._id,
    date: date
  }).populate('student', 'user studentId')
    .populate('teacher', 'user');

  return attendanceRecords;
};

// Method to calculate class statistics
classSchema.methods.calculateStatistics = async function() {
  try {
    const Student = mongoose.model('Student');
    const Attendance = mongoose.model('Attendance');

    // Get all students in this class
    const students = await Student.find({ _id: { $in: this.students } });

    if (students.length === 0) {
      this.statistics = {
        totalStudents: 0,
        averageAttendance: 0,
        averageGPA: 0,
        topPerformer: null
      };
      return this.save();
    }

    // Calculate average GPA
    const totalGPA = students.reduce((sum, student) => sum + student.performance.overallGPA, 0);
    const averageGPA = totalGPA / students.length;

    // Find top performer
    let topPerformer = null;
    let highestGPA = -1;

    students.forEach(student => {
      if (student.performance.overallGPA > highestGPA) {
        highestGPA = student.performance.overallGPA;
        topPerformer = student._id;
      }
    });

    // Calculate average attendance (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const attendanceRecords = await Attendance.find({
      class: this._id,
      date: { $gte: thirtyDaysAgo }
    });

    let totalAttendancePercentage = 0;
    let studentCount = 0;

    // Group by student
    const studentAttendance = {};
    attendanceRecords.forEach(record => {
      const studentId = record.student.toString();
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = { total: 0, present: 0 };
      }
      studentAttendance[studentId].total++;
      if (record.status === 'present') {
        studentAttendance[studentId].present++;
      }
    });

    Object.values(studentAttendance).forEach(attendance => {
      if (attendance.total > 0) {
        totalAttendancePercentage += (attendance.present / attendance.total) * 100;
        studentCount++;
      }
    });

    const averageAttendance = studentCount > 0 ? totalAttendancePercentage / studentCount : 0;

    this.statistics = {
      totalStudents: students.length,
      averageAttendance: Math.round(averageAttendance * 100) / 100,
      averageGPA: Math.round(averageGPA * 100) / 100,
      topPerformer
    };

    await this.save();
    return this;

  } catch (error) {
    console.error('Error calculating class statistics:', error);
    throw error;
  }
};

// Static method to get classes by grade
classSchema.statics.getClassesByGrade = function(grade) {
  return this.find({ grade, 'settings.isActive': true })
    .populate('classTeacher', 'user')
    .sort({ section: 1 });
};

// Static method to get classes by academic year
classSchema.statics.getClassesByAcademicYear = function(academicYear) {
  return this.find({ academicYear })
    .populate('classTeacher', 'user')
    .populate('subjectTeachers.teacher', 'user')
    .sort({ grade: 1, section: 1 });
};

export default mongoose.model('Class', classSchema);