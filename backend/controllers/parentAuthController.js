import User from '../models/User.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId, role: 'parent' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register a new parent
// @route   POST /api/parents/auth/register
// @access  Private (Admin only)
export const registerParent = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      phone,
      address,
      occupation,
      workplace,
      annualIncome,
      children
    } = req.body;

    // Check if parent already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Validate children exist and get their IDs
    const childrenData = [];
    if (children && children.length > 0) {
      for (const child of children) {
        const student = await Student.findOne({ studentId: child.studentId });
        if (!student) {
          return res.status(400).json({
            success: false,
            message: `Student with ID ${child.studentId} not found`
          });
        }
        childrenData.push({
          studentId: student._id,
          relationship: child.relationship,
          isPrimaryContact: child.isPrimaryContact || false
        });
      }
    }

    // Create user account
    const user = new User({
      username,
      email,
      password,
      role: 'parent',
      profile: {
        fullName,
        phone,
        address
      }
    });

    await user.save();

    // Create parent profile
    const parent = new Parent({
      user: user._id,
      occupation,
      workplace,
      annualIncome,
      children: childrenData
    });

    await parent.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Parent registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        parent: {
          id: parent._id,
          children: parent.children.length,
          status: parent.status
        },
        token
      }
    });

  } catch (error) {
    console.error('Parent registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during parent registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Parent login
// @route   POST /api/parents/auth/login
// @access  Public
export const loginParent = async (req, res) => {
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

    // Check if user is a parent
    if (user.role !== 'parent') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not a parent account.'
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

    // Get parent profile
    const parent = await Parent.findOne({ user: user._id });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Check if parent is active
    if (parent.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact administrator.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update portal access
    await parent.updatePortalAccess();

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
        parent: {
          id: parent._id,
          children: parent.children.length,
          status: parent.status
        },
        token
      }
    });

  } catch (error) {
    console.error('Parent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get parent profile
// @route   GET /api/parents/auth/profile
// @access  Private (Parent only)
export const getParentProfile = async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id })
      .populate('user', '-password')
      .populate('children.studentId', 'user studentId academicInfo');

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    res.json({
      success: true,
      data: parent
    });

  } catch (error) {
    console.error('Get parent profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update parent profile
// @route   PUT /api/parents/auth/profile
// @access  Private (Parent only)
export const updateParentProfile = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      address,
      occupation,
      workplace,
      annualIncome,
      contactPreferences,
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

    // Update parent profile
    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    if (occupation) parent.occupation = occupation;
    if (workplace) parent.workplace = workplace;
    if (annualIncome) parent.annualIncome = annualIncome;
    if (contactPreferences) parent.contactPreferences = { ...parent.contactPreferences, ...contactPreferences };
    if (emergencyContact) parent.emergencyContact = emergencyContact;

    await parent.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          profile: user.profile
        },
        parent: {
          occupation: parent.occupation,
          workplace: parent.workplace,
          annualIncome: parent.annualIncome,
          contactPreferences: parent.contactPreferences,
          emergencyContact: parent.emergencyContact
        }
      }
    });

  } catch (error) {
    console.error('Update parent profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change parent password
// @route   PUT /api/parents/auth/change-password
// @access  Private (Parent only)
export const changeParentPassword = async (req, res) => {
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
    console.error('Change parent password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get parent dashboard overview
// @route   GET /api/parents/auth/dashboard
// @access  Private (Parent only)
export const getParentDashboard = async (req, res) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Get children details and performance
    const childrenPerformance = await parent.getChildrenPerformance();
    const attendanceSummary = await parent.getAttendanceSummary();

    // Get recent communications
    const recentCommunications = parent.communicationLog
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        childrenCount: parent.children.length,
        childrenPerformance,
        attendanceSummary,
        recentCommunications,
        portalAccess: parent.portalAccess
      }
    });

  } catch (error) {
    console.error('Get parent dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add child to parent profile
// @route   POST /api/parents/auth/add-child
// @access  Private (Parent only)
export const addChild = async (req, res) => {
  try {
    const { studentId, relationship, isPrimaryContact } = req.body;

    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent profile not found'
      });
    }

    // Check if student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if child is already added
    const existingChild = parent.children.find(
      child => child.studentId.toString() === student._id.toString()
    );

    if (existingChild) {
      return res.status(400).json({
        success: false,
        message: 'Child is already added to your profile'
      });
    }

    // Add child
    parent.children.push({
      studentId: student._id,
      relationship,
      isPrimaryContact: isPrimaryContact || false
    });

    await parent.save();

    res.json({
      success: true,
      message: 'Child added successfully',
      data: {
        child: {
          studentId: student.studentId,
          relationship,
          isPrimaryContact
        }
      }
    });

  } catch (error) {
    console.error('Add child error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding child',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};