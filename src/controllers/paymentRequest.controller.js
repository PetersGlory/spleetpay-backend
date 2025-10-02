const { PaymentRequest, SplitParticipant, Transaction, User, WalletTransaction } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const paymentService = require('../services/payment.service');
const qrCodeService = require('../services/qrCode.service');

module.exports = {
  // Create new payment request (Pay for Me)
  async createPaymentRequest(req, res) {
    try {
      const { type, description, amount, currency, expiresInHours, allowTips } = req.body;
      
      if (type === 'pay_for_me') {
        const expiresAt = expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000) : null;
        
        // Generate unique payment link
        const linkToken = crypto.randomBytes(32).toString('hex');
        const paymentLink = `${process.env.PAYMENT_LINK_DOMAIN}/p/${linkToken}`;
        
        const paymentRequest = await PaymentRequest.create({
          userId: req.user?.id || null,
          type: 'pay_for_me',
          description,
          amount,
          currency: currency || req.user?.preferredCurrency || 'NGN',
          expiresAt,
          paymentLink,
          linkToken,
          allowTips: allowTips !== false
        });
        
        // Generate QR code
        const qrCodeUrl = await qrCodeService.generateQRCode(paymentLink);
        await paymentRequest.update({ qrCodeUrl });
        
        res.status(201).json({
          success: true,
          data: paymentRequest,
          message: 'Payment request created successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: 'Invalid payment type. Use /api/payments/split/create for group split payments'
          }
        });
      }
    } catch (error) {
      console.error('Create payment request error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment request'
        }
      });
    }
  },

  // Create group split payment
  async createGroupSplitPayment(req, res) {
    try {
      const { description, totalAmount, currency, participants, splitType, expiresInHours, allowTips } = req.body;
      
      // Validate participants
      if (!participants || participants.length < 2) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARTICIPANTS',
            message: 'At least 2 participants are required for group split'
          }
        });
      }
      
      // Calculate amounts if split is equal
      let participantAmounts = participants;
      if (splitType === 'equal') {
        const amountPerPerson = totalAmount / participants.length;
        participantAmounts = participants.map(participant => ({
          ...participant,
          amount: amountPerPerson
        }));
      }
      
      // Validate total amount matches
      const calculatedTotal = participantAmounts.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AMOUNT_MISMATCH',
            message: 'Sum of participant amounts does not match total amount'
          }
        });
      }
      
      const expiresAt = expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000) : null;
      
      // Generate unique payment link
      const linkToken = crypto.randomBytes(32).toString('hex');
      const paymentLink = `${process.env.PAYMENT_LINK_DOMAIN}/p/${linkToken}`;
      
      const paymentRequest = await PaymentRequest.create({
        userId: req.user?.id || null,
        type: 'group_split',
        description,
        amount: totalAmount,
        currency: currency || req.user?.preferredCurrency || 'NGN',
        expiresAt,
        paymentLink,
        linkToken,
        allowTips: allowTips !== false,
        totalAmount,
        splitType
      });
      
      // Create participants
      const createdParticipants = [];
      for (const participant of participantAmounts) {
        const participantLinkToken = crypto.randomBytes(32).toString('hex');
        const participantLink = `${process.env.PAYMENT_LINK_DOMAIN}/split/${participantLinkToken}`;
        
        const createdParticipant = await SplitParticipant.create({
          paymentRequestId: paymentRequest.id,
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
          amount: participant.amount,
          participantLink,
          linkToken: participantLinkToken
        });
        
        createdParticipants.push(createdParticipant);
      }
      
      // Generate QR code
      const qrCodeUrl = await qrCodeService.generateQRCode(paymentLink);
      await paymentRequest.update({ qrCodeUrl });
      
      const result = await PaymentRequest.findByPk(paymentRequest.id, {
        include: [{
          model: SplitParticipant,
          as: 'participants'
        }]
      });
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Group split payment created successfully'
      });
    } catch (error) {
      console.error('Create group split payment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create group split payment'
        }
      });
    }
  },

  // Get payment request details
  async getPaymentRequest(req, res) {
    try {
      const { paymentId } = req.params;
      
      const paymentRequest = await PaymentRequest.findByPk(paymentId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: SplitParticipant,
            as: 'participants'
          }
        ]
      });
      
      if (!paymentRequest) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Payment request not found'
          }
        });
      }
      
      // Calculate total collected
      const transactions = await Transaction.findAll({
        where: {
          paymentRequestId: paymentId,
          status: 'completed'
        }
      });
      
      const totalCollected = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      
      res.json({
        success: true,
        data: {
          ...paymentRequest.toJSON(),
          totalCollected
        }
      });
    } catch (error) {
      console.error('Get payment request error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payment request'
        }
      });
    }
  },

  // Access payment via public link (no auth required)
  async getPaymentByLink(req, res) {
    try {
      const { linkToken } = req.params;
      
      const paymentRequest = await PaymentRequest.findOne({
        where: { linkToken },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: SplitParticipant,
            as: 'participants'
          }
        ]
      });
      
      if (!paymentRequest) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Payment link not found or expired'
          }
        });
      }
      
      // Check if expired
      if (paymentRequest.expiresAt && new Date() > paymentRequest.expiresAt) {
        return res.status(410).json({
          success: false,
          error: {
            code: 'PAYMENT_EXPIRED',
            message: 'This payment link has expired'
          }
        });
      }
      
      // Calculate total collected
      const transactions = await Transaction.findAll({
        where: {
          paymentRequestId: paymentRequest.id,
          status: 'completed'
        }
      });
      
      const totalCollected = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
      
      res.json({
        success: true,
        data: {
          ...paymentRequest.toJSON(),
          totalCollected
        }
      });
    } catch (error) {
      console.error('Get payment by link error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payment details'
        }
      });
    }
  },

  // Process payment for specific participant
  async processParticipantPayment(req, res) {
    try {
      const { paymentId, participantId } = req.params;
      const { amount, tipAmount, paymentMethod, paymentDetails } = req.body;
      
      // Find participant
      const participant = await SplitParticipant.findByPk(participantId, {
        include: [{
          model: PaymentRequest,
          as: 'paymentRequest'
        }]
      });
      
      if (!participant) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Participant not found'
          }
        });
      }
      
      // Validate payment request
      if (participant.paymentRequest.id !== paymentId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Participant does not belong to this payment request'
          }
        });
      }
      
      // Check if already paid
      if (participant.hasPaid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_PAID',
            message: 'This participant has already paid'
          }
        });
      }
      
      // Check if expired
      if (participant.paymentRequest.expiresAt && new Date() > participant.paymentRequest.expiresAt) {
        return res.status(410).json({
          success: false,
          error: {
            code: 'PAYMENT_EXPIRED',
            message: 'This payment has expired'
          }
        });
      }
      
      // Validate amount
      if (Math.abs(parseFloat(amount) - parseFloat(participant.amount)) > 0.01) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'AMOUNT_MISMATCH',
            message: `Amount must be exactly ${participant.amount} ${participant.paymentRequest.currency}`
          }
        });
      }
      
      // Process payment with Paystack
      const paymentResult = await paymentService.initializePayment({
        amount: (parseFloat(amount) + parseFloat(tipAmount || 0)) * 100, // Convert to kobo
        currency: participant.paymentRequest.currency,
        email: participant.email || 'participant@example.com',
        reference: `split_${participant.id}_${Date.now()}`,
        metadata: {
          paymentRequestId: paymentId,
          participantId: participantId,
          participantName: participant.name,
          tipAmount: tipAmount || 0
        }
      });
      
      // Create transaction record
      const transaction = await Transaction.create({
        userId: participant.paymentRequest.userId,
        paymentRequestId: paymentId,
        participantId: participantId,
        amount: parseFloat(amount),
        tipAmount: parseFloat(tipAmount || 0),
        currency: participant.paymentRequest.currency,
        paymentMethod,
        paymentProvider: 'paystack',
        providerTransactionId: paymentResult.reference,
        status: 'pending',
        gatewayResponse: paymentResult
      });
      
      res.json({
        success: true,
        data: {
          transaction,
          paymentUrl: paymentResult.authorization_url
        },
        message: 'Payment initialized successfully'
      });
    } catch (error) {
      console.error('Process participant payment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process payment'
        }
      });
    }
  },

  // Get user's payment history
  async getUserPaymentHistory(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        startDate,
        endDate
      } = req.query;

      const whereClause = {
        userId: req.user.id
      };

      // Apply filters
      if (type) whereClause.type = type;
      if (status) whereClause.status = status;
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
        if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await PaymentRequest.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: SplitParticipant,
            as: 'participants',
            attributes: ['id', 'name', 'amount', 'hasPaid']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          payments: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get user payment history error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payment history'
        }
      });
    }
  }
};
