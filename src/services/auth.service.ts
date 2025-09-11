import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import redis from '../config/redis.js';
import { JWTPayload, UserRole, UserStatus } from '../types/index.js';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

export class AuthService {
  // Admin Authentication Methods
  async adminLogin(email: string, password: string) {
    const admin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!admin || admin.status !== UserStatus.ACTIVE) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    const token = this.generateToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    });

    const refreshToken = this.generateRefreshToken(admin.id);

    // Store refresh token in Redis
    await redis.setex(`refresh_token:${admin.id}`, 7 * 24 * 60 * 60, refreshToken);

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        department: admin.department,
        lastLogin: admin.lastLogin
      },
      token,
      refreshToken
    };
  }

  // Merchant Authentication Methods
  async merchantLogin(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        merchants: {
          where: {
            kycStatus: 'VERIFIED',
            onboardingStatus: 'ACTIVE'
          }
        }
      }
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: UserRole.USER, // Regular user role for merchants
      permissions: []
    });

    const refreshToken = this.generateRefreshToken(user.id);

    // Store refresh token in Redis
    await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status,
        merchants: user.merchants
      },
      token,
      refreshToken
    };
  }

  // Merchant Registration
  async merchantRegister(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        status: UserStatus.PENDING
      }
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status
    };
  }

  // Admin Registration (for super admin only)
  async adminRegister(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    permissions: string[];
    department?: string;
  }) {
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: data.email }
    });

    if (existingAdmin) {
      throw new Error('Admin user already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const admin = await prisma.adminUser.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        name: data.name,
        role: data.role,
        permissions: data.permissions,
        department: data.department,
        status: UserStatus.ACTIVE
      }
    });

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
      department: admin.department
    };
  }

  // Token Generation
  private generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: config.refreshTokenExpiresIn
    });
  }

  // Token Refresh
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as any;
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Check if it's an admin or regular user
      const admin = await prisma.adminUser.findUnique({
        where: { id: decoded.userId }
      });

      if (admin) {
        const token = this.generateToken({
          userId: admin.id,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        });

        return { token };
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (user) {
        const token = this.generateToken({
          userId: user.id,
          email: user.email,
          role: UserRole.USER,
          permissions: []
        });

        return { token };
      }

      throw new Error('User not found');
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Logout
  async logout(userId: string) {
    await redis.del(`refresh_token:${userId}`);
    return { message: 'Logged out successfully' };
  }

  // Password Reset
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    const admin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!user && !admin) {
      throw new Error('User not found');
    }

    const resetToken = jwt.sign(
      { email, type: 'password_reset' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    // Store reset token in Redis
    await redis.setex(`reset_token:${email}`, 3600, resetToken);

    // TODO: Send email with reset link
    logger.info(`Password reset requested for: ${email}`);

    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      const storedToken = await redis.get(`reset_token:${decoded.email}`);

      if (!storedToken || storedToken !== token) {
        throw new Error('Invalid reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Try to update user first
      const user = await prisma.user.findUnique({
        where: { email: decoded.email }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword }
        });
      } else {
        // Try admin user
        const admin = await prisma.adminUser.findUnique({
          where: { email: decoded.email }
        });

        if (admin) {
          await prisma.adminUser.update({
            where: { id: admin.id },
            data: { passwordHash: hashedPassword }
          });
        } else {
          throw new Error('User not found');
        }
      }

      // Remove reset token
      await redis.del(`reset_token:${decoded.email}`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  // Verify Token
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}