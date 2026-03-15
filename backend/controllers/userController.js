import User from '../models/User.js';
import Student from '../models/Student.js';
import { logger } from '../utils/logger.js';
import { sanitizeInput, isValidObjectId } from '../utils/validators.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import upload from '../middlewares/upload.js';
import validate from '../middlewares/validation.js';

// Get all users (admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    logger.error(`Fetch users error: ${error.message}`);
    next(error);
  }
};

// Create user (admin only)
export const createUser = [
  validate('register'),
  async (req, res, next) => {
    try {
      const { username, email, password, role } = req.body;
      const sanitized = {
        username: sanitizeInput(username),
        email: sanitizeInput(email),
        role: sanitizeInput(role),
      };

      const existingUser = await User.findOne({ $or: [{ email: sanitized.email }, { username: sanitized.username }] });
      if (existingUser) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        throw error;
      }

      const user = new User({
        ...sanitized,
        password,
      });
      await user.save();

      // If student, create student record
      if (role === 'student') {
        const student = new Student({
          userId: user._id,
          studentId: `STU-${Date.now()}`,
        });
        await student.save();
      }

      logger.info(`User created by admin: ${sanitized.email}`);
      res.status(201).json({ success: true, user });
    } catch (error) {
      logger.error(`Create user error: ${error.message}`, { email: req.body.email });
      next(error);
    }
  },
];

// Update user profile (with Cloudinary image upload)
export const updateProfile = [
  upload.single('profilePic'), // Multer middleware for file upload
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { fullName, phone, address } = req.body;

      if (!isValidObjectId(userId)) {
        const error = new Error('Invalid user ID');
        error.statusCode = 400;
        throw error;
      }

      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Update profile fields
      user.profile = {
        fullName: sanitizeInput(fullName) || user.profile.fullName,
        phone: sanitizeInput(phone) || user.profile.phone,
        address: sanitizeInput(address) || user.profile.address,
      };

      // Handle profile picture upload
      if (req.file) {
        const { url } = await uploadToCloudinary(req.file.path);
        user.profile.profilePic = url;
      }

      await user.save();
      logger.info(`Profile updated: ${user.email}`);
      res.json({ success: true, user });
    } catch (error) {
      logger.error(`Update profile error: ${error.message}`, { userId });
      next(error);
    }
  },
];

// Delete user (admin only)
export const deleteUser = async (req, res, next) => {
  let userId;
  try {
    userId = req.params.id;
    if (!isValidObjectId(userId)) {
      const error = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Prevent deleting self
    if (userId === req.user.id) {
      const error = new Error('Cannot delete own account');
      error.statusCode = 403;
      throw error;
    }

    await user.deleteOne();
    if (user.role === 'student') {
      await Student.deleteOne({ userId });
    }

    logger.info(`User deleted: ${user.email}`);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`, { userId });
    next(error);
  }
};

// Update user role (admin only)
export const updateUserRole = async (req, res, next) => {
  let userId;
  try {
    userId = req.params.id;
    const { role } = req.body;

    if (!isValidObjectId(userId)) {
      const error = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    // Validate role
    const validRoles = ['admin', 'teacher', 'parent', 'student'];
    if (!validRoles.includes(role)) {
      const error = new Error('Invalid role specified');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Prevent changing own role
    if (userId === req.user.id) {
      const error = new Error('Cannot change your own role');
      error.statusCode = 403;
      throw error;
    }

    const oldRole = user.role;
    user.role = sanitizeInput(role);

    // Handle role-specific record creation/deletion
    if (oldRole === 'student' && role !== 'student') {
      // Remove student record if changing from student to other role
      await Student.deleteOne({ user: userId });
    } else if (oldRole !== 'student' && role === 'student') {
      // Create student record if changing to student role
      const student = new Student({
        user: user._id,
        studentId: `STU-${Date.now()}`,
      });
      await student.save();
    }

    await user.save();

    logger.info(`User role updated: ${user.email} from ${oldRole} to ${role}`);
    res.json({
      success: true,
      user,
      message: `User role updated from ${oldRole} to ${role}`
    });
  } catch (error) {
    logger.error(`Update user role error: ${error.message}`, { userId });
    next(error);
  }
};

// Bulk update user roles (admin only)
export const bulkUpdateUserRoles = async (req, res, next) => {
  try {
    const { userIds, role } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      const error = new Error('User IDs array is required');
      error.statusCode = 400;
      throw error;
    }

    // Validate role
    const validRoles = ['admin', 'teacher', 'parent', 'student'];
    if (!validRoles.includes(role)) {
      const error = new Error('Invalid role specified');
      error.statusCode = 400;
      throw error;
    }

    // Validate all user IDs
    for (const userId of userIds) {
      if (!isValidObjectId(userId)) {
        const error = new Error(`Invalid user ID: ${userId}`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Prevent changing own role in bulk operations
    if (userIds.includes(req.user.id)) {
      const error = new Error('Cannot change your own role');
      error.statusCode = 403;
      throw error;
    }

    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      const error = new Error('Some users not found');
      error.statusCode = 404;
      throw error;
    }

    const updatePromises = users.map(async (user) => {
      const oldRole = user.role;
      user.role = sanitizeInput(role);

      // Handle role-specific record creation/deletion
      if (oldRole === 'student' && role !== 'student') {
        await Student.deleteOne({ user: user._id });
      } else if (oldRole !== 'student' && role === 'student') {
        const student = new Student({
          user: user._id,
          studentId: `STU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        });
        await student.save();
      }

      await user.save();
      return { user: user.email, oldRole, newRole: role };
    });

    const results = await Promise.all(updatePromises);

    logger.info(`Bulk role update completed: ${results.length} users updated to ${role}`);
    res.json({
      success: true,
      message: `Successfully updated ${results.length} users to ${role} role`,
      results
    });
  } catch (error) {
    logger.error(`Bulk update user roles error: ${error.message}`);
    next(error);
  }
};
