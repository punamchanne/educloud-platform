import express from 'express';
import { uploadMedia, deleteMedia } from '../controllers/uploadController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Upload image/video (all authenticated users)
router.post('/', protect, uploadMedia);

// Delete media (admin or owner)
router.delete('/', protect, deleteMedia);

export default router;
