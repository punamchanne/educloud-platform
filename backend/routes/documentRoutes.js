import express from 'express';
import {
  generateDocument,
  getUserDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats,
  downloadDocument
} from '../controllers/documentController.js';
import { protect } from '../middlewares/auth.js';
import { validateDocument } from '../middlewares/validation.js';

const router = express.Router();

// All document routes require authentication
router.use(protect);

// Generate new document
router.post('/generate', validateDocument, generateDocument);

// Get user's documents with filtering and pagination
router.get('/', getUserDocuments);

// Get document statistics
router.get('/stats', getDocumentStats);

// Get specific document
router.get('/:id', getDocument);

// Update document
router.put('/:id', updateDocument);

// Delete document
router.delete('/:id', deleteDocument);

// Download document (increment counter)
router.post('/:id/download', downloadDocument);

export default router;