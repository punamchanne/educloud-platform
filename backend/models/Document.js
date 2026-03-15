import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  type: { 
    type: String, 
    required: true,
    enum: ['lesson_plan', 'assignment', 'study_guide', 'quiz', 'worksheet', 'assessment']
  },
  
  subject: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  gradeLevel: { 
    type: String, 
    required: true 
  },
  
  topic: { 
    type: String, 
    required: true,
    trim: true 
  },
  
  content: { 
    type: String, 
    required: true 
  },
  
  duration: { 
    type: Number, // in minutes
    required: true 
  },
  
  requirements: { 
    type: String,
    default: '' 
  },
  
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  status: {
    type: String,
    enum: ['draft', 'completed', 'archived'],
    default: 'completed'
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  metadata: {
    wordCount: { type: Number, default: 0 },
    pageCount: { type: Number, default: 1 },
    difficulty: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    estimatedReadingTime: { type: Number, default: 0 } // in minutes
  },
  
  usage: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
documentSchema.index({ generatedBy: 1, type: 1 });
documentSchema.index({ subject: 1, gradeLevel: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ status: 1 });

// Pre-save middleware to update timestamps and calculate metadata
documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate word count
  if (this.content) {
    this.metadata.wordCount = this.content.split(/\s+/).length;
    // Estimate reading time (average 200 words per minute)
    this.metadata.estimatedReadingTime = Math.ceil(this.metadata.wordCount / 200);
  }
  
  next();
});

// Method to increment usage statistics
documentSchema.methods.incrementUsage = function(type) {
  if (type in this.usage) {
    this.usage[type]++;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get documents by user
documentSchema.statics.getByUser = function(userId, options = {}) {
  const {
    type = null,
    subject = null,
    status = 'completed',
    limit = 10,
    page = 1
  } = options;

  const filter = { generatedBy: userId };
  if (type) filter.type = type;
  if (subject) filter.subject = subject;
  if (status) filter.status = status;

  return this.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .populate('generatedBy', 'username email');
};

// Static method to get popular documents
documentSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'completed' })
    .sort({ 'usage.views': -1, 'usage.downloads': -1 })
    .limit(limit)
    .populate('generatedBy', 'username');
};

export default mongoose.model('Document', documentSchema);