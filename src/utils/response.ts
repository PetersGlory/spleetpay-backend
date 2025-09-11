import { Response } from 'express';
import { ApiResponse as ApiResponseType, ErrorResponse, PaginatedResponse } from '../types/index.js';

export class ApiResponse {
  static success<T>(res: Response, data?: T, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    } as ApiResponseType<T>);
  }

  static error(res: Response, message: string = 'Error', statusCode: number = 500, error?: string) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
      timestamp: new Date().toISOString()
    } as ApiResponseType);
  }

  static validationError(res: Response, message: string = 'Validation Error', details?: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details
      },
      timestamp: new Date().toISOString(),
      path: res.req.path
    } as ErrorResponse);
  }

  static authenticationError(res: Response, message: string = 'Authentication failed') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message
      },
      timestamp: new Date().toISOString(),
      path: res.req.path
    } as ErrorResponse);
  }

  static authorizationError(res: Response, message: string = 'Insufficient permissions') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message
      },
      timestamp: new Date().toISOString(),
      path: res.req.path
    } as ErrorResponse);
  }

  static notFound(res: Response, message: string = 'Resource not found') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message
      },
      timestamp: new Date().toISOString(),
      path: res.req.path
    } as ErrorResponse);
  }

  static conflict(res: Response, message: string = 'Resource already exists') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message
      },
      timestamp: new Date().toISOString(),
      path: res.req.path
    } as ErrorResponse);
  }

  static rateLimitError(res: Response, message: string = 'Too many requests') {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message
      },
      timestamp: new Date().toISOString(),
      path: res.req.path
    } as ErrorResponse);
  }

  static paymentGatewayError(res: Response, message: string = 'Payment gateway error') {
    return res.status(502).json({
      success: false,
      error: {
        code: 'PAYMENT_GATEWAY_ERROR',
        message
      },
      timestamp: new Date().toISOString(),
      path: res.req.path
    } as ErrorResponse);
  }

  static internalError(res: Response, message: string = 'Internal server error') {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message
      },
      timestamp: new Date().toISOString(),
      path: res.req.path
    } as ErrorResponse);
  }

  static paginated<T>(res: Response, data: T[], pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }, message: string = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data: {
        data,
        pagination
      },
      timestamp: new Date().toISOString()
    } as ApiResponseType<PaginatedResponse<T>>);
  }
}