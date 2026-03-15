import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DynamicForm', 
    required: true 
  },
  submittedBy: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  responses: [{
    fieldId: { type: String, required: true },
    fieldLabel: { type: String, required: true },
    fieldType: { type: String, required: true },
    value: mongoose.Schema.Types.Mixed // Can be string, number, array, etc.
  }],
  submittedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
});

// Index for efficient queries
formSubmissionSchema.index({ formId: 1, submittedAt: -1 });
formSubmissionSchema.index({ 'submittedBy.email': 1 });

export default mongoose.model('FormSubmission', formSubmissionSchema);