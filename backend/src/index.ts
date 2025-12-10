import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import config from './config';
import logger from './config/logger';
import { initializeDatabases } from './config/database';
import { errorHandler, notFound } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimit.middleware';
import setupSocketHandlers from './socket/handlers';

const app: Application = express();
const httpServer = createServer(app);

// Trust proxy - required when running behind Nginx
// Trust only the first proxy (Nginx on localhost)
app.set('trust proxy', 1);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: config.cors,
});

// Middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use(`${config.apiPrefix}/auth`, require('./routes/auth.routes').default);
app.use(`${config.apiPrefix}/projects`, require('./routes/project.routes').default);
app.use(`${config.apiPrefix}/influencer`, require('./routes/influencer.routes').default);
app.use(`${config.apiPrefix}/business`, require('./routes/business.routes').default);
app.use(`${config.apiPrefix}/tasks`, require('./routes/task.routes').default);
app.use(`${config.apiPrefix}/chat`, require('./routes/chat.routes').default);
app.use(`${config.apiPrefix}/payment`, require('./routes/payment.routes').default);
app.use(`${config.apiPrefix}/admin`, require('./routes/admin.routes').default);
app.use(`${config.apiPrefix}/cms`, require('./routes/cms.routes').default);
app.use(`${config.apiPrefix}/upload`, require('./routes/upload.routes').default);
app.use(`${config.apiPrefix}/offers`, require('./routes/offer.routes').default);

// Safira Integration Routes
app.use(`${config.apiPrefix}/webhooks`, require('./routes/safira-webhook.routes').default);
app.use(`${config.apiPrefix}`, require('./routes/safira-api.routes').default);

// Socket.IO connection handling
setupSocketHandlers(io);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize databases
    await initializeDatabases();

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Start listening
    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`API available at ${config.apiPrefix}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();

export { app, io };
