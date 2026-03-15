import Document from '../models/Document.js';
import { generateEducationalDocument } from '../services/geminiService.js';
import { logger } from '../utils/logger.js';
import { sanitizeInput, isValidObjectId } from '../utils/validators.js';
import mongoose from 'mongoose';

// Generate and save document
export const generateDocument = async (req, res, next) => {
  try {
    const { type, subject, topic, gradeLevel, duration, requirements } = req.body;
    
    const sanitized = {
      type: sanitizeInput(type),
      subject: sanitizeInput(subject),
      topic: sanitizeInput(topic),
      gradeLevel: sanitizeInput(gradeLevel),
      requirements: sanitizeInput(requirements || '')
    };

    // Generate document content using AI
    const generatedContent = await generateEducationalDocument(sanitized.type, {
      subject: sanitized.subject,
      topic: sanitized.topic,
      gradeLevel: sanitized.gradeLevel,
      duration: parseInt(duration),
      requirements: sanitized.requirements
    });

    // Create document in database
    const document = new Document({
      title: generatedContent.title || `${sanitized.subject}: ${sanitized.topic}`,
      type: sanitized.type,
      subject: sanitized.subject,
      topic: sanitized.topic,
      gradeLevel: sanitized.gradeLevel,
      content: generatedContent.content || generatedContent,
      duration: parseInt(duration),
      requirements: sanitized.requirements,
      generatedBy: req.user.id
    });

    await document.save();

    logger.info(`Document generated and saved: ${document.title} by user: ${req.user.id}`);
    res.status(201).json({
      success: true,
      document: {
        id: document._id,
        title: document.title,
        type: document.type,
        subject: document.subject,
        topic: document.topic,
        gradeLevel: document.gradeLevel,
        content: document.content,
        duration: document.duration,
        createdAt: document.createdAt,
        status: document.status
      }
    });
  } catch (error) {
    logger.error(`Generate document error: ${error.message}`, { 
      userId: req.user.id, 
      type: req.body.type 
    });
    next(error);
  }
};

// Get all documents for current user
export const getUserDocuments = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type = null, 
      subject = null,
      search = null
    } = req.query;

    let filter = {};
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      filter = { generatedBy: req.user.id };
    } else {
      filter = { status: 'completed' }; // Show completed docs to students/parents
    }
    
    if (type && type !== 'all') filter.type = type;
    if (subject && subject !== 'all') filter.subject = subject;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-content') // Exclude content for list view
      .populate('generatedBy', 'username');

    const total = await Document.countDocuments(filter);

    logger.info(`Documents fetched for user: ${req.user.id}, count: ${documents.length}`);
    res.json({
      success: true,
      documents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    logger.error(`Get user documents error: ${error.message}`, { userId: req.user.id });
    next(error);
  }
};

// Get single document
export const getDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    
    if (!isValidObjectId(documentId)) {
      const error = new Error('Invalid document ID');
      error.statusCode = 400;
      throw error;
    }

    const document = await Document.findById(documentId)
      .populate('generatedBy', 'username email');
    
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user owns the document or is admin, or can view completed docs
    if (document.generatedBy._id.toString() !== req.user.id && req.user.role !== 'admin' && !(document.status === 'completed' && (req.user.role === 'student' || req.user.role === 'parent'))) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Increment view count
    await document.incrementUsage('views');

    logger.info(`Document accessed: ${documentId} by user: ${req.user.id}`);
    res.json({
      success: true,
      document
    });
  } catch (error) {
    logger.error(`Get document error: ${error.message}`, { 
      documentId: req.params.id, 
      userId: req.user.id 
    });
    next(error);
  }
};

// Update document
export const updateDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const { title, content, tags, status } = req.body;
    
    if (!isValidObjectId(documentId)) {
      const error = new Error('Invalid document ID');
      error.statusCode = 400;
      throw error;
    }

    const document = await Document.findById(documentId);
    
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user owns the document
    if (document.generatedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Update fields
    if (title) document.title = sanitizeInput(title);
    if (content) document.content = sanitizeInput(content);
    if (tags) document.tags = tags.map(tag => sanitizeInput(tag));
    if (status) document.status = sanitizeInput(status);

    await document.save();

    logger.info(`Document updated: ${documentId} by user: ${req.user.id}`);
    res.json({
      success: true,
      document
    });
  } catch (error) {
    logger.error(`Update document error: ${error.message}`, { 
      documentId: req.params.id, 
      userId: req.user.id 
    });
    next(error);
  }
};

// Delete document
export const deleteDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    
    if (!isValidObjectId(documentId)) {
      const error = new Error('Invalid document ID');
      error.statusCode = 400;
      throw error;
    }

    const document = await Document.findById(documentId);
    
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user owns the document
    if (document.generatedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    await Document.findByIdAndDelete(documentId);

    logger.info(`Document deleted: ${documentId} by user: ${req.user.id}`);
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete document error: ${error.message}`, { 
      documentId: req.params.id, 
      userId: req.user.id 
    });
    next(error);
  }
};

// Get document statistics
export const getDocumentStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let matchStage = {};

    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      matchStage = { generatedBy: mongoose.Types.ObjectId(userId) };
    } else {
      matchStage = { status: 'completed' };
    }
    
    const stats = await Document.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalViews: { $sum: '$usage.views' },
          totalDownloads: { $sum: '$usage.downloads' }
        }
      }
    ]);

    const totalDocuments = await Document.countDocuments(matchStage);
    const recentDocuments = await Document.find(matchStage)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type subject createdAt');

    logger.info(`Document stats fetched for user: ${userId}`);
    res.json({
      success: true,
      stats: {
        total: totalDocuments,
        byType: stats,
        recent: recentDocuments
      }
    });
  } catch (error) {
    logger.error(`Get document stats error: ${error.message}`, { userId: req.user.id });
    next(error);
  }
};

// Increment download count
export const downloadDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    
    if (!isValidObjectId(documentId)) {
      const error = new Error('Invalid document ID');
      error.statusCode = 400;
      throw error;
    }

    const document = await Document.findById(documentId);
    
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }

    // Check access permissions
    if (document.generatedBy.toString() !== req.user.id && req.user.role !== 'admin' && !(document.status === 'completed' && (req.user.role === 'student' || req.user.role === 'parent'))) {
      const error = new Error('Access denied');
      error.statusCode = 403;
      throw error;
    }

    // Increment download count
    await document.incrementUsage('downloads');

    logger.info(`Document downloaded: ${documentId} by user: ${req.user.id}`);
    res.json({
      success: true,
      message: 'Download recorded',
      document: {
        title: document.title,
        content: document.content
      }
    });
  } catch (error) {
    logger.error(`Download document error: ${error.message}`, { 
      documentId: req.params.id, 
      userId: req.user.id 
    });
    next(error);
  }
};