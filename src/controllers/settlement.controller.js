const { Settlement, Merchant, Transaction, PaymentRequest, User } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

module.exports = {
  // Get merchant settlement statistics (enhanced version)
  async getMerchantStats(req, res) {
    try {
      const userId = req.user.id;
      const merchant = await Merchant.findOne({ where: { userId } });

      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Merchant account not found'
          }
        });
      }

      // Get transaction statistics
      const [
        totalTransactions,
        completedTransactions,
        totalRevenue,
        pendingAmount
      ] = await Promise.all([
        Transaction.count({ where: { userId: merchant.userId } }),
        Transaction.count({ where: { userId: merchant.userId, status: 'completed' } }),
        Transaction.sum('amount', { where: { userId: merchant.userId, status: 'completed' } }),
        Transaction.sum('amount', { where: { userId: merchant.userId, status: 'pending' } })
      ]);

      // Get recent transactions
      const recentTransactions = await Transaction.findAll({
        where: { userId: merchant.userId },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'providerTransactionId', 'amount', 'status', 'paymentMethod', 'createdAt']
      });

      // Calculate available balance (completed transactions not yet settled)
      const completedTxns = await Transaction.findAll({
        where: {
          userId: merchant.userId,
          status: 'completed'
        },
        attributes: ['id', 'amount', 'netAmount']
      });

      // Calculate pending settlement amount
      const pendingSettlement = await Settlement.sum('amount', {
        where: {
          merchantId: merchant.id,
          status: { [Op.in]: ['pending', 'processing'] }
        }
      }) || 0;

      // Count settlements completed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySettlements = await Settlement.count({
        where: {
          merchantId: merchant.id,
          status: 'completed',
          updatedAt: { [Op.gte]: today }
        }
      });

      // Get settlement history
      const settlementHistory = await Settlement.findAll({
        where: { merchantId: merchant.id },
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: ['id', 'amount', 'status', 'bankAccount', 'reference', 'createdAt', 'updatedAt', 'transactionCount']
      });

      // Format settlement history
      const formattedHistory = settlementHistory.map(settlement => {
        const bankAccountData = settlement.bankAccount || {};
        const bankAccountStr = bankAccountData.bankName && bankAccountData.maskedAccountNumber
          ? `${bankAccountData.bankName} • ${bankAccountData.maskedAccountNumber}`
          : bankAccountData.accountName || 'N/A';

        return {
          id: settlement.id,
          amount: parseFloat(settlement.amount),
          status: settlement.status,
          bankAccount: bankAccountStr,
          reference: settlement.reference,
          initiatedAt: settlement.createdAt,
          completedAt: settlement.status === 'completed' ? settlement.updatedAt : null,
          transactionCount: settlement.transactionCount || 0
        };
      });

      // Calculate available balance (simplified - would need proper tracking in production)
      const availableBalance = (totalRevenue || 0) - pendingSettlement;

      res.json({
        success: true,
        data: {
          totalTransactions,
          completedTransactions,
          totalRevenue: totalRevenue || 0,
          pendingAmount: pendingAmount || 0,
          recentTransactions,
          availableBalance,
          pendingSettlement,
          todaySettlements,
          settlementHistory: formattedHistory
        }
      });
    } catch (error) {
      console.error('Get merchant stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch merchant statistics'
        }
      });
    }
  },

  // Request settlement
  async requestSettlement(req, res) {
    try {
      const userId = req.user.id;
      const { amount, bankAccountId, description } = req.body;

      const merchant = await Merchant.findOne({ where: { userId } });

      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Merchant account not found'
          }
        });
      }

      // Check KYC approval
      if (merchant.kycStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'KYC_NOT_APPROVED',
            message: 'KYC must be approved before requesting settlement'
          }
        });
      }

      // Validate amount
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid settlement amount'
          }
        });
      }

      // Calculate available balance
      const totalRevenue = await Transaction.sum('amount', {
        where: { userId: merchant.userId, status: 'completed' }
      }) || 0;

      const pendingSettlement = await Settlement.sum('amount', {
        where: {
          merchantId: merchant.id,
          status: { [Op.in]: ['pending', 'processing'] }
        }
      }) || 0;

      const availableBalance = totalRevenue - pendingSettlement;

      if (amount > availableBalance) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Amount exceeds available balance'
          }
        });
      }

      // Check if merchant has bank account configured
      if (!merchant.settlementAccountNumber || !merchant.settlementBankCode) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No bank account configured'
          }
        });
      }

      // Calculate fee (2% default or from merchant config)
      const feePercentage = merchant.fees?.settlementFee || 0.02;
      const fee = amount * feePercentage;
      const netAmount = amount - fee;

      // Get bank account details
      const bankAccount = {
        accountName: merchant.settlementAccountName,
        accountNumber: merchant.settlementAccountNumber,
        maskedAccountNumber: `****${merchant.settlementAccountNumber.slice(-4)}`,
        bankCode: merchant.settlementBankCode,
        bankName: this.getBankName(merchant.settlementBankCode)
      };

      // Generate unique reference
      const reference = `STL${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // Get pending transactions to include in this settlement
      const pendingTransactions = await Transaction.findAll({
        where: {
          userId: merchant.userId,
          status: 'completed'
        },
        limit: Math.ceil(amount / 1000), // Approximate number of transactions
        order: [['createdAt', 'ASC']]
      });

      // Create settlement
      const settlement = await Settlement.create({
        merchantId: merchant.id,
        amount,
        fee,
        netAmount,
        status: 'pending',
        description: description || 'Manual settlement request',
        bankAccount,
        bankAccountId: merchant.id, // Using merchant ID as bank account ID for now
        reference,
        transactionCount: pendingTransactions.length,
        settlementType: 'manual'
      });

      // Estimate completion time (T+1 = next business day)
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + 1);
      estimatedCompletion.setHours(14, 0, 0, 0);

      res.json({
        success: true,
        data: {
          settlementId: settlement.id,
          amount,
          status: settlement.status,
          bankAccount: `${bankAccount.bankName} • ${bankAccount.maskedAccountNumber}`,
          reference,
          initiatedAt: settlement.createdAt,
          estimatedCompletion
        },
        message: 'Settlement request submitted successfully'
      });
    } catch (error) {
      console.error('Request settlement error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initiate settlement'
        }
      });
    }
  },

  // Get settlement details
  async getSettlementDetails(req, res) {
    try {
      const userId = req.user.id;
      const { settlementId } = req.params;

      const merchant = await Merchant.findOne({ where: { userId } });

      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Merchant account not found'
          }
        });
      }

      const settlement = await Settlement.findOne({
        where: {
          id: settlementId,
          merchantId: merchant.id
        }
      });

      if (!settlement) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Settlement not found'
          }
        });
      }

      // Get bank account details
      const bankAccount = settlement.bankAccount || {};
      const bankAccountStr = bankAccount.bankName && bankAccount.maskedAccountNumber
        ? `${bankAccount.bankName} • ${bankAccount.maskedAccountNumber}`
        : bankAccount.accountName || 'N/A';

      // Get transactions for this settlement period
      const transactions = await Transaction.findAll({
        where: {
          userId: merchant.userId,
          status: 'completed',
          createdAt: {
            [Op.gte]: settlement.periodStart,
            [Op.lte]: settlement.periodEnd
          }
        },
        attributes: ['id', 'amount', 'type', 'status', 'providerTransactionId', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      const settlementData = {
        id: settlement.id,
        amount: parseFloat(settlement.amount),
        status: settlement.status,
        bankAccount: bankAccountStr,
        bankAccountDetails: {
          accountName: bankAccount.accountName,
          accountNumber: bankAccount.accountNumber,
          bankName: bankAccount.bankName,
          bankCode: bankAccount.bankCode
        },
        reference: settlement.reference,
        initiatedAt: settlement.createdAt,
        completedAt: settlement.status === 'completed' ? settlement.updatedAt : null,
        transactionCount: transactions.length,
        fee: parseFloat(settlement.fee),
        netAmount: parseFloat(settlement.netAmount),
        transactions: transactions.map(tx => ({
          id: tx.id,
          amount: parseFloat(tx.amount),
          type: tx.type,
          status: tx.status,
          reference: tx.providerTransactionId,
          createdAt: tx.createdAt
        })),
        settlementBreakdown: {
          currency: 'NGN',
          grossAmount: parseFloat(settlement.amount),
          fee: parseFloat(settlement.fee),
          netAmount: parseFloat(settlement.netAmount)
        }
      };

      res.json({
        success: true,
        data: settlementData
      });
    } catch (error) {
      console.error('Get settlement details error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch settlement details'
        }
      });
    }
  },

  // List all settlements
  async listSettlements(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, status, startDate, endDate } = req.query;

      const merchant = await Merchant.findOne({ where: { userId } });

      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Merchant account not found'
          }
        });
      }

      const whereClause = { merchantId: merchant.id };

      if (status) whereClause.status = status;
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Settlement.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const settlements = rows.map(settlement => {
        const bankAccount = settlement.bankAccount || {};
        const bankAccountStr = bankAccount.bankName && bankAccount.maskedAccountNumber
          ? `${bankAccount.bankName} • ${bankAccount.maskedAccountNumber}`
          : bankAccount.accountName || 'N/A';

        return {
          id: settlement.id,
          amount: parseFloat(settlement.amount),
          status: settlement.status,
          bankAccount: bankAccountStr,
          reference: settlement.reference,
          initiatedAt: settlement.createdAt,
          completedAt: settlement.status === 'completed' ? settlement.updatedAt : null,
          transactionCount: settlement.transactionCount || 0
        };
      });

      res.json({
        success: true,
        data: {
          settlements,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('List settlements error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch settlements'
        }
      });
    }
  },

  // Admin: Get all settlements
  async getAllSettlements(req, res) {
    try {
      const { page = 1, limit = 20, status, merchantId, startDate, endDate } = req.query;

      const whereClause = {};

      if (status) whereClause.status = status;
      if (merchantId) whereClause.merchantId = merchantId;
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Settlement.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'businessName', 'businessEmail']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const settlements = rows.map(settlement => {
        const bankAccount = settlement.bankAccount || {};
        const bankAccountStr = bankAccount.bankName && bankAccount.maskedAccountNumber
          ? `${bankAccount.bankName} • ${bankAccount.maskedAccountNumber}`
          : bankAccount.accountName || 'N/A';

        return {
          id: settlement.id,
          merchantId: settlement.merchantId,
          merchant: settlement.merchant,
          amount: parseFloat(settlement.amount),
          status: settlement.status,
          bankAccount: bankAccountStr,
          reference: settlement.reference,
          initiatedAt: settlement.createdAt,
          completedAt: settlement.status === 'completed' ? settlement.updatedAt : null,
          transactionCount: settlement.transactionCount || 0
        };
      });

      res.json({
        success: true,
        data: {
          settlements,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all settlements error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch settlements'
        }
      });
    }
  },

  // Admin: Get settlement details
  async getAdminSettlementDetails(req, res) {
    try {
      const { id } = req.params;

      const settlement = await Settlement.findOne({
        where: { id },
        include: [
          {
            model: Merchant,
            as: 'merchant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'email', 'firstName', 'lastName', 'phone']
              }
            ]
          }
        ]
      });

      if (!settlement) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Settlement not found'
          }
        });
      }

      const bankAccount = settlement.bankAccount || {};
      const settlementData = {
        id: settlement.id,
        merchantId: settlement.merchantId,
        merchant: settlement.merchant,
        amount: parseFloat(settlement.amount),
        status: settlement.status,
        bankAccountDetails: {
          accountName: bankAccount.accountName,
          accountNumber: bankAccount.accountNumber,
          bankName: bankAccount.bankName,
          bankCode: bankAccount.bankCode
        },
        reference: settlement.reference,
        description: settlement.description,
        initiatedAt: settlement.createdAt,
        completedAt: settlement.status === 'completed' ? settlement.updatedAt : null,
        transactionCount: settlement.transactionCount || 0,
        fee: parseFloat(settlement.fee),
        netAmount: parseFloat(settlement.netAmount),
        failureReason: settlement.failureReason
      };

      res.json({
        success: true,
        data: settlementData
      });
    } catch (error) {
      console.error('Get admin settlement details error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch settlement details'
        }
      });
    }
  },

  // Admin: Approve settlement
  async approveSettlement(req, res) {
    try {
      const { id } = req.params;

      const settlement = await Settlement.findByPk(id);

      if (!settlement) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Settlement not found'
          }
        });
      }

      if (settlement.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Settlement can only be approved when in pending status'
          }
        });
      }

      // Update settlement status
      await settlement.update({
        status: 'processing',
        processedAt: new Date()
      });

      res.json({
        success: true,
        data: settlement,
        message: 'Settlement approved and processing started'
      });
    } catch (error) {
      console.error('Approve settlement error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to approve settlement'
        }
      });
    }
  },

  // Admin: Reject settlement
  async rejectSettlement(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const settlement = await Settlement.findByPk(id);

      if (!settlement) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Settlement not found'
          }
        });
      }

      if (settlement.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Settlement can only be rejected when in pending status'
          }
        });
      }

      // Update settlement status
      await settlement.update({
        status: 'failed',
        failureReason: reason || 'Settlement rejected by admin'
      });

      res.json({
        success: true,
        data: settlement,
        message: 'Settlement rejected successfully'
      });
    } catch (error) {
      console.error('Reject settlement error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject settlement'
        }
      });
    }
  },

  // Helper function to get bank name
  getBankName(bankCode) {
    const banks = {
      '044': 'Access Bank',
      '050': 'Ecobank',
      '058': 'GTBank',
      '063': 'Access Bank (Diamond)',
      '070': 'Fidelity Bank',
      '011': 'First Bank',
      '214': 'First City Monument Bank',
      '058': 'Guaranty Trust Bank'
    };
    return banks[bankCode] || 'Unknown Bank';
  }
};

