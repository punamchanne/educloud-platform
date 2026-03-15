import Meeting from '../models/Meeting.js';
import { logger } from '../utils/logger.js';
import { sanitizeInput, isValidObjectId } from '../utils/validators.js';
import mongoose from 'mongoose';

// Create new meeting
export const createMeeting = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    // Validate user ID
    if (!isValidObjectId(req.user.id)) {
      const error = new Error('Invalid user ID');
      error.statusCode = 400;
      throw error;
    }

    const {
      title,
      description,
      date,
      time,
      duration,
      type,
      participants,
      location,
      meetingLink,
      meetingUrl,
      isPublic,
      maxParticipants,
      requiresApproval
    } = req.body;

    logger.info('Received meeting data:', { title, date, time, duration, type, participants });

    // Validate required fields
    if (!title || !date || !time || !duration || !type) {
      logger.error('Missing required fields', { title, date, time, duration, type });
      const error = new Error('Missing required fields');
      error.statusCode = 400;
      throw error;
    }

    const sanitized = {
      title: sanitizeInput(title),
      description: sanitizeInput(description || ''),
      date: new Date(date),
      time: sanitizeInput(time),
      duration: parseInt(duration),
      type: sanitizeInput(type),
      participants: participants || [],
      location: sanitizeInput(location || ''),
      meetingLink: sanitizeInput(meetingLink || meetingUrl || ''),
      isPublic: Boolean(isPublic),
      maxParticipants: parseInt(maxParticipants) || 100,
      requiresApproval: Boolean(requiresApproval)
    };

    // Handle participants flexibly
    if (Array.isArray(participants)) {
      sanitized.participants = participants;
    } else if (typeof participants === 'string' && participants.trim()) {
      sanitized.participants = participants.split(',').map(p => p.trim()).filter(p => p);
    } else {
      sanitized.participants = [];
    }

    // Validate date
    if (isNaN(sanitized.date.getTime())) {
      logger.error('Invalid date format', { originalDate: date, parsedDate: sanitized.date });
      const error = new Error('Invalid date format');
      error.statusCode = 400;
      throw error;
    }

    // Validate time format
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(sanitized.time)) {
      logger.error('Invalid time format', { time: sanitized.time });
      const error = new Error('Invalid time format. Please use HH:MM format.');
      error.statusCode = 400;
      throw error;
    }

    logger.info('Creating meeting with data:', {
      title: sanitized.title,
      scheduledDate: sanitized.date,
      scheduledTime: sanitized.time,
      organizer: req.user.id
    });

    const meeting = new Meeting({
      title: sanitized.title,
      description: sanitized.description,
      scheduledDate: sanitized.date,
      scheduledTime: sanitized.time,
      duration: sanitized.duration,
      type: sanitized.type,
      participants: sanitized.participants,
      location: sanitized.location,
      meetingLink: sanitized.meetingLink,
      meetingUrl: sanitized.meetingLink, // Use same value for both fields
      isPublic: sanitized.isPublic,
      maxParticipants: sanitized.maxParticipants,
      requiresApproval: sanitized.requiresApproval,
      organizer: new mongoose.Types.ObjectId(req.user.id) // Ensure it's cast to ObjectId
    });

    await meeting.save();

    logger.info(`Meeting created: ${meeting.title} by user: ${req.user.id}`);
    res.status(201).json({
      success: true,
      meeting: {
        id: meeting._id,
        title: meeting.title,
        description: meeting.description,
        scheduledDate: meeting.scheduledDate,
        scheduledTime: meeting.scheduledTime,
        duration: meeting.duration,
        type: meeting.type,
        status: meeting.status,
        participants: meeting.participants,
        location: meeting.location,
        meetingLink: meeting.meetingLink,
        createdAt: meeting.createdAt,
        analytics: meeting.analytics
      }
    });
  } catch (error) {
    logger.error(`Create meeting error: ${error.message}`, { 
      userId: req.user.id,
      title: req.body.title 
    });
    next(error);
  }
};

// Get all meetings for user
export const getUserMeetings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = null,
      type = null,
      search = null,
      startDate = null,
      endDate = null
    } = req.query;

    let filter = {};
    if (req.user.role === 'admin') {
      filter = {};
    } else if (req.user.role === 'student' || req.user.role === 'parent') {
      // Students and parents see public meetings OR meetings where they are participants
      // Since participants is an array of strings (names), we search by name or role matches
      filter = {
        $or: [
          { isPublic: true },
          { organizer: req.user.id },
          { participants: { $in: [req.user.username, req.user.role] } }
        ]
      };
    } else {
      // Teachers/Staff see meetings they organized
      filter = { organizer: req.user.id };
    }
    
    if (status && status !== 'all') filter.status = status;
    if (type && type !== 'all') filter.type = type;
    
    if (startDate && endDate) {
      filter.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const meetings = await Meeting.find(filter)
      .sort({ scheduledDate: -1, scheduledTime: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('organizer', 'username email');

    const total = await Meeting.countDocuments(filter);

    logger.info(`Meetings fetched for user: ${req.user.id}, count: ${meetings.length}`);
    res.json({
      success: true,
      meetings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    logger.error(`Get user meetings error: ${error.message}`, { userId: req.user.id });
    next(error);
  }
};

// Get single meeting
export const getMeeting = async (req, res, next) => {
  try {
    const meetingId = req.params.id;
    
    if (!isValidObjectId(meetingId)) {
      const error = new Error('Invalid meeting ID');
      error.statusCode = 400;
      throw error;
    }

    const meeting = await Meeting.findById(meetingId)
      .populate('organizer', 'username email');
    
    if (!meeting) {
      const error = new Error('Meeting not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user owns the meeting or is admin
    if (meeting.organizer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    logger.info(`Meeting accessed: ${meetingId} by user: ${req.user.id}`);
    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    logger.error(`Get meeting error: ${error.message}`, { 
      meetingId: req.params.id, 
      userId: req.user.id 
    });
    next(error);
  }
};

// Update meeting
export const updateMeeting = async (req, res, next) => {
  try {
    const meetingId = req.params.id;
    const updateData = req.body;
    
    if (!isValidObjectId(meetingId)) {
      const error = new Error('Invalid meeting ID');
      error.statusCode = 400;
      throw error;
    }

    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      const error = new Error('Meeting not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user owns the meeting
    if (meeting.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Sanitize and update fields
    const allowedUpdates = [
      'title', 'description', 'date', 'time', 'duration', 
      'type', 'participants', 'location', 'meetingLink', 'notes'
    ];
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'participants' && Array.isArray(updateData[field])) {
          meeting[field] = updateData[field].map(p => sanitizeInput(p));
        } else if (field === 'date') {
          meeting[field] = new Date(updateData[field]);
        } else if (field === 'duration') {
          meeting[field] = parseInt(updateData[field]);
        } else {
          meeting[field] = sanitizeInput(updateData[field]);
        }
      }
    });

    await meeting.save();

    logger.info(`Meeting updated: ${meetingId} by user: ${req.user.id}`);
    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    logger.error(`Update meeting error: ${error.message}`, { 
      meetingId: req.params.id, 
      userId: req.user.id 
    });
    next(error);
  }
};

// Delete meeting
export const deleteMeeting = async (req, res, next) => {
  try {
    const meetingId = req.params.id;
    
    if (!isValidObjectId(meetingId)) {
      const error = new Error('Invalid meeting ID');
      error.statusCode = 400;
      throw error;
    }

    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      const error = new Error('Meeting not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user owns the meeting
    if (meeting.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    await Meeting.findByIdAndDelete(meetingId);

    logger.info(`Meeting deleted: ${meetingId} by user: ${req.user.id}`);
    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete meeting error: ${error.message}`, { 
      meetingId: req.params.id, 
      userId: req.user.id 
    });
    next(error);
  }
};

// Update meeting status
export const updateMeetingStatus = async (req, res, next) => {
  try {
    const meetingId = req.params.id;
    const { status, analytics } = req.body;
    
    if (!isValidObjectId(meetingId)) {
      const error = new Error('Invalid meeting ID');
      error.statusCode = 400;
      throw error;
    }

    const meeting = await Meeting.findById(meetingId);
    
    if (!meeting) {
      const error = new Error('Meeting not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user owns the meeting
    if (meeting.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    await meeting.updateStatus(sanitizeInput(status), analytics);

    logger.info(`Meeting status updated: ${meetingId} to ${status} by user: ${req.user.id}`);
    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    logger.error(`Update meeting status error: ${error.message}`, { 
      meetingId: req.params.id, 
      userId: req.user.id 
    });
    next(error);
  }
};

// Get meeting analytics
export const getMeetingAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = userId 
      ? await Meeting.getAnalytics(userId, start, end)
      : await Meeting.aggregate([
          {
            $match: {
              scheduledDate: { $gte: start, $lte: end },
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
    
    const upcomingMeetings = userId 
      ? await Meeting.getUpcoming(userId, 5)
      : await Meeting.find({
          scheduledDate: { $gte: new Date() },
          status: { $in: ['scheduled', 'live'] }
        })
        .sort({ scheduledDate: 1, scheduledTime: 1 })
        .limit(5)
        .populate('organizer', 'username email');
    
    const matchCondition = userId 
      ? { organizer: new mongoose.Types.ObjectId(userId), scheduledDate: { $gte: start, $lte: end } }
      : { scheduledDate: { $gte: start, $lte: end } };

    const meetingsByType = await Meeting.aggregate([
      { $match: matchCondition },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const meetingsByStatus = await Meeting.aggregate([
      { $match: matchCondition },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const result = {
      summary: analytics[0] || {
        totalMeetings: 0,
        avgAttendance: 0,
        avgEngagement: 0,
        avgDuration: 0,
        totalParticipants: 0
      },
      upcomingMeetings,
      distribution: {
        byType: meetingsByType,
        byStatus: meetingsByStatus
      }
    };

    logger.info(`Meeting analytics fetched for user: ${req.user.id} (role: ${req.user.role})`);
    res.json({
      success: true,
      analytics: result
    });
  } catch (error) {
    logger.error(`Get meeting analytics error: ${error.message}`, { userId: req.user.id });
    next(error);
  }
};

// Get upcoming meetings
export const getUpcomingMeetings = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const meetings = req.user.role === 'admin' 
      ? await Meeting.find({
          scheduledDate: { $gte: new Date() },
          status: { $in: ['scheduled', 'live'] }
        })
        .sort({ scheduledDate: 1, scheduledTime: 1 })
        .limit(parseInt(limit))
        .populate('organizer', 'username email')
      : await Meeting.getUpcoming(req.user.id, parseInt(limit));

    logger.info(`Upcoming meetings fetched for user: ${req.user.id} (role: ${req.user.role})`);
    res.json({
      success: true,
      meetings
    });
  } catch (error) {
    logger.error(`Get upcoming meetings error: ${error.message}`, { userId: req.user.id });
    next(error);
  }
};