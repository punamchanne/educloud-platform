import express from 'express';
import { getAllUsers, createUser, updateProfile, deleteUser, updateUserRole, bulkUpdateUserRoles, getStaffUsers } from '../controllers/userController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

// Admin routes
router.get('/', protect, restrictTo('admin'), getAllUsers);
router.get('/role/staff', protect, getStaffUsers);
router.post('/', protect, restrictTo('admin'), createUser);
router.delete('/:id', protect, restrictTo('admin'), deleteUser);

// Role management routes
router.put('/:id/role', protect, restrictTo('admin'), updateUserRole);
router.put('/bulk/role', protect, restrictTo('admin'), bulkUpdateUserRoles);

// User profile update (self)
router.put('/profile', protect, updateProfile);

export default router;
