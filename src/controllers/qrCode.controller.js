const { QRCode, Merchant, GroupSplitContributor, Transaction } = require('../models');
const emailService = require('../services/email.service');
const qrCodeService = require('../services/qrCode.service');
const { Op } = require('sequelize');

module.exports = {
  // Generate QR code
  async generateQRCode(req, res) {
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

      // if (merchant.kycStatus !== 'approved') {
      //   return res.status(403).json({
      //     success: false,
      //     error: {
      //       code: 'AUTHORIZATION_ERROR',
      //       message: 'KYC must be approved to generate QR codes'
      //     }
      //   });
      // }

      const {
        name,
        type,
        amount,
        description,
        usageLimit,
        expiresAt
      } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name and type are required'
          }
        });
      }

      if (!['pay_for_me', 'group_split'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Type must be either pay_for_me or group_split'
          }
        });
      }

      const qrCodeData = {
        merchantId: merchant.id,
        name,
        type,
        amount,
        description,
        usageLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      };

      const result = await qrCodeService.createPaymentQRCode(qrCodeData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QR_CODE_GENERATION_FAILED',
            message: result.error
          }
        });
      }

      res.status(201).json({
        success: true,
        data: result.data,
        message: 'QR code generated successfully'
      });
    } catch (error) {
      console.error('QR code generation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate QR code'
        }
      });
    }
  },

  // Get merchant's QR codes
  async getQRCodes(req, res) {
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

      const {
        page = 1,
        limit = 20,
        type,
        isActive = true
      } = req.query;

      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        isActive: isActive
      };

      // console.log(filters, merchant)

      const result = await qrCodeService.getMerchantQRCodes(merchant.id, filters);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QR_CODES_RETRIEVAL_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get QR codes error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch QR codes'
        }
      });
    }
  },

  // Get QR code by ID
  async getQRCode(req, res) {
    try {
      const { id } = req.params;
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

      const qrCode = await QRCode.findOne({
        where: {
          id,
          merchantId: merchant.id
        }
      });

      if (!qrCode) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'QR code not found'
          }
        });
      }

      res.json({
        success: true,
        data: qrCode
      });
    } catch (error) {
      console.error('Get QR code error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch QR code'
        }
      });
    }
  },

  // Update QR code
  async updateQRCode(req, res) {
    try {
      const { id } = req.params;
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

      const qrCode = await QRCode.findOne({
        where: {
          id,
          merchantId: merchant.id
        }
      });

      if (!qrCode) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'QR code not found'
          }
        });
      }

      const {
        name,
        amount,
        description,
        usageLimit,
        expiresAt
      } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (amount !== undefined) updateData.amount = amount;
      if (description !== undefined) updateData.description = description;
      if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
      if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

      const result = await qrCodeService.updateQRCode(id, updateData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QR_CODE_UPDATE_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data,
        message: 'QR code updated successfully'
      });
    } catch (error) {
      console.error('Update QR code error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update QR code'
        }
      });
    }
  },

  // Deactivate QR code
  async deactivateQRCode(req, res) {
    try {
      const { id } = req.params;
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

      const qrCode = await QRCode.findOne({
        where: {
          id,
          merchantId: merchant.id
        }
      });

      if (!qrCode) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'QR code not found'
          }
        });
      }

      const result = await qrCodeService.deactivateQRCode(id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QR_CODE_DEACTIVATION_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        message: 'QR code deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate QR code error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to deactivate QR code'
        }
      });
    }
  },

  // Get QR code statistics
  async getQRCodeStats(req, res) {
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

      const [
        totalQRCodes,
        activeQRCodes,
        totalUsage,
        payForMeCount,
        groupSplitCount
      ] = await Promise.all([
        QRCode.count({ where: { merchantId: merchant.id } }),
        QRCode.count({ where: { merchantId: merchant.id, isActive: true } }),
        QRCode.sum('usageCount', { where: { merchantId: merchant.id } }),
        QRCode.count({ where: { merchantId: merchant.id, type: 'pay_for_me' } }),
        QRCode.count({ where: { merchantId: merchant.id, type: 'group_split' } })
      ]);

      // Get top performing QR codes
      const topQRCodes = await QRCode.findAll({
        where: { merchantId: merchant.id },
        order: [['usageCount', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'type', 'usageCount', 'amount']
      });

      res.json({
        success: true,
        data: {
          totalQRCodes,
          activeQRCodes,
          totalUsage: totalUsage || 0,
          payForMeCount,
          groupSplitCount,
          topQRCodes
        }
      });
    } catch (error) {
      console.error('Get QR code stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch QR code statistics'
        }
      });
    }
  },

  // Get all QR codes (admin)
  async getAllQRCodes(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        merchantId,
        type,
        isActive
      } = req.query;

      const whereClause = {};

      if (merchantId) whereClause.merchantId = merchantId;
      if (type) whereClause.type = type;
      if (isActive !== undefined) whereClause.isActive = isActive === 'true';

      const offset = (page - 1) * limit;

      const { count, rows } = await QRCode.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'businessName', 'businessEmail']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          qrCodes: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all QR codes error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch QR codes'
        }
      });
    }
  },

  /**
   * Get QR code payment details by linkToken (public - no auth required)
   * This endpoint allows anyone with the QR code link to view payment details
   */
  async getQRCodeByLinkToken(req, res) {
    try {
      const { linkToken } = req.params;

      // Find QR code by linkToken
      const qrCode = await QRCode.findOne({
        where: { linkToken },
        include: [
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'businessName', 'businessEmail', 'businessPhone']
          }
        ]
      });

      if (!qrCode) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'QR code not found or invalid link'
          }
        });
      }

      // Check if QR code is active
      if (!qrCode.isActive) {
        return res.status(410).json({
          success: false,
          error: {
            code: 'QR_CODE_INACTIVE',
            message: 'This QR code has been deactivated'
          }
        });
      }

      // Check if expired
      if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
        return res.status(410).json({
          success: false,
          error: {
            code: 'QR_CODE_EXPIRED',
            message: 'This QR code has expired'
          }
        });
      }

      // Check if usage limit reached
      if (qrCode.usageLimit && qrCode.usageCount >= qrCode.usageLimit) {
        return res.status(410).json({
          success: false,
          error: {
            code: 'USAGE_LIMIT_REACHED',
            message: 'This QR code has reached its usage limit'
          }
        });
      }

      // Return QR code details (exclude sensitive data)
      res.json({
        success: true,
        data: {
          id: qrCode.id,
          name: qrCode.name,
          type: qrCode.type,
          description: qrCode.description,
          paymentLink: qrCode.paymentLink,
          usageCount: qrCode.usageCount,
          usageLimit: qrCode.usageLimit,
          expiresAt: qrCode.expiresAt,
          merchant: {
            id: qrCode.merchant.id,
            businessName: qrCode.merchant.businessName,
            businessEmail: qrCode.merchant.businessEmail,
            businessPhone: qrCode.merchant.businessPhone
          },
          createdAt: qrCode.createdAt
        }
      });
    } catch (error) {
      console.error('Get QR code by link token error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch QR code details'
        }
      });
    }
  },

  /**
   * Verify QR code payment (public - no auth required)
   * Process and verify payment made through a QR code
   */
  async verifyQRCodePayment(req, res) {
    try {
      const { linkToken } = req.params;
      const { reference, status, customerName, customerEmail, customerPhone, tipAmount } = req.body;

      // If status is failed, don't do anything
      if (status === 'failed' || status === 'error') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PAYMENT_FAILED',
            message: 'Payment failed. No transaction created.'
          }
        });
      }

      // Only proceed if status is successful
      if (status !== 'success' && status !== 'successful' && status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Invalid payment status. Expected "success" or "successful".'
          }
        });
      }

      // Find QR code by linkToken
      const qrCode = await QRCode.findOne({
        where: { linkToken },
        include: [
          {
            model: Merchant,
            as: 'merchant',
            attributes: ['id', 'businessName', 'businessEmail', 'userId']
          }
        ]
      });

      if (!qrCode) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'QR code not found or invalid link'
          }
        });
      }

      // Check if QR code is active
      if (!qrCode.isActive) {
        return res.status(410).json({
          success: false,
          error: {
            code: 'QR_CODE_INACTIVE',
            message: 'This QR code has been deactivated'
          }
        });
      }

      // Check if expired
      if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
        return res.status(410).json({
          success: false,
          error: {
            code: 'QR_CODE_EXPIRED',
            message: 'This QR code has expired'
          }
        });
      }

      // Check if usage limit reached (before payment)
      if (qrCode.usageLimit && qrCode.usageCount >= qrCode.usageLimit) {
        return res.status(410).json({
          success: false,
          error: {
            code: 'USAGE_LIMIT_REACHED',
            message: 'This QR code has reached its usage limit'
          }
        });
      }

      // Validate customer details
      if (!customerName || !customerEmail) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Customer name and email are required'
          }
        });
      }

      // Check if transaction already exists with this reference
      let transaction = await Transaction.findOne({
        where: {
          providerTransactionId: reference,
          qrCodeId: qrCode.id
        }
      });

      // If transaction already exists and is completed, return success
      if (transaction && transaction.status === 'completed') {
        return res.json({
          success: true,
          data: {
            transaction,
            paymentStatus: 'success',
            message: 'Payment already verified'
          }
        });
      }

      // Determine payment amount based on QR code type
      let paymentAmount;
      if (qrCode.type === 'pay_for_me') {
        // For pay_for_me, amount should be provided in the request
        paymentAmount = req.body.amount;
        if (!paymentAmount || paymentAmount <= 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Payment amount is required for pay_for_me QR codes'
            }
          });
        }
      } else if (qrCode.type === 'group_split') {
        // For group_split, amount should be provided in the request
        paymentAmount = req.body.amount;
        if (!paymentAmount || paymentAmount <= 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Payment amount is required for group_split QR codes'
            }
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_QR_TYPE',
            message: 'Invalid QR code type'
          }
        });
      }

      // Create new transaction for successful payment
      if (!transaction) {
        transaction = await Transaction.create({
          qrCodeId: qrCode.id,
          merchantId: qrCode.merchantId,
          userId: qrCode.merchant.userId,
          type: qrCode.type,
          description: qrCode.description || `Payment via QR: ${qrCode.name}`,
          customerName,
          customerEmail,
          customerPhone,
          amount: parseFloat(paymentAmount),
          currency: 'NGN', // You can make this dynamic based on merchant settings
          paymentMethod: req.body.paymentMethod || 'paystack',
          paymentProvider: 'paystack',
          providerTransactionId: reference,
          status: 'completed',
          reference: reference,
          tipAmount: parseFloat(tipAmount || 0)
        });
      } else {
        // Update existing transaction to completed
        await transaction.update({ 
          status: 'completed',
          customerName,
          customerEmail,
          customerPhone,
          amount: parseFloat(paymentAmount),
          tipAmount: parseFloat(tipAmount || 0)
        });
      }

      // Increment QR code usage count
      await qrCodeService.incrementUsage(qrCode.id);

      // Send confirmation email
      try {
        await emailService.sendPaymentConfirmationEmail(
          customerEmail,
          customerName,
          paymentAmount,
          'NGN', // Currency
          qrCode.description || qrCode.name
        );
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the request if email fails
      }

      // Handle based on QR code type
      if (qrCode.type === 'pay_for_me') {
        return res.json({
          success: true,
          data: {
            transaction,
            paymentStatus: 'success',
            qrCodeStatus: qrCode.isActive ? 'active' : 'inactive',
            usageCount: qrCode.usageCount + 1,
            usageLimit: qrCode.usageLimit,
            message: 'Payment completed successfully'
          }
        });

      } else if (qrCode.type === 'group_split') {
        // For group_split, create GroupSplitContributor record
        await GroupSplitContributor.create({
          transactionId: transaction.id,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          amount: parseFloat(paymentAmount),
          status: 'paid',
          paymentReference: reference,
          paidAt: new Date(),
          paymentMethod: 'paystack'
        });

        // Get total collected for this QR code
        const totalCollected = await Transaction.sum('amount', {
          where: {
            qrCodeId: qrCode.id,
            status: 'completed'
          }
        });

        const contributorCount = await GroupSplitContributor.count({
          where: {
            status: 'paid'
          },
          include: [{
            model: Transaction,
            as: 'transaction',
            where: {
              qrCodeId: qrCode.id
            }
          }]
        });

        return res.json({
          success: true,
          data: {
            transaction,
            paymentStatus: 'success',
            qrCodeStatus: qrCode.isActive ? 'active' : 'inactive',
            usageCount: qrCode.usageCount + 1,
            usageLimit: qrCode.usageLimit,
            totalCollected: totalCollected || 0,
            contributorCount,
            message: 'Payment verified and contribution recorded successfully'
          }
        });
      }

    } catch (error) {
      console.error('Verify QR code payment error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify QR code payment',
          details: error.message
        }
      });
    }
  },
};
