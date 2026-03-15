import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  type: {
    type: String,
    enum: ['classroom', 'parent_teacher', 'staff', 'training', 'general', 'online', 'webinar'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  participants: [{
    type: mongoose.Schema.Types.Mixed, // Allow flexible participant format
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
    // Removed URL validation to allow any meeting link format
  },
  meetingUrl: {
    type: String,
    trim: true
    // Alternative field for meeting URLs
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    min: 1,
    max: 1000,
    default: 100
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Meeting analytics
  analytics: {
    attendanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    engagementScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0
    },
    actualDuration: {
      type: Number,
      min: 0
    },
    participantCount: {
      type: Number,
      default: 0
    }
  },

  // Meeting notes and recordings
  notes: {
    type: String,
    trim: true
  },
  recordingUrl: {
    type: String,
    trim: true
  },
  
  // Recurring meeting settings
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringSettings: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    endDate: Date,
    instances: Number
  }
}, {
  timestamps: true
});

// Index for efficient querying
meetingSchema.index({ scheduledDate: 1, status: 1 });
meetingSchema.index({ organizer: 1, scheduledDate: -1 });
meetingSchema.index({ type: 1, status: 1 });

// Virtual for datetime combination
meetingSchema.virtual('datetime').get(function() {
  const [hours, minutes] = this.scheduledTime.split(':');
  const datetime = new Date(this.scheduledDate);
  datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return datetime;
});

// Static method to get upcoming meetings
meetingSchema.statics.getUpcoming = function(userId, limit = 10) {
  const now = new Date();
  return this.find({
    organizer: userId,
    scheduledDate: { $gte: now },
    status: { $in: ['scheduled', 'live'] }
  })
  .sort({ scheduledDate: 1, scheduledTime: 1 })
  .limit(limit)
  .populate('organizer', 'username email');
};

// Static method to get meeting analytics
meetingSchema.statics.getAnalytics = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        organizer: mongoose.Types.ObjectId(userId),
        scheduledDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalMeetings: { $sum: 1 },
        avgAttendance: { $avg: '$analytics.attendanceRate' },
        avgEngagement: { $avg: '$analytics.engagementScore' },
        avgDuration: { $avg: '$analytics.actualDuration' },
        totalParticipants: { $sum: '$analytics.participantCount' }
      }
    }
  ]);
};

// Method to update meeting status
meetingSchema.methods.updateStatus = function(status, analytics = {}) {
  this.status = status;
  if (analytics && Object.keys(analytics).length > 0) {
    this.analytics = { ...this.analytics.toObject(), ...analytics };
  }
  return this.save();
};

// Method to add participant
meetingSchema.methods.addParticipant = function(participant) {
  if (!this.participants.includes(participant)) {
    this.participants.push(participant);
    this.analytics.participantCount = this.participants.length;
  }
  return this.save();
};

// Method to remove participant
meetingSchema.methods.removeParticipant = function(participant) {
  this.participants = this.participants.filter(p => p !== participant);
  this.analytics.participantCount = this.participants.length;
  return this.save();
};

// Pre-save middleware to update participant count
meetingSchema.pre('save', function(next) {
  if (this.isModified('participants')) {
    this.analytics.participantCount = this.participants.length;
  }
  next();
});

export default mongoose.model('Meeting', meetingSchema);