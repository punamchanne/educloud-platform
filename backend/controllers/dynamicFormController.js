import mongoose from 'mongoose';
import DynamicForm from '../models/DynamicForm.js';
import FormSubmission from '../models/FormSubmission.js';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

// Utility function to generate a unique form ID
const generateUniqueFormId = async () => {
  let uniqueId;
  let exists = true;

  while (exists) {
    uniqueId = crypto.randomBytes(6).toString('hex'); // 12 characters
    const form = await DynamicForm.findOne({ uniqueFormId: uniqueId });
    if (!form) exists = false;
  }

  return uniqueId;
};




// Create a new dynamic form (Admin/HR only)
export const createForm = async (req, res) => {
  try {
    const { title, description, fields, allowMultipleSubmissions } = req.body;

    // Validation
    if (!title || !fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title and at least one field are required"
      });
    }

    // Validate fields
    for (let field of fields) {
      if (!field.id || !field.type || !field.label) {
        return res.status(400).json({
          success: false,
          message: "Each field must have id, type, and label"
        });
      }

      // Validate field types that require options
      if (["radio", "checkbox", "select"].includes(field.type)) {
        if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Field "${field.label}" requires options`
          });
        }
      }
    }

    // Check for duplicate field IDs
    const fieldIds = fields.map(f => f.id);
    if (new Set(fieldIds).size !== fieldIds.length) {
      return res.status(400).json({
        success: false,
        message: "Field IDs must be unique"
      });
    }

    const uniqueFormId = await generateUniqueFormId();

    // Create form

    const form = await DynamicForm.create({
      title,
      description,
      fields,
      allowMultipleSubmissions,
      createdBy: req.user._id,
      uniqueFormId
    });

    res.status(201).json({
      success: true,
      message: "Form created successfully",
      data: form
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all forms (Admin only)
export const getAllForms = async (req, res) => {
  try {
    // Only show forms created by the logged-in user
    const forms = await DynamicForm.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get active forms (Public)
export const getActiveForms = async (req, res) => {
  try {
    const forms = await DynamicForm.find({ isActive: true })
      .select('title description createdAt submissionCount')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get form by ID (Public)
export const getFormById = async (req, res) => {
  try {
    const form = await DynamicForm.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    if (!form.isActive) {
      return res.status(403).json({ success: false, message: "Form is not active" });
    }

    res.status(200).json({ success: true, data: form });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// get form by uniqueFormId (Public) or title --- IGNORE ---

export const getFormByUniqueId = async (req, res) => {
  try {
    const { id } = req.params;
    let form;
    console.log("Fetching form with id/title:", id);

    if (mongoose.Types.ObjectId.isValid(id)) {
      // Search by MongoDB _id
      form = await DynamicForm.findById(id).populate('createdBy', 'name');
    } else {
      let uniqueFormId, title;

      const lastHyphenIndex = id.lastIndexOf('-');
      if (lastHyphenIndex !== -1) {
        uniqueFormId = id.substring(lastHyphenIndex + 1);
        title = id.substring(0, lastHyphenIndex).replace(/-/g, ' ');

        // Try finding by uniqueFormId
        form = await DynamicForm.findOne({ uniqueFormId }).populate('createdBy', 'name');
        if (!form) {
          // If not found, fallback to title-only
          form = await DynamicForm.findOne({ title: id.replace(/-/g, ' ') }).populate('createdBy', 'name');
        }
      } else {
        // No hyphen found, treat entire id as title
        const titleOnly = id.replace(/-/g, ' ');
        form = await DynamicForm.findOne({ title: titleOnly }).populate('createdBy', 'name');
      }
    }

    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    if (!form.isActive) {
      return res.status(403).json({ success: false, message: "Form is not active" });
    }

    res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


// Submit form response (Public)
export const submitForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const { responses, submittedBy } = req.body;

    const form = await DynamicForm.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    if (!form.isActive) {
      return res.status(403).json({ success: false, message: "Form is not accepting responses" });
    }

    // Check if multiple submissions are allowed
    if (!form.allowMultipleSubmissions && submittedBy.email) {
      const existingSubmission = await FormSubmission.findOne({
        formId: formId,
        "submittedBy.email": submittedBy.email
      });

      if (existingSubmission) {
        return res.status(400).json({ 
          success: false, 
          message: "You have already submitted this form" 
        });
      }
    }

    // Validate required fields
    const requiredFields = form.fields.filter(field => field.required);
    for (let field of requiredFields) {
      const response = responses.find(r => r.fieldId === field.id);
      if (!response || !response.value || (Array.isArray(response.value) && response.value.length === 0)) {
        return res.status(400).json({ 
          success: false, 
          message: `Field "${field.label}" is required` 
        });
      }
    }

    // Validate response format
    const validatedResponses = [];
    for (let response of responses) {
      const field = form.fields.find(f => f.id === response.fieldId);
      if (!field) continue;

      // Basic validation based on field type
      let value = response.value;
      
      if (field.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return res.status(400).json({ 
            success: false, 
            message: `Invalid email format for field "${field.label}"` 
          });
        }
      }

      if (field.type === "number" && value) {
        if (isNaN(value)) {
          return res.status(400).json({
            success: false,
            message: `Invalid number format for field "${field.label}"`
          });
        }
        value = Number(value);
      }

      if (field.type === "checkbox" && !Array.isArray(value)) {
        value = value ? [value] : [];
      }

      validatedResponses.push({
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
        value: value
      });
    }

    // Create submission
    const submission = await FormSubmission.create({
      formId: formId,
      submittedBy: {
        name: submittedBy.name,
        email: submittedBy.email,
        userId: req.user ? req.user._id : null
      },
      responses: validatedResponses,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    // Increment submission count
    await DynamicForm.findByIdAndUpdate(formId, { $inc: { submissionCount: 1 } });

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      data: submission
    });
  } catch (error) {
    console.error('Submit form error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get form submissions (Admin only)
export const getFormSubmissions = async (req, res) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const submissions = await FormSubmission.find({ formId })
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('submittedBy.userId', 'name email');

    const total = await FormSubmission.countDocuments({ formId });

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSubmissions: total
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update form (Admin only)
export const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const form = await DynamicForm.findById(id);
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Only allow the creator or admin to update
    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized to update this form" });
    }

    const updatedForm = await DynamicForm.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({
      success: true,
      message: "Form updated successfully",
      data: updatedForm
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete form (Admin only)
export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await DynamicForm.findById(id);
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Only allow the creator or admin to delete
    if (form.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized to delete this form" });
    }

    await DynamicForm.findByIdAndDelete(id);
    await FormSubmission.deleteMany({ formId: id }); // Delete all submissions

    res.status(200).json({
      success: true,
      message: "Form and all submissions deleted successfully"
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};