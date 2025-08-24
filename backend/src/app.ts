import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import pino from 'express-pino-logger';

import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { router } from './router';
import { logger } from './utils/logger';

const app = express();

// Disable ETag responses for API to avoid 304 Not Modified responses which return no body
app.set('etag', false);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://skillbridge.pro', 'https://app.skillbridge.pro']
    : 'http://localhost:5000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(pino({
  autoLogging: true,
}));

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ensure API responses are not cached by the browser to avoid 304 responses for dynamic data
app.use(`/api/${env.API_VERSION}`, (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    },
  });
});

// API routes
app.use(`/api/${env.API_VERSION}`, router);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler
app.use(errorHandler);

export { app };
