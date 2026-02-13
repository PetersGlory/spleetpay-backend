const { QRCode, Merchant, GroupSplitContributor, Transaction, SplitParticipant, PaymentRequest } = require('../models');
const emailService = require('../services/email.service');
const qrCodeService = require('../services/qrCode.service');
const { Op } = require('sequelize');
const crypto = require('crypto');

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

      return res.json({
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

  // Add these new methods to your QR code controller (document 6)

/**
 * Initialize QR code group split (public - no auth required)
 * First person scans QR and sets up the split payment
 */
async initializeQRGroupSplit(req, res) {
  try {
    const { linkToken } = req.params;
    const { 
      organizerName, 
      organizerEmail, 
      organizerPhone,
      description, 
      totalAmount, 
      participants, 
      splitType 
    } = req.body;

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

    // Validate inputs
    if (!organizerName || !organizerEmail) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Organizer name and email are required'
        }
      });
    }

    if (!participants || participants.length < 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARTICIPANTS',
          message: 'At least 1 additional participant is required'
        }
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Total amount must be greater than 0'
        }
      });
    }

    // Calculate amounts if split is equal
    let participantAmounts = participants;
    const totalParticipants = participants.length + 1; // +1 for organizer

    if (splitType === 'equal') {
      const amountPerPerson = totalAmount / totalParticipants;
      participantAmounts = participants.map(participant => ({
        ...participant,
        amount: amountPerPerson
      }));
    }

    // Validate total amount matches (for custom split)
    if (splitType === 'custom') {
      const participantsTotal = participantAmounts.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      if (Math.abs(participantsTotal - totalAmount) > 0.01) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AMOUNT_MISMATCH',
            message: 'Sum of participant amounts does not match total amount'
          }
        });
      }
    }

    // Create a PaymentRequest for this QR code split
    const paymentRequestLinkToken = crypto.randomBytes(32).toString('hex');
    const paymentLink = `${process.env.PAYMENT_LINK_DOMAIN}/qr-split/${paymentRequestLinkToken}`;

    const paymentRequest = await PaymentRequest.create({
      userId: qrCode.merchant.userId,
      qrCodeId: qrCode.id,
      type: 'group_split',
      description: description || qrCode.description || qrCode.name,
      amount: totalAmount,
      totalAmount: totalAmount,
      currency: 'NGN',
      expiresAt: qrCode.expiresAt,
      paymentLink,
      linkToken: paymentRequestLinkToken,
      splitType,
      allowTips: false
    });

    // Create organizer as first participant
    const organizerAmount = splitType === 'equal' 
      ? totalAmount / totalParticipants 
      : totalAmount - participantAmounts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const organizerLinkToken = crypto.randomBytes(32).toString('hex');
    const organizerLink = `${process.env.PAYMENT_LINK_DOMAIN}/split/${organizerLinkToken}`;

    const organizerParticipant = await SplitParticipant.create({
      paymentRequestId: paymentRequest.id,
      name: organizerName,
      email: organizerEmail,
      phone: organizerPhone || null,
      amount: organizerAmount,
      participantLink: organizerLink,
      linkToken: organizerLinkToken
    });

    // Create other participants
    const createdParticipants = [organizerParticipant];
    
    for (const participant of participantAmounts) {
      const participantLinkToken = crypto.randomBytes(32).toString('hex');
      const participantLink = `${process.env.PAYMENT_LINK_DOMAIN}/qr-split/${participantLinkToken}`;
      
      const createdParticipant = await SplitParticipant.create({
        paymentRequestId: paymentRequest.id,
        name: participant.name,
        email: participant.email,
        phone: participant.phone || null,
        amount: participant.amount,
        participantLink,
        linkToken: participantLinkToken
      });
      
      createdParticipants.push(createdParticipant);
    }

    // Send payment request emails to all participants
    try {
      const emailPromises = createdParticipants
        .filter(p => !!p.email)
        .map(p => emailService.sendPaymentRequestEmail({
          contributorEmail: p.email,
          contributorName: p.name,
          amount: p.amount,
          currency: 'NGN',
          description: paymentRequest.description,
          paymentUrl: p.participantLink,
          merchantName: qrCode.merchant.businessName,
          expiresAt: paymentRequest.expiresAt
        }));
      
      await Promise.all(emailPromises);
      console.log("Payment request emails sent!");
    } catch (e) {
      console.error('Error sending participant payment emails:', e);
    }

    // Increment QR code usage
    await qrCodeService.incrementUsage(qrCode.id);

    // Return the created payment request with participants
    const result = await PaymentRequest.findByPk(paymentRequest.id, {
      include: [{
        model: SplitParticipant,
        as: 'participants'
      }]
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Group split payment created successfully. Payment links sent to all participants.'
    });

  } catch (error) {
    console.error('Initialize QR group split error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to initialize group split payment',
        details: error.message
      }
    });
  }
},

/**
 * Get QR code split payment details (public - no auth required)
 */
async getQRSplitPayment(req, res) {
  try {
    const { linkToken } = req.params; // This is the participant link token

    // Find split participant by their linkToken
    const participant = await SplitParticipant.findOne({
      where: { linkToken },
      include: [
        {
          model: PaymentRequest,
          as: 'paymentRequest',
          include: [
            {
              model: QRCode,
              as: 'qrCode',
              include: [
                {
                  model: Merchant,
                  as: 'merchant',
                  attributes: ['id', 'businessName', 'businessEmail', 'businessPhone']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Split payment not found'
        }
      });
    }

    const paymentRequest = participant.paymentRequest;

    // Check if the parent payment request is expired
    if (paymentRequest.expiresAt && new Date() > paymentRequest.expiresAt) {
      return res.status(410).json({
        success: false,
        error: {
          code: 'PAYMENT_EXPIRED',
          message: 'This payment link has expired'
        }
      });
    }

    // Calculate total collected for this payment request
    const transactions = await Transaction.findAll({
      where: {
        paymentRequestId: paymentRequest.id,
        status: 'completed'
      }
    });

    const totalCollected = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    // Count paid participants
    const paidParticipants = paymentRequest.participants
      ? paymentRequest.participants.filter(p => p.hasPaid).length
      : 0;

    return res.json({
      success: true,
      data: {
        participant: participant.toJSON(),
        paymentRequest: {
          ...paymentRequest.toJSON(),
          totalCollected,
          paidParticipants,
          totalParticipants: paymentRequest.participants?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Get participant split payment error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch split payment details',
        details: error.message
      }
    });
  }
},
};
