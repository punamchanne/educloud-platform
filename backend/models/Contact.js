import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  institution: {
    type: String,
    trim: true,
    maxlength: [200, 'Institution name cannot exceed 200 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: {
      values: ['Technical Support', 'Account Issues', 'Feature Request', 'Partnership Inquiry', 'Demo Request', 'Pricing Information', 'General Inquiry'],
      message: 'Please select a valid subject'
    }
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'responded', 'closed'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters']
  },
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ subject: 1 });

// Virtual for response time
contactSchema.virtual('responseTime').get(function() {
  if (this.respondedAt && this.createdAt) {
    return Math.round((this.respondedAt - this.createdAt) / (1000 * 60 * 60)); // hours
  }
  return null;
});

// Pre-save middleware to set priority based on subject
contactSchema.pre('save', function(next) {
  if (this.isNew) {
    switch (this.subject) {
      case 'Technical Support':
        this.priority = 'high';
        break;
      case 'Account Issues':
        this.priority = 'urgent';
        break;
      case 'Partnership Inquiry':
        this.priority = 'high';
        break;
      default:
        this.priority = 'medium';
    }
  }
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;