import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { JWTPayload, UserRole } from '../types/index.js';
import { ApiResponse } from '../utils/response.js';

interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Admin Authentication Middleware
export const authenticateAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return ApiResponse.authenticationError(res, 'Access token required');
  }

  jwt.verify(token, config.jwtSecret, (err: any, user: any) => {
    if (err) {
      return ApiResponse.authenticationError(res, 'Invalid or expired token');
    }
    
    // Check if user is an admin
    if (!user.role || !Object.values(UserRole).includes(user.role)) {
      return ApiResponse.authorizationError(res, 'Admin access required');
    }
    
    req.user = user as JWTPayload;
    next();
  });
};

// Merchant Authentication Middleware
export const authenticateMerchant = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return ApiResponse.authenticationError(res, 'Access token required');
  }

  jwt.verify(token, config.jwtSecret, (err: any, user: any) => {
    if (err) {
      return ApiResponse.authenticationError(res, 'Invalid or expired token');
    }
    
    req.user = user as JWTPayload;
    next();
  });
};

// General Authentication Middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return ApiResponse.authenticationError(res, 'Access token required');
  }

  jwt.verify(token, config.jwtSecret, (err: any, user: any) => {
    if (err) {
      return ApiResponse.authenticationError(res, 'Invalid or expired token');
    }
    
    req.user = user as JWTPayload;
    next();
  });
};

// Role-based Authorization Middleware
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.authenticationError(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.authorizationError(res, 'Insufficient permissions');
    }

    next();
  };
};

// Permission-based Authorization Middleware
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.authenticationError(res, 'Authentication required');
    }

    if (!req.user.permissions.includes(permission)) {
      return ApiResponse.authorizationError(res, `Permission '${permission}' required`);
    }

    next();
  };
};

// API Key Authentication for Merchant APIs
export const authenticateApiKey = (req: AuthRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return ApiResponse.authenticationError(res, 'API key required');
  }

  // TODO: Implement API key validation logic
  // This would typically involve checking the API key against the database
  // and setting the merchant context in the request
  
  next();
};