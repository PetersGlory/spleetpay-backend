const { User, Wallet, WalletTransaction, Transaction } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

module.exports = {
  // Get user wallet balance
  async getWalletBalance(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Wallet,
          as: 'wallet'
        }]
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

      // Create wallet if it doesn't exist
      let wallet = user.wallet;
      if (!wallet) {
        wallet = await Wallet.create({
            userId: req.user.id,
            balance: 0,
          currency: user.preferredCurrency || 'NGN',
          isActive: true
        });
      }

      res.json({
        success: true,
        data: {
          balance: parseFloat(wallet.balance),
          currency: wallet.currency,
          lastUpdated: wallet.updatedAt
        }
      });
    } catch (error) {
      console.error('Get wallet balance error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch wallet balance'
        }
      });
    }
  },

  // Get wallet transaction history
  async getWalletTransactions(req, res) {
    try {
    const {
        page = 1,
        limit = 20,
        type,
        startDate,
        endDate
      } = req.query;

      const whereClause = {
        userId: req.user.id
      };

      // Apply filters
      if (type) whereClause.type = type;
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await WalletTransaction.findAndCountAll({
        where: whereClause,
        include: [{
          model: Transaction,
          as: 'transaction',
          attributes: ['id', 'amount', 'currency', 'description']
        }],
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
      console.error('Get wallet transactions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch wallet transactions'
        }
      });
    }
  },

  // Withdraw funds from wallet
  async withdrawFromWallet(req, res) {
    try {
      const { amount, withdrawalMethod, bankDetails } = req.body;

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Amount must be greater than 0'
          }
        });
      }

      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Wallet,
          as: 'wallet'
        }]
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

      // Create wallet if it doesn't exist
      let wallet = user.wallet;
      if (!wallet) {
        wallet = await Wallet.create({
          userId: req.user.id,
          balance: 0,
          currency: user.preferredCurrency || 'NGN',
          isActive: true
        });
      }

      // Check if sufficient balance
      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: 'Insufficient wallet balance'
          }
        });
      }

      // Generate withdrawal reference
      const reference = `WDR_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

      // Start transaction
      const sequelize = require('../config/database');
      const t = await sequelize.transaction();

      try {
        // Update wallet balance
        const newBalance = parseFloat(wallet.balance) - parseFloat(amount);
        await wallet.update({ balance: newBalance }, { transaction: t });

        // Create wallet transaction record
        await WalletTransaction.create({
        userId: req.user.id,
          type: 'debit',
          amount: parseFloat(amount),
          currency: wallet.currency,
          description: `Withdrawal via ${withdrawalMethod}`,
          balanceAfter: newBalance,
          reference,
          metadata: {
            withdrawalMethod,
            bankDetails,
            status: 'pending'
          }
        }, { transaction: t });

        await t.commit();

        // TODO: Integrate with bank transfer service (Flutterwave, Paystack, etc.)
        // For now, we'll just mark it as pending

      res.json({
        success: true,
          data: {
            reference,
            amount: parseFloat(amount),
            currency: wallet.currency,
            newBalance,
            status: 'pending'
          },
          message: 'Withdrawal request submitted successfully'
        });
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Withdraw from wallet error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process withdrawal'
        }
      });
    }
  },

  // Credit wallet (internal method for successful payments)
  async creditWallet(userId, amount, currency, description, transactionId = null, reference = null) {
    try {
      const sequelize = require('../config/database');
      const t = await sequelize.transaction();

      try {
        // Get or create wallet
        let wallet = await Wallet.findOne({ where: { userId } });
        if (!wallet) {
          const user = await User.findByPk(userId);
          wallet = await Wallet.create({
            userId,
            balance: 0,
            currency: user.preferredCurrency || 'NGN',
            isActive: true
          }, { transaction: t });
        }

        // Update wallet balance
        const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
        await wallet.update({ balance: newBalance }, { transaction: t });

        // Create wallet transaction record
        await WalletTransaction.create({
          userId,
          transactionId,
          type: 'credit',
          amount: parseFloat(amount),
          currency,
          description,
          balanceAfter: newBalance,
          reference: reference || `CREDIT_${crypto.randomBytes(8).toString('hex').toUpperCase()}`
        }, { transaction: t });

        await t.commit();
        return { success: true, newBalance };
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Credit wallet error:', error);
      return { success: false, error };
    }
  },

  // Debit wallet (internal method)
  async debitWallet(userId, amount, currency, description, transactionId = null, reference = null) {
    try {
      const sequelize = require('../config/database');
      const t = await sequelize.transaction();

      try {
        const wallet = await Wallet.findOne({ where: { userId } });
        if (!wallet) {
          throw new Error('Wallet not found');
        }

        // Check if sufficient balance
        if (parseFloat(wallet.balance) < parseFloat(amount)) {
          throw new Error('Insufficient balance');
        }

        // Update wallet balance
        const newBalance = parseFloat(wallet.balance) - parseFloat(amount);
        await wallet.update({ balance: newBalance }, { transaction: t });

        // Create wallet transaction record
        await WalletTransaction.create({
          userId,
          transactionId,
          type: 'debit',
          amount: parseFloat(amount),
          currency,
          description,
          balanceAfter: newBalance,
          reference: reference || `DEBIT_${crypto.randomBytes(8).toString('hex').toUpperCase()}`
        }, { transaction: t });

        await t.commit();
        return { success: true, newBalance };
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Debit wallet error:', error);
      return { success: false, error };
    }
  },

  // Get wallet statistics
  async getWalletStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const whereClause = {
        userId: req.user.id
      };

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      // Get credit and debit totals
      const credits = await WalletTransaction.sum('amount', {
        where: {
          ...whereClause,
          type: 'credit'
        }
      });

      const debits = await WalletTransaction.sum('amount', {
        where: {
          ...whereClause,
          type: 'debit'
        }
      });

      // Get transaction counts
      const creditCount = await WalletTransaction.count({
        where: {
          ...whereClause,
          type: 'credit'
        }
      });

      const debitCount = await WalletTransaction.count({
        where: {
          ...whereClause,
          type: 'debit'
        }
      });

      // Get current balance
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Wallet,
          as: 'wallet'
        }]
      });

      res.json({
        success: true,
        data: {
          currentBalance: parseFloat(user.wallet?.balance || 0),
          totalCredits: parseFloat(credits || 0),
          totalDebits: parseFloat(debits || 0),
          creditTransactions: creditCount,
          debitTransactions: debitCount,
          netBalance: parseFloat((credits || 0) - (debits || 0))
        }
      });
    } catch (error) {
      console.error('Get wallet stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch wallet statistics'
        }
      });
    }
  },

  // Get all wallets (admin)
  async getAllWallets(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        userId,
        currency
      } = req.query;

      const whereClause = {};

      if (userId) whereClause.userId = userId;
      if (currency) whereClause.currency = currency;

      const offset = (page - 1) * limit;

      const { count, rows } = await Wallet.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['updatedAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          wallets: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all wallets error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch wallets'
        }
      });
    }
  },

  // Update wallet balance (admin)
  async updateWalletBalance(req, res) {
    try {
      const { userId } = req.params;
      const { balance, reason } = req.body;

      if (!balance && balance !== 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Balance is required'
          }
        });
      }

      const wallet = await Wallet.findOne({ where: { userId } });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Wallet not found'
          }
        });
      }

      const oldBalance = wallet.balance;
      await wallet.update({ balance: parseFloat(balance) });

      // Create wallet transaction record for admin update
      await WalletTransaction.create({
        userId,
        type: balance > oldBalance ? 'credit' : 'debit',
        amount: Math.abs(parseFloat(balance) - parseFloat(oldBalance)),
        currency: wallet.currency,
        description: reason || 'Admin balance adjustment',
        balanceAfter: parseFloat(balance),
        reference: `ADMIN_ADJ_${Date.now()}`
      });

      res.json({
        success: true,
        data: wallet,
        message: 'Wallet balance updated successfully'
      });
    } catch (error) {
      console.error('Update wallet balance error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update wallet balance'
        }
      });
    }
  }
};
