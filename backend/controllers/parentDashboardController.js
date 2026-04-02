import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import Notification from '../models/Notification.js';

// @desc    Get parent's children overview
// @route   GET /api/parents/dashboard/children
// @access  Private (Parent only)
export const getChildrenOverview = async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.user.id })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'user',
            select: 'profile'
          },
          {
            path: 'academicInfo.class',
            select: 'className grade section'
          }
        ]
      });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    const childrenData = [];

    for (const child of parent.children) {
      // Get attendance summary
      const attendanceSummary = await child.getAttendanceSummary();

      // Get recent exam results
      const recentExams = await Exam.find({
        'participants.studentId': child._id
      })
      .sort({ createdAt: -1 })
      .limit(5);

      const examResults = [];
      for (const exam of recentExams) {
        const participant = exam.participants.find(p =>
          p.studentId.toString() === child._id.toString()
        );
        if (participant && participant.score !== undefined) {
          examResults.push({
            examTitle: exam.title,
            subject: exam.subject,
            score: participant.score,
            totalQuestions: exam.questions.length,
            percentage: Math.round((participant.score / exam.questions.length) * 100),
            date: participant.completedAt
          });
        }
      }

      childrenData.push({
        id: child._id,
        studentId: child.studentId,
        fullName: child.user.profile.fullName,
        class: child.academicInfo.class?.className,
        grade: child.academicInfo.class?.grade,
        section: child.academicInfo.class?.section,
        rollNumber: child.academicInfo.rollNumber,
        status: child.status,
        performance: {
          gpa: child.performance.overallGPA,
          recentExams: examResults.slice(0, 3)
        },
        attendance: attendanceSummary
      });
    }

    res.json({
      success: true,
      data: {
        totalChildren: childrenData.length,
        children: childrenData
      }
    });

  } catch (error) {
    console.error('Get children overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving children data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get detailed child performance
// @route   GET /api/parents/dashboard/children/:studentId/performance
// @access  Private (Parent only)
export const getChildPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if this student is the parent's child
    const parent = await Parent.findOne({ user: req.user.id });
    const isChild = parent.children.some(childId =>
      childId.toString() === studentId
    );

    if (!isChild) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this student\'s data'
      });
    }

    const student = await Student.findById(studentId)
      .populate('user', '-password')
      .populate('academicInfo.class', 'className grade section');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all exam results
    const exams = await Exam.find({
      'participants.studentId': studentId
    }).sort({ createdAt: -1 });

    const examResults = [];
    for (const exam of exams) {
      const participant = exam.participants.find(p =>
        p.studentId.toString() === studentId
      );
      if (participant && participant.score !== undefined) {
        examResults.push({
          examId: exam._id,
          examTitle: exam.title,
          subject: exam.subject,
          score: participant.score,
          totalQuestions: exam.questions.length,
          percentage: Math.round((participant.score / exam.questions.length) * 100),
          date: participant.completedAt
        });
      }
    }

    // Get attendance details
    const attendanceRecords = await Attendance.find({
      student: studentId
    })
    .populate('markedBy', 'profile.fullName')
    .sort({ date: -1 })
    .limit(30);

    const attendanceDetails = attendanceRecords.map(record => ({
      date: record.date,
      status: record.status,
      markedBy: record.markedBy?.profile?.fullName,
      notes: record.notes
    }));

    // Get attendance summary
    const attendanceSummary = await student.getAttendanceSummary();

    // Calculate performance trends
    const performanceTrend = {
      currentGPA: student.performance.overallGPA,
      subjectWise: student.performance.subjectWise || {},
      improvementAreas: student.performance.improvementAreas || []
    };

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          studentId: student.studentId,
          fullName: student.user.profile.fullName,
          class: student.academicInfo.class?.className,
          grade: student.academicInfo.class?.grade,
          section: student.academicInfo.class?.section
        },
        performance: {
          overallGPA: student.performance.overallGPA,
          subjectWise: student.performance.subjectWise,
          improvementAreas: student.performance.improvementAreas,
          trend: performanceTrend
        },
        exams: {
          totalExams: examResults.length,
          results: examResults,
          averageScore: examResults.length > 0
            ? Math.round(examResults.reduce((sum, exam) => sum + exam.percentage, 0) / examResults.length)
            : 0
        },
        attendance: {
          summary: attendanceSummary,
          recentRecords: attendanceDetails
        }
      }
    });

  } catch (error) {
    console.error('Get child performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving performance data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get child's attendance report
// @route   GET /api/parents/dashboard/children/:studentId/attendance
// @access  Private (Parent only)
export const getChildAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    // Check if this student is the parent's child
    const parent = await Parent.findOne({ user: req.user.id });
    const isChild = parent.children.some(childId =>
      childId.toString() === studentId
    );

    if (!isChild) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this student\'s attendance'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Build date filter
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1, 1);
    const endDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth(), 31);

    const attendanceRecords = await Attendance.find({
      student: studentId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('markedBy', 'profile.fullName')
    .sort({ date: 1 });

    const attendanceData = attendanceRecords.map(record => ({
      date: record.date,
      status: record.status,
      markedBy: record.markedBy?.profile?.fullName,
      notes: record.notes
    }));

    // Calculate monthly statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
    const lateDays = attendanceRecords.filter(r => r.status === 'late').length;

    const monthlyStats = {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
    };

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          studentId: student.studentId,
          fullName: student.user.profile.fullName
        },
        period: {
          month: month || new Date().getMonth() + 1,
          year: year || new Date().getFullYear()
        },
        monthlyStats,
        attendanceRecords: attendanceData
      }
    });

  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving attendance data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Send message to teacher
// @route   POST /api/parents/dashboard/contact-teacher
// @access  Private (Parent only)
export const contactTeacher = async (req, res) => {
  try {
    const { studentId, teacherId, subject, message } = req.body;

    // Check if this student is the parent's child
    const parent = await Parent.findOne({ user: req.user.id });
    const isChild = parent.children.some(childId =>
      childId.toString() === studentId
    );

    if (!isChild) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to contact teachers for this student'
      });
    }

    // Verify teacher exists and is assigned to the student's class
    const student = await Student.findById(studentId).populate('academicInfo.class');
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    const isAssignedToClass = teacher.assignedClasses.some(ac =>
      ac.classId.toString() === student.academicInfo.class._id.toString()
    );

    if (!isAssignedToClass) {
      return res.status(403).json({
        success: false,
        message: 'This teacher is not assigned to your child\'s class'
      });
    }

    // Create notification for teacher
    const notification = new Notification({
      recipient: teacher.user,
      sender: req.user.id,
      type: 'parent_message',
      title: `Message from Parent - ${subject}`,
      message: message,
      relatedStudent: studentId,
      priority: 'medium'
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Message sent to teacher successfully'
    });

  } catch (error) {
    console.error('Contact teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get parent notifications
// @route   GET /api/parents/dashboard/notifications
// @access  Private (Parent only)
export const getParentNotifications = async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.user.id });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Get notifications for this parent
    const notifications = await Notification.find({
      recipient: req.user.id
    })
    .populate('sender', 'profile.fullName')
    .populate('relatedStudent', 'studentId user')
    .sort({ createdAt: -1 })
    .limit(20);

    const formattedNotifications = notifications.map(notification => ({
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      sender: notification.sender?.profile?.fullName,
      relatedStudent: notification.relatedStudent ? {
        studentId: notification.relatedStudent.studentId,
        fullName: notification.relatedStudent.user?.profile?.fullName
      } : null,
      priority: notification.priority,
      read: notification.read,
      createdAt: notification.createdAt
    }));

    res.json({
      success: true,
      data: formattedNotifications
    });

  } catch (error) {
    console.error('Get parent notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/parents/dashboard/notifications/:notificationId/read
// @access  Private (Parent only)
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update parent communication preferences
// @route   PUT /api/parents/dashboard/preferences
// @access  Private (Parent only)
export const updateCommunicationPreferences = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, pushNotifications } = req.body;

    const parent = await Parent.findOne({ user: req.user.id });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    parent.communicationPreferences = {
      emailNotifications: emailNotifications ?? parent.communicationPreferences.emailNotifications,
      smsNotifications: smsNotifications ?? parent.communicationPreferences.smsNotifications,
      pushNotifications: pushNotifications ?? parent.communicationPreferences.pushNotifications
    };

    await parent.save();

    res.json({
      success: true,
      message: 'Communication preferences updated successfully',
      data: parent.communicationPreferences
    });

  } catch (error) {
    console.error('Update communication preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};