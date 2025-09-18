const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');

// Redis client for distributed rate limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Store for rate limit data (fallback if Redis is not available)
const store = new Map();

// Rate limiting configurations
const rateLimits = {
  // Authentication endpoints - stricter limits
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true
  }),

  // General API endpoints
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // File upload endpoints
  fileUpload: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 uploads per minute
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many file uploads, please try again later'
      }
    }
  }),

  // Reports and analytics endpoints
  reports: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 reports per hour
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many report requests, please try again later'
      }
    }
  }),

  // Payment processing endpoints - very strict
  payments: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 payment requests per minute
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many payment requests, please try again later'
      }
    },
    skipSuccessfulRequests: true
  })
};

// Custom rate limiter for merchant-specific limits
const merchantRateLimit = (merchantId) => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute per merchant
    keyGenerator: (req) => `merchant:${merchantId}:${req.ip}`,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Merchant rate limit exceeded, please try again later'
      }
    }
  });
};

// Custom rate limiter for admin-specific limits
const adminRateLimit = (adminRole) => {
  const limits = {
    super_admin: 200,
    admin: 150,
    moderator: 100,
    analyst: 50
  };

  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: limits[adminRole] || 50,
    keyGenerator: (req) => `admin:${req.adminUser?.id}:${req.ip}`,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Admin rate limit exceeded, please try again later'
      }
    }
  });
};

module.exports = {
  ...rateLimits,
  merchantRateLimit,
  adminRateLimit
};
