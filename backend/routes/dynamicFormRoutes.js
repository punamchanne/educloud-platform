import express from 'express';
import {
  createForm,
  getAllForms,
  getActiveForms,
  getFormById,
  getFormByUniqueId,
  submitForm,
  getFormSubmissions,
  updateForm,
  deleteForm
} from '../controllers/dynamicFormController.js';
import { protect, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveForms);
router.get('/form/:id', getFormById);
router.get('/form/unique/:id', getFormByUniqueId);
router.post('/submit/:formId', submitForm);

// Protected routes (require authentication)
router.use(protect);

// Admin/Teacher routes (require admin authorization)
router.post('/create', restrictTo('admin', 'teacher'), createForm);
router.get('/all', restrictTo('admin', 'teacher'), getAllForms);
router.get('/submissions/:formId', restrictTo('admin', 'teacher'), getFormSubmissions);
router.put('/update/:id', restrictTo('admin', 'teacher'), updateForm);
router.delete('/delete/:id', restrictTo('admin', 'teacher'), deleteForm);

export default router;