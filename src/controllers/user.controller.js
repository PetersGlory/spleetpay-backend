const { User, Wallet, Transaction, PaymentRequest, WalletTransaction } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  // Get the authenticated user's profile
  async getUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken'] },
        include: [
          {
            model: Wallet,
            as: 'wallet'
          }
        ]
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user profile'
        }
      });
    }
  },

  // Update the authenticated user's profile
  async updateUser(req, res) {
    try {
      const { firstName, lastName, phoneNumber, dateOfBirth, address } = req.body;
      
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Update user fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
      if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
      if (address !== undefined) user.address = address;

      await user.save();

      const updatedUser = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken'] },
        include: [
          {
            model: Wallet,
            as: 'wallet'
          }
        ]
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile'
        }
      });
    }
  },

  // Change the authenticated user's password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Current password and new password are required'
          }
        });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      const isMatch = await user.validatePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Current password is incorrect'
          }
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password'
        }
      });
    }
  },

  // Get user's transaction history
  async getUserTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        startDate,
        endDate
      } = req.query;

      const whereClause = {
        userId: req.user.id
      };

      // Apply filters
      if (status) whereClause.status = status;
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: PaymentRequest,
            as: 'paymentRequest',
            attributes: ['id', 'description', 'type']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          transactions: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get user transactions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transaction history'
        }
      });
    }
  },

  // Get user's wallet information
  async getUserWallet(req, res) {
    try {
      const wallet = await Wallet.findOne({
        where: { userId: req.user.id }
      });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Wallet not found'
          }
        });
      }

      res.json({
        success: true,
        data: wallet
      });
    } catch (error) {
      console.error('Get user wallet error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch wallet information'
        }
      });
    }
  },

  // Delete user account
  async deleteAccount(req, res) {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password is required to delete account'
          }
        });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      const isMatch = await user.validatePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Password is incorrect'
          }
        });
      }

      // Soft delete - update account status
      await user.update({ accountStatus: 'closed' });

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete account'
        }
      });
    }
  },

  // Admin methods
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        accountStatus,
        kycStatus,
        search
      } = req.query;

      const whereClause = {};

      if (accountStatus) whereClause.accountStatus = accountStatus;
      if (kycStatus) whereClause.kycStatus = kycStatus;
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          users: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users'
        }
      });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken'] },
        include: [
          {
            model: Wallet,
            as: 'wallet'
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user'
        }
      });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, phoneNumber, accountStatus, kycStatus } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Update user fields
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
      if (accountStatus !== undefined) user.accountStatus = accountStatus;
      if (kycStatus !== undefined) user.kycStatus = kycStatus;

      await user.save();

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'verificationToken'] }
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user'
        }
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Soft delete - update account status
      await user.update({ accountStatus: 'closed' });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user'
        }
      });
    }
  }
}; 