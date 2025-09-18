// Centralized error handler middleware
module.exports = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = err.statusCode || err.status || 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.errors ? err.errors.map(e => e.message).join(', ') : 'Validation failed';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    errorCode = 'CONFLICT';
    message = 'Resource already exists';
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    errorCode = 'INVALID_REFERENCE';
    message = 'Invalid reference to related resource';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'AUTHENTICATION_ERROR';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token has expired';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';
    message = 'File upload error: ' + err.message;
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    errorCode = 'FILE_TOO_LARGE';
    message = 'File size exceeds limit';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    errorCode = 'INVALID_FILE_FIELD';
    message = 'Unexpected file field';
  }

  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Add validation details for validation errors
  if (err.errors && err.name === 'SequelizeValidationError') {
    errorResponse.error.details = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
  }

  res.status(statusCode).json(errorResponse);
}; 