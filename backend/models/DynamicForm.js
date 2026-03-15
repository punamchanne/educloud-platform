import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Unique field identifier
  type: { 
    type: String, 
    enum: ["text", "email", "number", "textarea", "radio", "checkbox", "select", "date", "tel"],
    required: true 
  },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  options: [{ // For radio, checkbox, select
    value: { type: String },
    label: { type: String }
  }],
  validation: {
    minLength: { type: Number },
    maxLength: { type: Number },
    min: { type: Number }, // For number/date fields
    max: { type: Number },
    pattern: { type: String } // Regex pattern
  }
});

const dynamicFormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  uniqueFormId:{type:String,unique:true,required:true},
  fields: [fieldSchema],
  isActive: { type: Boolean, default: true },
  allowMultipleSubmissions: { type: Boolean, default: false },
  submissionCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
dynamicFormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("DynamicForm", dynamicFormSchema);