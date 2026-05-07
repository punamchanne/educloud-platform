import User from '../models/User.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { sanitizeInput, isValidObjectId } from '../utils/validators.js';
import validate from '../middlewares/validation.js';
import { sendEmail } from '../utils/email.js';
import crypto from 'crypto';
import { config } from 'dotenv';

config();

// Register a new user
export const register = [
  validate('register'), // Joi validation from validation.js
  async (req, res, next) => {
    try {
      const { username, email, password, role, fullName, phone, address } = req.body;
      const sanitized = {
        username: sanitizeInput(username),
        email: sanitizeInput(email),
        role: sanitizeInput(role),
      };

      // Check for existing user
      const existingUser = await User.findOne({ $or: [{ email: sanitized.email }, { username: sanitized.username }] });
      if (existingUser) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
      }

      // Create user with profile data
      const user = new User({
        ...sanitized,
        password, // Will be hashed by pre-save hook
        profile: {
          fullName: fullName ? sanitizeInput(fullName) : '',
          phone: phone ? sanitizeInput(phone) : '',
          address: address ? sanitizeInput(address) : '',
        }
      });
      await user.save();
      logger.info(`User registered: ${sanitized.email}`);

      // Handle Role-Specific Account Creation
      if (sanitized.role === 'student') {
        // Create initial Student academic record
        const student = new Student({
          user: user._id,
          studentId: `STU${Date.now().toString().slice(-6)}`, // Auto-generate unique ID
          academicInfo: {
            className: 'Not Assigned',
            rollNumber: 'TBD'
          },
          status: 'active'
        });
        await student.save();
        logger.info(`Student record created for user: ${sanitized.email}`);
      } 
      else if (sanitized.role === 'parent') {
        let studentProfile = null;
        
        // If child email provided, try to link
        if (req.body.childEmail) {
          const studentUser = await User.findOne({ email: req.body.childEmail, role: 'student' });
          if (studentUser) {
            studentProfile = await Student.findOne({ user: studentUser._id });
          }
        }

        const parent = new Parent({
          user: user._id,
          children: studentProfile ? [{
            studentId: studentProfile._id,
            relationship: 'other'
          }] : [],
          status: 'active'
        });
        await parent.save();
        logger.info(`Parent record created for user: ${sanitized.email}`);
      }

      res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      logger.error(`Registration error: ${error.message}`, { email: req.body.email });
      next(error);
    }
  },
];

// Login user and return JWT
export const login = [
  validate('login'),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const sanitizedEmail = sanitizeInput(email);

      // Find user
      const user = await User.findOne({ email: sanitizedEmail }).select('+password');
      if (!user) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user._id, _id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info(`User logged in: ${sanitizedEmail}`);
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error(`Login error: ${error.message}`, { email: req.body.email });
      next(error);
    }
  },
];

// Get user profile (including exam history for profile page)
export const getProfile = async (req, res, next) => {
  let userId;
  try {
    userId = req.user.id;
    if (!isValidObjectId(userId)) {
      const error = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Populate exam history with exam details
    await user.populate('examHistory.examId', 'title scheduledDate');
    user.updateExamStats(); // Update counts and averages
    await user.save();

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        examCount: user.examCount,
        averageScore: user.averageScore,
      },
    });
  } catch (error) {
    logger.error(`Profile fetch error: ${error.message}`, { userId });
    next(error);
  }
};

// Forgot Password - Send reset email
export const forgotPassword = [
  validate('forgotPassword'),
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        const error = new Error('No user found with that email');
        error.statusCode = 404;
        throw error;
      }

      // Generate random reset token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Hash token and set to resetPasswordToken field
      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set expire (10 minutes)
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

      await user.save({ validateBeforeSave: false });

      // Create reset URL
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password: \n\n ${resetUrl}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4a90e2; text-align: center;">Password Reset Request</h2>
          <p>You requested a password reset for your EduCloud account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4a90e2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">EduCloud Admin Team</p>
        </div>
      `;

      const emailRes = await sendEmail(user.email, 'Password Reset Token', message, html);

      if (emailRes.success) {
        res.status(200).json({ success: true, message: 'Email sent' });
      } else {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        
        const error = new Error('Email could not be sent');
        error.statusCode = 500;
        throw error;
      }
    } catch (error) {
      next(error);
    }
  },
];

// Reset Password - Verify token and set new password
export const resetPassword = [
  validate('resetPassword'),
  async (req, res, next) => {
    try {
      // Get hashed token
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        const error = new Error('Invalid or expired reset token');
        error.statusCode = 400;
        throw error;
      }

      // Set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  },
];
