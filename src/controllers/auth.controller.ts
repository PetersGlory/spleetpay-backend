import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/error.js';
import { UserRole } from '../types/index.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Admin Authentication Endpoints
  adminLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.validationError(res, 'Email and password are required');
    }

    const result = await this.authService.adminLogin(email, password);
    ApiResponse.success(res, result, 'Admin login successful');
  });

  // Merchant Authentication Endpoints
  merchantLogin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.validationError(res, 'Email and password are required');
    }

    const result = await this.authService.merchantLogin(email, password);
    ApiResponse.success(res, result, 'Merchant login successful');
  });

  merchantRegister = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return ApiResponse.validationError(res, 'Email, password, firstName, and lastName are required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiResponse.validationError(res, 'Invalid email format');
    }

    // Password strength validation
    if (password.length < 8) {
      return ApiResponse.validationError(res, 'Password must be at least 8 characters long');
    }

    const result = await this.authService.merchantRegister({
      email,
      password,
      firstName,
      lastName,
      phone
    });

    ApiResponse.success(res, result, 'Merchant registered successfully', 201);
  });

  // General Authentication Endpoints
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.validationError(res, 'Refresh token is required');
    }

    const result = await this.authService.refreshToken(refreshToken);
    ApiResponse.success(res, result, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return ApiResponse.authenticationError(res, 'User not authenticated');
    }

    const result = await this.authService.logout(userId);
    ApiResponse.success(res, result, 'Logged out successfully');
  });

  // Password Reset Endpoints
  requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return ApiResponse.validationError(res, 'Email is required');
    }

    const result = await this.authService.requestPasswordReset(email);
    ApiResponse.success(res, result, 'Password reset link sent to email');
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return ApiResponse.validationError(res, 'Token and new password are required');
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return ApiResponse.validationError(res, 'Password must be at least 8 characters long');
    }

    const result = await this.authService.resetPassword(token, newPassword);
    ApiResponse.success(res, result, 'Password reset successfully');
  });

  // Get current user info
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return ApiResponse.authenticationError(res, 'User not authenticated');
    }

    ApiResponse.success(res, user, 'User information retrieved');
  });

  // Admin Registration (Super Admin only)
  adminRegister = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role, permissions, department } = req.body;

    // Check if current user is super admin
    if (req.user?.role !== UserRole.SUPER_ADMIN) {
      return ApiResponse.authorizationError(res, 'Only super admin can register new admin users');
    }

    if (!email || !password || !name || !role || !permissions) {
      return ApiResponse.validationError(res, 'Email, password, name, role, and permissions are required');
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return ApiResponse.validationError(res, 'Invalid role');
    }

    // Password strength validation
    if (password.length < 8) {
      return ApiResponse.validationError(res, 'Password must be at least 8 characters long');
    }

    const result = await this.authService.adminRegister({
      email,
      password,
      name,
      role,
      permissions,
      department
    });

    ApiResponse.success(res, result, 'Admin user created successfully', 201);
  });
}