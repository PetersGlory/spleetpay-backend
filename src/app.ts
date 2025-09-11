import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import expressWinston from 'express-winston';

import config from './config/index.js';
import logger from './config/logger.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.js';
import { ApiResponse } from './utils/response.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Request logging
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: false,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false
}));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  ApiResponse.success(res, { status: 'OK', timestamp: new Date().toISOString() }, 'Service is healthy');
});

// API routes
app.use('/api/v1', routes);

// Admin API routes
app.use('/api/v1/admin', routes);

// Handle 404
app.use('*', (req, res) => {
  ApiResponse.notFound(res, 'Route not found');
});

// Error handling middleware
app.use(errorHandler);

export default app;