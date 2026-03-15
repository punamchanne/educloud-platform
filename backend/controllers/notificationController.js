import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import { isValidObjectId, sanitizeInput } from '../utils/validators.js';

// Create notification (admin/staff)
export const createNotification = async (req, res, next) => {
  let userId;
  try {
    const { userId: reqUserId, type, message, priority, title } = req.body;
    userId = reqUserId;
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

    const notification = new Notification({
      userId,
      createdBy: req.user.id, // Track who created the notification
      title: sanitizeInput(title) || 'Notification',
      type: sanitizeInput(type),
      message: sanitizeInput(message),
      priority: sanitizeInput(priority) || 'medium',
    });
    await notification.save();

    // Update user's totalNotifications
    user.totalNotifications = await Notification.getUnreadCount(userId);
    await user.save();

    logger.info(`Notification created for user: ${userId}`);
    res.status(201).json({ success: true, notification });
  } catch (error) {
    logger.error(`Create notification error: ${error.message}`, { userId });
    next(error);
  }
};

// Get user notifications (for profile page)
export const getNotifications = async (req, res, next) => {
  let userId;
  try {
    userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

        const notifications = await Notification.find({ userId })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({ userId });
    const unreadCount = await Notification.getUnreadCount(userId);

    logger.info(`Notifications fetched for user: ${userId}`);
    res.json({
      success: true,
      notifications,
      total,
      unreadCount,
    });
  } catch (error) {
    logger.error(`Fetch notifications error: ${error.message}`, { userId: req.user.id });
    next(error);
  }
};

// Mark notification as read
export const markAsRead = async (req, res, next) => {
  let notificationId;
  try {
    notificationId = req.params.id;
    if (!isValidObjectId(notificationId)) {
      const error = new Error('Invalid notification ID');
      error.statusCode = 400;
      throw error;
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    notification.read = true;
    await notification.save();

    // Update user's unread count
    const user = await User.findById(req.user.id);
    user.totalNotifications = await Notification.getUnreadCount(req.user.id);
    await user.save();

    logger.info(`Notification marked as read: ${notificationId}`);
    res.json({ success: true, notification });
  } catch (error) {
    logger.error(`Mark notification read error: ${error.message}`, { notificationId });
    next(error);
  }
};

// Mark all notifications as read for current user
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    // Update user's unread count
    const user = await User.findById(userId);
    user.totalNotifications = 0; // All marked as read
    await user.save();

    logger.info(`All notifications marked as read for user: ${userId}`);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    logger.error(`Mark all notifications read error: ${error.message}`, { userId: req.user.id });
    next(error);
  }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
  let notificationId;
  try {
    notificationId = req.params.id;
    if (!isValidObjectId(notificationId)) {
      const error = new Error('Invalid notification ID');
      error.statusCode = 400;
      throw error;
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    if (notification.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    await Notification.findByIdAndDelete(notificationId);

    // Update user's unread count
    const user = await User.findById(req.user.id);
    user.totalNotifications = await Notification.getUnreadCount(req.user.id);
    await user.save();

    logger.info(`Notification deleted: ${notificationId}`);
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error(`Delete notification error: ${error.message}`, { notificationId });
    next(error);
  }
};
