import express from 'express';
import { config } from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middlewares/errorHandler.js';
import { morganMiddleware, logger } from './utils/logger.js';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import cloudinary from './config/cloudinary.js';
import { seedAdmin } from './utils/seedAdmin.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import examRoutes from './routes/examRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import chatbotTestRoutes from './routes/chatbotTestRoutes.js';
import dynamicFormRoutes from './routes/dynamicFormRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

config();
const app = express();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' } // Set X-Frame-Options to DENY
}));

app.use(morganMiddleware); // HTTP logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data for uploads

// Rate limiting (relaxed for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoose = (await import('mongoose')).default;
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check Cloudinary
    let cloudinaryStatus = 'unknown';
    try {
      await cloudinary.api.ping();
      cloudinaryStatus = 'connected';
    } catch (error) {
      cloudinaryStatus = 'disconnected';
    }

    // Check Gemini AI
    let geminiStatus = 'unknown';
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      await model.generateContent('Test');
      geminiStatus = 'connected';
    } catch (error) {
      geminiStatus = 'disconnected';
    }

    res.json({
      success: true,
      status: 'healthy',
      details: {
        server: 'running',
        database: dbStatus,
        cloudinary: cloudinaryStatus,
        gemini: geminiStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(`Health check error: ${error.message}`);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      message: 'Health check failed',
      details: { error: error.message },
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/chatbot-test', chatbotTestRoutes);
app.use('/api/forms', dynamicFormRoutes);
app.use('/api/contact', contactRoutes);

// Serve frontend static files (Vite build)
const frontendPath = path.join(__dirname, '../frontend/dist');
console.log('Frontend path:', frontendPath);
console.log('Frontend directory exists:', fs.existsSync(frontendPath));

app.use(express.static(frontendPath));

// Explicit root route
app.get('/', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  console.log('Serving root path, index.html from:', indexPath);

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Frontend build not found. Please run npm run build in the frontend directory.'
    });
  }
});

// Catch-all to serve index.html for SPA routes (only for non-API routes)
app.get(/^\/(?!api).*/, (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  console.log('Serving SPA route, index.html from:', indexPath);


  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Frontend build not found. Please run npm run build in the frontend directory.'
    });
  }
});

// 404 handler - only for truly unmatched routes
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  const mongoose = (await import('mongoose')).default;
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
