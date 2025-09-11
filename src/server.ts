import app from './app.js';
import config from './config/index.js';
import logger from './config/logger.js';

const { port } = config;

const server = app.listen(port, () => {
  logger.info(`🚀 Server running on port ${port}`);
  logger.info(`📚 API Documentation: http://localhost:${port}/api/v1/docs`);
  logger.info(`🏥 Health Check: http://localhost:${port}/api/v1/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default server;