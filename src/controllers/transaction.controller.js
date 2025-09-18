const { Transaction, Merchant, GroupSplitContributor, User } = require('../models');
const paymentService = require('../services/payment.service');
const emailService = require('../services/email.service');
const qrCodeService = require('../services/qrCode.service');
const webSocketService = require('../services/websocket.service');
const { Op } = require('sequelize');

module.exports = {
  // Create a new transaction
  async createTransaction(req, res) {
    try {
      const {
        type,
        amount,
        description,
        customerName,
        customerEmail,
        customerPhone,
        contributors,
        expiresAt
      } = req.body;

      const merchantId = req.user.merchantId || req.adminUser?.merchantId;

      if (!merchantId && !req.adminUser) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Merchant ID required'
          }
        });
      }

      // Generate transaction reference
      const reference = paymentService.generateReference();

      // Calculate fees (this should be configurable based on merchant settings)
      const merchantFee = Math.round(amount * 0.015); // 1.5% fee
      const gatewayFee = Math.round(amount * 0.025); // 2.5% gateway fee

      // Create transaction
      const transaction = await Transaction.create({
        merchantId,
        reference,
        type,
        amount,
        currency: 'NGN',
        status: 'pending',
        description,
        customerName,
        customerEmail,
        customerPhone,
        merchantFee,
        gatewayFee,
        netAmount: amount - merchantFee - gatewayFee,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours default
      });

      // If it's a group split, create contributors
      if (type === 'group_split' && contributors && contributors.length > 0) {
        const contributorPromises = contributors.map(contributor => 
          GroupSplitContributor.create({
            transactionId: transaction.id,
            name: contributor.name,
            email: contributor.email,
            phone: contributor.phone,
            amount: contributor.amount,
            status: 'pending'
          })
        );

        await Promise.all(contributorPromises);

        // Send payment request emails to contributors
        const merchant = await Merchant.findByPk(merchantId);
        const paymentUrl = qrCodeService.generatePaymentURL({
          merchantId,
          type,
          amount,
          description,
          reference
        });

        const emailPromises = contributors.map(contributor =>
          emailService.sendPaymentRequestEmail({
            contributorEmail: contributor.email,
            contributorName: contributor.name,
            amount: contributor.amount,
            currency: 'NGN',
            description,
            paymentUrl,
            merchantName: merchant?.businessName || 'SpleetPay',
            expiresAt: transaction.expiresAt
          })
        );

        await Promise.all(emailPromises);
      }

      // Emit real-time notification
      webSocketService.emitNewTransaction({
        transaction,
        merchantId
      });

      // Get transaction with contributors if group split
      const transactionWithContributors = await Transaction.findByPk(transaction.id, {
        include: type === 'group_split' ? ['contributors'] : []
      });

      res.status(201).json({
        success: true,
        data: transactionWithContributors,
        message: 'Transaction created successfully'
      });
    } catch (error) {
      console.error('Transaction creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create transaction'
        }
      });
    }
  },

  // Get transactions with filters
  async getTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        startDate,
        endDate,
        search
      } = req.query;

      const merchantId = req.user.merchantId || req.adminUser?.merchantId;
      const whereClause = {};

      // Apply merchant filter for non-admin users
      if (!req.adminUser && merchantId) {
        whereClause.merchantId = merchantId;
      } else if (req.adminUser && req.query.merchantId) {
        whereClause.merchantId = req.query.merchantId;
      }

      // Apply filters
      if (status) whereClause.status = status;
      if (type) whereClause.type = type;
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { reference: { [Op.iLike]: `%${search}%` } },
          { customerName: { [Op.iLike]: `%${search}%` } },
          { customerEmail: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Transaction.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Merchant,
            attributes: ['businessName', 'businessEmail']
          },
          {
            model: GroupSplitContributor,
            as: 'contributors',
            required: false
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
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transactions'
        }
      });
    }
  },

  // Get transaction by ID
  async getTransaction(req, res) {
    try {
      const { id } = req.params;
      const merchantId = req.user.merchantId || req.adminUser?.merchantId;

      const whereClause = { id };

      // Apply merchant filter for non-admin users
      if (!req.adminUser && merchantId) {
        whereClause.merchantId = merchantId;
      }

      const transaction = await Transaction.findOne({
        where: whereClause,
        include: [
          {
            model: Merchant,
            attributes: ['businessName', 'businessEmail', 'businessPhone']
          },
          {
            model: GroupSplitContributor,
            as: 'contributors',
            required: false
          }
        ]
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Transaction not found'
          }
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transaction'
        }
      });
    }
  },

  // Initialize payment with Paystack
  async initializePayment(req, res) {
    try {
      const { id } = req.params;
      const { customerEmail } = req.body;

      const merchantId = req.user.merchantId || req.adminUser?.merchantId;

      const whereClause = { id };

      // Apply merchant filter for non-admin users
      if (!req.adminUser && merchantId) {
        whereClause.merchantId = merchantId;
      }

      const transaction = await Transaction.findOne({
        where: whereClause,
        include: ['merchant']
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Transaction not found'
          }
        });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Transaction is not in pending status'
          }
        });
      }

      // Check if transaction has expired
      if (transaction.expiresAt && new Date() > transaction.expiresAt) {
        await transaction.update({ status: 'cancelled' });
        return res.status(400).json({
          success: false,
          error: {
            code: 'TRANSACTION_EXPIRED',
            message: 'Transaction has expired'
          }
        });
      }

      // Initialize payment with Paystack
      const paymentData = {
        email: customerEmail || transaction.customerEmail,
        amount: transaction.amount,
        reference: transaction.reference,
        metadata: {
          transactionId: transaction.id,
          customerName: transaction.customerName,
          merchantId: transaction.merchantId
        },
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`
      };

      const paymentResult = await paymentService.initializePayment(paymentData);

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PAYMENT_INITIALIZATION_FAILED',
            message: paymentResult.error
          }
        });
      }

      // Update transaction with payment gateway info
      await transaction.update({
        paymentGateway: 'paystack',
        pspResponse: paymentResult.data
      });

      res.json({
        success: true,
        data: {
          authorizationUrl: paymentResult.data.authorization_url,
          accessCode: paymentResult.data.access_code,
          reference: paymentResult.data.reference
        },
        message: 'Payment initialized successfully'
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to initialize payment'
        }
      });
    }
  },

  // Verify payment
  async verifyPayment(req, res) {
    try {
      const { reference } = req.params;

      // Verify payment with Paystack
      const verificationResult = await paymentService.verifyPayment(reference);

      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PAYMENT_VERIFICATION_FAILED',
            message: verificationResult.error
          }
        });
      }

      // Find transaction by reference
      const transaction = await Transaction.findOne({
        where: { reference },
        include: ['contributors']
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Transaction not found'
          }
        });
      }

      if (verificationResult.verified) {
        // Update transaction status
        await transaction.update({
          status: 'completed',
          gatewayReference: verificationResult.data.transfer_code || verificationResult.data.reference,
          pspResponse: verificationResult.data
        });

        // Send payment confirmation email
        await emailService.sendPaymentConfirmationEmail({
          email: transaction.customerEmail,
          name: transaction.customerName,
          amount: transaction.amount,
          currency: transaction.currency,
          description: transaction.description,
          reference: transaction.reference,
          merchantName: transaction.merchant?.businessName || 'SpleetPay'
        });

        // Emit real-time notification
        webSocketService.emitTransactionUpdate({
          transaction,
          merchantId: transaction.merchantId
        });
      }

      res.json({
        success: true,
        data: {
          verified: verificationResult.verified,
          transaction: transaction,
          paymentData: verificationResult.data
        },
        message: verificationResult.verified ? 'Payment verified successfully' : 'Payment verification failed'
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify payment'
        }
      });
    }
  },

  // Send payment reminders for group split
  async sendReminders(req, res) {
    try {
      const { id } = req.params;
      const merchantId = req.user.merchantId || req.adminUser?.merchantId;

      const transaction = await Transaction.findOne({
        where: { 
          id,
          merchantId: req.adminUser ? undefined : merchantId,
          type: 'group_split'
        },
        include: ['contributors', 'merchant']
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Group split transaction not found'
          }
        });
      }

      // Get pending contributors
      const pendingContributors = transaction.contributors.filter(c => c.status === 'pending');

      if (pendingContributors.length === 0) {
        return res.json({
          success: true,
          message: 'No pending contributors to remind'
        });
      }

      // Generate payment URL
      const paymentUrl = qrCodeService.generatePaymentURL({
        merchantId: transaction.merchantId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        reference: transaction.reference
      });

      // Send reminder emails
      const emailPromises = pendingContributors.map(contributor =>
        emailService.sendPaymentRequestEmail({
          contributorEmail: contributor.email,
          contributorName: contributor.name,
          amount: contributor.amount,
          currency: transaction.currency,
          description: transaction.description,
          paymentUrl,
          merchantName: transaction.merchant?.businessName || 'SpleetPay',
          expiresAt: transaction.expiresAt
        })
      );

      await Promise.all(emailPromises);

      res.json({
        success: true,
        message: `Reminders sent to ${pendingContributors.length} contributors`
      });
    } catch (error) {
      console.error('Send reminders error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send reminders'
        }
      });
    }
  },

  // Cancel transaction
  async cancelTransaction(req, res) {
    try {
      const { id } = req.params;
      const merchantId = req.user.merchantId || req.adminUser?.merchantId;

      const whereClause = { id };

      // Apply merchant filter for non-admin users
      if (!req.adminUser && merchantId) {
        whereClause.merchantId = merchantId;
      }

      const transaction = await Transaction.findOne({
        where: whereClause
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Transaction not found'
          }
        });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Cannot cancel transaction that is not pending'
          }
        });
      }

      await transaction.update({ status: 'cancelled' });

      // Emit real-time notification
      webSocketService.emitTransactionUpdate({
        transaction,
        merchantId: transaction.merchantId
      });

      res.json({
        success: true,
        message: 'Transaction cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel transaction error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel transaction'
        }
      });
    }
  }
};
