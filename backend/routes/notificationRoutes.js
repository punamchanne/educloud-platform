import express from 'express';
import { createNotification, getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

// Create notification (admin/staff)
router.post('/', protect, restrictTo('admin', 'staff'), createNotification);

// Get user notifications (with unread count for profile)
router.get('/', protect, getNotifications);

// Mark notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', protect, markAllAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

export default router;
