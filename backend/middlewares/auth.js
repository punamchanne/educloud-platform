import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

// Protect routes - require authentication
export const protect = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user data (id, role) to request
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Role-based middleware
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions'
      });
    }
    next();
  };
};

// Specific role middleware
export const adminOnly = restrictTo('admin');
export const teacherOnly = restrictTo('teacher');
export const parentOnly = restrictTo('parent');
export const studentOnly = restrictTo('student');

// Combined role middleware
export const teacherOrAdmin = restrictTo('teacher', 'admin');
export const parentOrAdmin = restrictTo('parent', 'admin');
export const studentOrAdmin = restrictTo('student', 'admin');
