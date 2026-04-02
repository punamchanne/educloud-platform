import User from '../models/User.js';
import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { sanitizeInput, isValidObjectId } from '../utils/validators.js';
import validate from '../middlewares/validation.js';
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

      // Handle Parent-Student linking during registration
      if (sanitized.role === 'parent' && req.body.childEmail) {
        // Find the user with that email
        const studentUser = await User.findOne({ email: req.body.childEmail, role: 'student' });
        
        if (!studentUser) {
          logger.warn(`Student with email ${req.body.childEmail} not found for parent registration`);
        } else {
          // Find the student profile for this user
          const studentProfile = await Student.findOne({ user: studentUser._id });
          
          if (!studentProfile) {
            logger.warn(`Student profile not found for user ${req.body.childEmail}`);
          } else {
            const parent = new Parent({
              user: user._id,
              children: [{
                studentId: studentProfile._id,
                relationship: 'other'
              }],
              status: 'active'
            });
            await parent.save();
            logger.info(`Parent record created and linked to student user: ${req.body.childEmail}`);
          }
        }
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
