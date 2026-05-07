import express from 'express';
import { register, login, getProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Register a new user (open to all)
router.post('/register', register);

// Login user and return JWT
router.post('/login', login);

// Forgot password - send reset email
router.post('/forgot-password', forgotPassword);

// Reset password - verify token and update password
router.put('/reset-password/:resetToken', resetPassword);

// Get user profile (with exam history)
router.get('/profile', protect, getProfile);

export default router;
