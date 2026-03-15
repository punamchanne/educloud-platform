import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Parent from '../models/Parent.js';
import Class from '../models/Class.js';

// @desc    Mark attendance for a student
// @route   POST /api/attendance/mark
// @access  Private (Teacher only)
export const markAttendance = async (req, res) => {
  try {
    const {
      studentId,
      date,
      subject,
      period,
      status,
      remarks
    } = req.body;

    // Get teacher profile
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Check if teacher has permission to mark attendance
    if (!teacher.permissions.canManageAttendance) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage attendance'
      });
    }

    // Find student
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if teacher is assigned to this student's class
    const isAssignedToClass = teacher.assignedClasses.some(ac =>
      ac.classId.toString() === student.academicInfo.class?.toString()
    );

    if (!isAssignedToClass) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this student\'s class'
      });
    }

    // Create or update attendance record
    let attendance = await Attendance.findOne({
      student: student._id,
      date: new Date(date),
      subject,
      period
    });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.remarks = remarks;
      attendance.markedBy = teacher._id;
      await attendance.markAttendance(status, remarks, teacher._id);
    } else {
      // Create new record
      attendance = new Attendance({
        student: student._id,
        teacher: teacher._id,
        class: student.academicInfo.class,
        date: new Date(date),
        subject,
        period,
        status,
        remarks,
        markedBy: teacher._id
      });

      await attendance.markAttendance(status, remarks, teacher._id);
    }

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error marking attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark bulk attendance for a class
// @route   POST /api/attendance/bulk-mark
// @access  Private (Teacher only)
export const markBulkAttendance = async (req, res) => {
  try {
    const {
      classId,
      date,
      subject,
      period,
      attendanceData // Array of { studentId, status, remarks }
    } = req.body;

    // Get teacher profile
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Check permissions
    if (!teacher.permissions.canManageAttendance) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to manage attendance'
      });
    }

    // Check if teacher is assigned to this class
    const isAssignedToClass = teacher.assignedClasses.some(ac =>
      ac.classId.toString() === classId
    );

    if (!isAssignedToClass) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this class'
      });
    }

    const results = [];
    const errors = [];

    for (const record of attendanceData) {
      try {
        const student = await Student.findOne({ studentId: record.studentId });
        if (!student) {
          errors.push({ studentId: record.studentId, error: 'Student not found' });
          continue;
        }

        // Check if attendance already exists
        let attendance = await Attendance.findOne({
          student: student._id,
          date: new Date(date),
          subject,
          period
        });

        if (attendance) {
          // Update existing
          attendance.status = record.status;
          attendance.remarks = record.remarks;
          attendance.markedBy = teacher._id;
          attendance.isBulkEntry = true;
          await attendance.markAttendance(record.status, record.remarks, teacher._id);
        } else {
          // Create new
          attendance = new Attendance({
            student: student._id,
            teacher: teacher._id,
            class: classId,
            date: new Date(date),
            subject,
            period,
            status: record.status,
            remarks: record.remarks,
            markedBy: teacher._id,
            isBulkEntry: true
          });
          await attendance.markAttendance(record.status, record.remarks, teacher._id);
        }

        results.push({
          studentId: record.studentId,
          status: record.status,
          attendanceId: attendance._id
        });

      } catch (error) {
        errors.push({
          studentId: record.studentId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk attendance processed: ${results.length} successful, ${errors.length} errors`,
      data: {
        successful: results,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing bulk attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get attendance for a specific student
// @route   GET /api/attendance/student/:studentId
// @access  Private (Teacher or Parent)
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, subject } = req.query;

    // Find student
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check permissions based on user role
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      const isAssignedToClass = teacher.assignedClasses.some(ac =>
        ac.classId.toString() === student.academicInfo.class?.toString()
      );

      if (!isAssignedToClass) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this student\'s class'
        });
      }
    } else if (req.user.role === 'parent') {
      const parent = await Parent.findOne({ user: req.user._id });
      const isParentOfStudent = parent.children.some(child =>
        child.studentId.toString() === student._id.toString()
      );

      if (!isParentOfStudent) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this student\'s attendance'
        });
      }
    }

    // Get attendance records
    const attendanceRecords = await Attendance.getAttendanceReport(
      student._id,
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date(),
      subject
    );

    res.json({
      success: true,
      data: {
        student: {
          studentId: student.studentId,
          fullName: student.user.profile.fullName,
          class: student.academicInfo.className
        },
        attendance: attendanceRecords,
        summary: await Attendance.getAttendanceStats(student._id)
      }
    });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get class attendance for a specific date
// @route   GET /api/attendance/class/:classId
// @access  Private (Teacher only)
export const getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date, subject } = req.query;

    // Get teacher profile
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Check if teacher is assigned to this class
    const isAssignedToClass = teacher.assignedClasses.some(ac =>
      ac.classId.toString() === classId
    );

    if (!isAssignedToClass) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this class'
      });
    }

    const targetDate = date ? new Date(date) : new Date();

    // Get class attendance
    const attendanceRecords = await Attendance.getClassAttendance(
      classId,
      targetDate,
      subject
    );

    // Get class details
    const classInfo = await Class.findById(classId).populate('students', 'user studentId');

    res.json({
      success: true,
      data: {
        class: {
          id: classInfo._id,
          className: classInfo.className,
          totalStudents: classInfo.students.length
        },
        date: targetDate,
        attendance: attendanceRecords,
        summary: {
          totalMarked: attendanceRecords.length,
          present: attendanceRecords.filter(r => r.status === 'present').length,
          absent: attendanceRecords.filter(r => r.status === 'absent').length,
          late: attendanceRecords.filter(r => r.status === 'late').length
        }
      }
    });

  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving class attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get attendance report for a class
// @route   GET /api/attendance/class/:classId/report
// @access  Private (Teacher only)
export const getClassAttendanceReport = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate, subject } = req.query;

    // Get teacher profile
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Check if teacher is assigned to this class
    const isAssignedToClass = teacher.assignedClasses.some(ac =>
      ac.classId.toString() === classId
    );

    if (!isAssignedToClass) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this class'
      });
    }

    const classInfo = await Class.findById(classId).populate('students', 'user studentId');

    const report = [];
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    for (const student of classInfo.students) {
      const attendanceRecords = await Attendance.find({
        student: student._id,
        date: { $gte: start, $lte: end },
        ...(subject && { subject })
      });

      const stats = {
        totalDays: attendanceRecords.length,
        present: attendanceRecords.filter(r => r.status === 'present').length,
        absent: attendanceRecords.filter(r => r.status === 'absent').length,
        late: attendanceRecords.filter(r => r.status === 'late').length,
        excused: attendanceRecords.filter(r => r.status === 'excused').length
      };

      stats.percentage = stats.totalDays > 0
        ? Math.round((stats.present / stats.totalDays) * 100)
        : 0;

      report.push({
        student: {
          id: student._id,
          studentId: student.studentId,
          fullName: student.user.profile.fullName
        },
        attendance: attendanceRecords,
        statistics: stats
      });
    }

    res.json({
      success: true,
      data: {
        class: {
          id: classInfo._id,
          className: classInfo.className
        },
        period: { startDate: start, endDate: end },
        report,
        summary: {
          totalStudents: classInfo.students.length,
          averageAttendance: report.length > 0
            ? Math.round(report.reduce((sum, r) => sum + r.statistics.percentage, 0) / report.length)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Get class attendance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating attendance report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:attendanceId
// @access  Private (Teacher only)
export const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, remarks } = req.body;

    // Get teacher profile
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Find attendance record
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Check if teacher has permission to update this record
    if (attendance.markedBy.toString() !== teacher._id.toString() &&
        !teacher.permissions.canManageAttendance) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this attendance record'
      });
    }

    // Update the record
    await attendance.markAttendance(status, remarks, teacher._id);

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:attendanceId
// @access  Private (Teacher only)
export const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    // Get teacher profile
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Find attendance record
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Check if teacher has permission to delete this record
    if (attendance.markedBy.toString() !== teacher._id.toString() &&
        !teacher.permissions.canManageAttendance) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this attendance record'
      });
    }

    await Attendance.findByIdAndDelete(attendanceId);

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};