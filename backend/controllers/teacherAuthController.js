import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId, role: 'teacher' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register a new teacher
// @route   POST /api/teachers/auth/register
// @access  Private (Admin only)
export const registerTeacher = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      phone,
      address,
      employeeId,
      department,
      subjects,
      qualification,
      experience,
      joiningDate
    } = req.body;

    // Check if teacher already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Check if employee ID already exists
    const existingTeacher = await Teacher.findOne({ employeeId });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    // Create user account
    const user = new User({
      username,
      email,
      password,
      role: 'teacher',
      profile: {
        fullName,
        phone,
        address
      }
    });

    await user.save();

    // Create teacher profile
    const teacher = new Teacher({
      user: user._id,
      employeeId,
      department,
      subjects,
      qualification,
      experience,
      joiningDate
    });

    await teacher.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        teacher: {
          id: teacher._id,
          employeeId: teacher.employeeId,
          department: teacher.department,
          subjects: teacher.subjects,
          status: teacher.status
        },
        token
      }
    });

  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during teacher registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Teacher login
// @route   POST /api/teachers/auth/login
// @access  Public
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is a teacher
    if (user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not a teacher account.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get teacher profile
    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Check if teacher is active
    if (teacher.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact administrator.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    teacher.portalAccess.lastLogin = new Date();
    teacher.portalAccess.loginCount++;
    await teacher.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        teacher: {
          id: teacher._id,
          employeeId: teacher.employeeId,
          department: teacher.department,
          subjects: teacher.subjects,
          status: teacher.status,
          permissions: teacher.permissions
        },
        token
      }
    });

  } catch (error) {
    console.error('Teacher login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get teacher profile
// @route   GET /api/teachers/auth/profile
// @access  Private (Teacher only)
export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id })
      .populate('user', '-password')
      .populate('assignedClasses.classId', 'className grade section');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.json({
      success: true,
      data: teacher
    });

  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update teacher profile
// @route   PUT /api/teachers/auth/profile
// @access  Private (Teacher only)
export const updateTeacherProfile = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      address,
      qualification,
      experience,
      emergencyContact
    } = req.body;

    // Update user profile
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (fullName) user.profile.fullName = fullName;
    if (phone) user.profile.phone = phone;
    if (address) user.profile.address = address;

    await user.save();

    // Update teacher profile
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    if (qualification) teacher.qualification = qualification;
    if (experience !== undefined) teacher.experience = experience;
    if (emergencyContact) teacher.emergencyContact = emergencyContact;

    await teacher.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          profile: user.profile
        },
        teacher: {
          qualification: teacher.qualification,
          experience: teacher.experience,
          emergencyContact: teacher.emergencyContact
        }
      }
    });

  } catch (error) {
    console.error('Update teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change teacher password
// @route   PUT /api/teachers/auth/change-password
// @access  Private (Teacher only)
export const changeTeacherPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change teacher password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get teacher dashboard stats
// @route   GET /api/teachers/auth/dashboard-stats
// @access  Private (Teacher only)
export const getTeacherDashboardStats = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Get assigned students count
    const Student = (await import('../models/Student.js')).default;
    const assignedClassIds = teacher.assignedClasses.map(ac => ac.classId);
    const totalStudents = await Student.countDocuments({
      'academicInfo.class': { $in: assignedClassIds }
    });

    // Get today's attendance stats
    const Attendance = (await import('../models/Attendance.js')).default;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.find({
      teacher: teacher._id,
      date: today
    });

    const presentCount = todayAttendance.filter(a => a.status === 'present').length;
    const absentCount = todayAttendance.filter(a => a.status === 'absent').length;

    res.json({
      success: true,
      data: {
        totalStudents,
        todayAttendance: {
          total: todayAttendance.length,
          present: presentCount,
          absent: absentCount
        },
        assignedClasses: teacher.assignedClasses.length,
        performanceMetrics: teacher.performanceMetrics
      }
    });

  } catch (error) {
    console.error('Get teacher dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};