import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { config } from 'dotenv';

config();

const connectDB = async () => {
  let retries = 5;
  const retryDelay = 5000; // 5 seconds

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      logger.info('MongoDB connected successfully');
    } catch (error) {
      logger.error(`MongoDB connection failed: ${error.message}`);
      if (retries > 0) {
        retries--;
        logger.info(`Retrying connection (${retries} attempts left)...`);
        setTimeout(connectWithRetry, retryDelay);
      } else {
        logger.error('MongoDB connection failed after all retries');
        process.exit(1);
      }
    }
  };

  // MongoDB connection events
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
    if (retries > 0) {
      connectWithRetry();
    }
  });

  mongoose.connection.on('error', (error) => {
    logger.error(`MongoDB connection error: ${error.message}`);
  });

  await connectWithRetry();
};

export default connectDB;
