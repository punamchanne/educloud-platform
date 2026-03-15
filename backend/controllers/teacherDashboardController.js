import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Exam from '../models/Exam.js';
import Attendance from '../models/Attendance.js';
import Notification from '../models/Notification.js';

// @desc    Get teacher's assigned classes
// @route   GET /api/teachers/dashboard/classes
// @access  Private (Teacher only)
export const getAssignedClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id })
      .populate('assignedClasses.classId', 'className grade section academicYear statistics');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.json({
      success: true,
      data: teacher.assignedClasses
    });

  } catch (error) {
    console.error('Get assigned classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving classes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get students in a specific class
// @route   GET /api/teachers/dashboard/classes/:classId/students
// @access  Private (Teacher only)
export const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if teacher is assigned to this class
    const teacher = await Teacher.findOne({ user: req.user._id });
    const isAssigned = teacher.assignedClasses.some(ac =>
      ac.classId.toString() === classId
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this class'
      });
    }

    const classInfo = await Class.findById(classId).populate({
      path: 'students',
      populate: {
        path: 'user',
        select: 'profile'
      }
    });

    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const students = classInfo.students.map(student => ({
      id: student._id,
      studentId: student.studentId,
      fullName: student.user.profile.fullName,
      rollNumber: student.academicInfo.rollNumber,
      status: student.status
    }));

    res.json({
      success: true,
      data: {
        class: {
          id: classInfo._id,
          className: classInfo.className,
          totalStudents: students.length
        },
        students
      }
    });

  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving students',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get student details and performance
// @route   GET /api/teachers/dashboard/students/:studentId
// @access  Private (Teacher only)
export const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ studentId })
      .populate('user', '-password')
      .populate('academicInfo.class', 'className grade section');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if teacher is assigned to this student's class
    const teacher = await Teacher.findOne({ user: req.user._id });
    const isAssigned = teacher.assignedClasses.some(ac =>
      ac.classId.toString() === student.academicInfo.class?._id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this student\'s class'
      });
    }

    // Get student's exam performance
    const exams = await Exam.find({
      'participants.studentId': student._id
    });

    const examResults = [];
    for (const exam of exams) {
      const participant = exam.participants.find(p =>
        p.studentId.toString() === student._id.toString()
      );
      if (participant && participant.score !== undefined) {
        examResults.push({
          examId: exam._id,
          examTitle: exam.title,
          score: participant.score,
          totalQuestions: exam.questions.length,
          percentage: Math.round((participant.score / exam.questions.length) * 100),
          date: participant.completedAt
        });
      }
    }

    // Get attendance summary
    const attendanceSummary = await student.getAttendanceSummary();

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          studentId: student.studentId,
          fullName: student.user.profile.fullName,
          profile: student.user.profile,
          academicInfo: student.academicInfo,
          personalInfo: student.personalInfo,
          performance: student.performance,
          status: student.status
        },
        examResults,
        attendanceSummary
      }
    });

  } catch (error) {
    console.error('Get student details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving student details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get teacher's exam history
// @route   GET /api/teachers/dashboard/exams
// @access  Private (Teacher only)
export const getTeacherExams = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Get exams created by this teacher
    const exams = await Exam.find({ createdBy: req.user._id })
      .populate('class', 'className grade section')
      .sort({ createdAt: -1 });

    const examStats = exams.map(exam => {
      const participants = exam.participants || [];
      const completedCount = participants.filter(p => p.completedAt).length;
      const averageScore = participants.length > 0
        ? participants.reduce((sum, p) => sum + (p.score || 0), 0) / participants.length
        : 0;

      return {
        id: exam._id,
        title: exam.title,
        subject: exam.subject,
        class: exam.class?.className,
        totalQuestions: exam.questions.length,
        duration: exam.duration,
        participantsCount: participants.length,
        completedCount,
        averageScore: Math.round(averageScore * 100) / 100,
        status: exam.status,
        createdAt: exam.createdAt
      };
    });

    res.json({
      success: true,
      data: {
        totalExams: exams.length,
        exams: examStats
      }
    });

  } catch (error) {
    console.error('Get teacher exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving exams',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get class performance overview
// @route   GET /api/teachers/dashboard/classes/:classId/performance
// @access  Private (Teacher only)
export const getClassPerformance = async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if teacher is assigned to this class
    const teacher = await Teacher.findOne({ user: req.user._id });
    const isAssigned = teacher.assignedClasses.some(ac =>
      ac.classId.toString() === classId
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this class'
      });
    }

    const classInfo = await Class.findById(classId);
    if (!classInfo) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Get all students in the class
    const students = await Student.find({
      'academicInfo.class': classId
    }).populate('user', 'profile');

    const performanceData = [];

    for (const student of students) {
      // Get exam results for this student
      const exams = await Exam.find({
        'participants.studentId': student._id,
        class: classId
      });

      const examResults = [];
      for (const exam of exams) {
        const participant = exam.participants.find(p =>
          p.studentId.toString() === student._id.toString()
        );
        if (participant && participant.score !== undefined) {
          examResults.push({
            examTitle: exam.title,
            score: participant.score,
            totalQuestions: exam.questions.length,
            percentage: Math.round((participant.score / exam.questions.length) * 100)
          });
        }
      }

      const averageScore = examResults.length > 0
        ? examResults.reduce((sum, exam) => sum + exam.percentage, 0) / examResults.length
        : 0;

      // Get attendance for this student
      const attendanceSummary = await student.getAttendanceSummary();

      performanceData.push({
        student: {
          id: student._id,
          studentId: student.studentId,
          fullName: student.user.profile.fullName
        },
        academic: {
          gpa: student.performance.overallGPA,
          totalExams: examResults.length,
          averageScore: Math.round(averageScore)
        },
        attendance: attendanceSummary
      });
    }

    // Calculate class averages
    const classAverages = {
      averageGPA: performanceData.length > 0
        ? performanceData.reduce((sum, p) => sum + p.academic.gpa, 0) / performanceData.length
        : 0,
      averageAttendance: performanceData.length > 0
        ? performanceData.reduce((sum, p) => sum + p.attendance.attendancePercentage, 0) / performanceData.length
        : 0,
      totalStudents: performanceData.length
    };

    res.json({
      success: true,
      data: {
        class: {
          id: classInfo._id,
          className: classInfo.className
        },
        classAverages,
        students: performanceData
      }
    });

  } catch (error) {
    console.error('Get class performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving class performance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get teacher's schedule
// @route   GET /api/teachers/dashboard/schedule
// @access  Private (Teacher only)
export const getTeacherSchedule = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    const today = new Date().toLocaleLowerCase();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = days[new Date().getDay()];

    const todaysSchedule = teacher.schedule.find(s =>
      s.day.toLowerCase() === todayName
    ) || null;

    res.json({
      success: true,
      data: {
        fullSchedule: teacher.schedule,
        todaysSchedule,
        today: todayName
      }
    });

  } catch (error) {
    console.error('Get teacher schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get teacher notifications and announcements
// @route   GET /api/teachers/dashboard/notifications
// @access  Private (Teacher only)
export const getTeacherNotifications = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Get recent notifications from the database
    const notifications = await Notification.find({ 
      userId: req.user._id 
    })
    .populate('createdBy', 'username')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('type title message createdAt read priority');

    res.json({
      success: true,
      data: {
        notifications,
        totalCount: notifications.length,
        unreadCount: notifications.filter(n => !n.read).length
      }
    });

  } catch (error) {
    console.error('Get teacher notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update teacher performance metrics
// @route   POST /api/teachers/dashboard/update-metrics
// @access  Private (Teacher only)
export const updateTeacherMetrics = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    await teacher.updatePerformanceMetrics();

    res.json({
      success: true,
      message: 'Performance metrics updated successfully',
      data: teacher.performanceMetrics
    });

  } catch (error) {
    console.error('Update teacher metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};