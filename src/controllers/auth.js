const { User, Wallet, AdminUser } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../services/email.service');
const { Op } = require('sequelize');

function generateToken(user, role = 'user') {
  const payload = { 
    id: user.id, 
    email: user.email,
    role: role
  };
  
  if (role === 'admin') {
    payload.permissions = user.permissions;
    payload.department = user.department;
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
  });
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' }, 
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
}

module.exports = {
  // Register a new user
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, phone, preferredCurrency } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields'
          }
        });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Email already exists'
          }
        });
      }

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = await User.create({ 
        email, 
        password, 
          firstName,
          lastName,
        phone,
        preferredCurrency: preferredCurrency || 'NGN',
        verificationToken,
        isVerified: true
      });

      // Create wallet for the user
        await Wallet.create({
          userId: user.id,
          balance: 0,
        currency: preferredCurrency || 'NGN'
      });

      // Send welcome email with verification link
      await emailService.sendWelcomeEmail({
        email: user.email,
        firstName: user.firstName,
        verificationToken
      });

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            emailVerified: user.emailVerified,
            accountStatus: user.accountStatus,
            createdAt: user.createdAt
          },
          token,
          refreshToken
        },
        message: 'User registered successfully. Please check your email to verify your account.'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Registration failed'
        }
      });
    }
  },

  // Login a user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
          }
        });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid credentials'
          }
        });
      }

      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid credentials'
          }
        });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            emailVerified: user.emailVerified,
            accountStatus: user.accountStatus,
            lastLogin: user.lastLogin
          },
          token,
          refreshToken
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Login failed'
        }
      });
    }
  },

  // Admin login
  async adminLogin(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
          }
        });
      }

      const adminUser = await AdminUser.findOne({ where: { email } });
      if (!adminUser) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid credentials'
          }
        });
      }

      const isMatch = await adminUser.validatePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid credentials'
          }
        });
      }

      // Update last login
      await adminUser.update({ lastLogin: new Date() });

      const token = generateToken(adminUser, 'admin');
      const refreshToken = generateRefreshToken(adminUser);

      res.json({
        success: true,
        data: {
          adminUser: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            permissions: adminUser.permissions,
            department: adminUser.department,
            status: adminUser.status,
            lastLogin: adminUser.lastLogin
          },
          token,
          refreshToken
        },
        message: 'Admin login successful'
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Admin login failed'
        }
      });
    }
  },

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required'
          }
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid refresh token'
          }
        });
      }

      // Find user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'User not found'
          }
        });
      }

      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid refresh token'
        }
      });
    }
  },

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      
      const user = await User.findOne({ where: { verificationToken: token } });
      if (!user) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired verification token'
          }
        });
      }

      await user.update({ 
        emailVerified: true,
        verificationToken: null
      });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Email verification failed'
        }
      });
    }
  },

  // Verify email with OTP
  async verifyEmail(req, res) {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and OTP are required'
          }
        });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // TODO: Implement proper OTP verification logic
      // For now, we'll just verify the email
      await user.update({ 
        isVerified: true,
        verificationToken: null
      });

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify email'
        }
      });
    }
  },

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required'
          }
        });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
      });

      // Send reset password email
      await emailService.sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName,
        resetToken
      });

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process password reset request'
        }
      });
    }
  },

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token and new password are required'
          }
        });
      }
  
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: new Date() }
        }
      });
  
      if (!user) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired reset token'
          }
        });
      }

      await user.update({
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Password reset failed'
        }
      });
    }
  },

  // Logout
  async logout(req, res) {
    try {
      // In a more sophisticated implementation, you might want to blacklist the token
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Logout failed'
        }
      });
    }
  }
}; 