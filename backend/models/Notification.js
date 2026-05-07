import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, default: 'Notification' },
  type: { type: String, enum: ['exam', 'timetable', 'announcement', 'grade', 'fee_due', 'result_announced', 'timetable_update', 'general', 'urgent', 'notice', 'attendance_alert', 'behavior_report'], default: 'general' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  isScrolling: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

// Static method to count unread for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ userId, read: false });
};

export default mongoose.model('Notification', notificationSchema);
