const jwt = require('jsonwebtoken');
const { User, AdminUser } = require('../models');

// User authentication middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid authorization format. Please provide a Bearer token'
        }
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { id: decoded.id } });

      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'User not found'
          }
        });
      }

      if (user.accountStatus === 'suspended') {
        return res.status(403).json({ 
          success: false,
          error: {
            code: 'ACCOUNT_SUSPENDED',
            message: 'Account has been suspended'
          }
        });
      }

      req.token = token;
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid token format'
          }
        });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired'
          }
        });
      } else {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Token validation failed'
          }
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid authorization format. Please provide a Bearer token'
        }
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const adminUser = await AdminUser.findOne({ where: { id: decoded.id } });

      if (!adminUser) {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Admin user not found'
          }
        });
      }

      if (adminUser.status === 'inactive') {
        return res.status(403).json({ 
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Admin account is inactive'
          }
        });
      }

      req.token = token;
      req.adminUser = adminUser;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid token format'
          }
        });
      } else if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired'
          }
        });
      } else {
        return res.status(401).json({ 
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Token validation failed'
          }
        });
      }
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    if (!roles.includes(req.adminUser.role)) {
      return res.status(403).json({ 
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Insufficient permissions'
        }
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }

    if (!req.adminUser.permissions.includes(permission)) {
      return res.status(403).json({ 
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: `Permission '${permission}' required`
        }
      });
    }

    next();
  };
};

module.exports = {
  auth,
  adminAuth,
  requireRole,
  requirePermission
};