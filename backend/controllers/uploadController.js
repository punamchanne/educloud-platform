import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { logger } from '../utils/logger.js';
import upload from '../middlewares/upload.js';

// Upload image/video (e.g., for exam questions, profile pics)
export const uploadMedia = [
  upload.single('media'), // Multer middleware
  async (req, res, next) => {
    try {
      if (!req.file) {
        const error = new Error('No file uploaded');
        error.statusCode = 400;
        throw error;
      }

      const { url, publicId } = await uploadToCloudinary(req.file.path);
      logger.info(`Media uploaded: ${publicId}`);
      res.json({ success: true, url, publicId });
    } catch (error) {
      logger.error(`Upload media error: ${error.message}`);
      next(error);
    }
  },
];

// Delete media (admin or owner)
export const deleteMedia = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      const error = new Error('Public ID required');
      error.statusCode = 400;
      throw error;
    }

    await deleteFromCloudinary(publicId, req.body.resourceType || 'image');
    logger.info(`Media deleted: ${publicId}`);
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    logger.error(`Delete media error: ${error.message}`, { publicId: req.body.publicId });
    next(error);
  }
};
