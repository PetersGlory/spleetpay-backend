const { Merchant, User, KYCDocument, Director, Transaction, QRCode } = require('../models');
const cloudinary = require('cloudinary').v2;
const emailService = require('../services/email.service');
const qrCodeService = require('../services/qrCode.service');
const { Op } = require('sequelize');
const crypto = require('crypto');

module.exports = {
  // Register merchant (user becomes merchant)
  async registerMerchant(req, res) {
    try {
      const userId = req.user.id;

      // Check if user is already a merchant
      const existingMerchant = await Merchant.findOne({ where: { userId } });
      if (existingMerchant) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'User is already a merchant'
          }
        });
      }

      const {
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        businessType,
        websiteUrl
      } = req.body;

      // Create merchant record
      const merchant = await Merchant.create({
        userId,
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        businessType,
        websiteUrl,
        onboardingStatus: 'draft'
      });

      res.status(201).json({
        success: true,
        data: merchant,
        message: 'Merchant registration initiated successfully'
      });
    } catch (error) {
      console.error('Merchant registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register merchant'
        }
      });
    }
  },

  // Submit KYC information
  async submitKYC(req, res) {
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
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        cacNumber,
        businessType,
        websiteUrl,
        settlementAccount,
        directors
      } = req.body;

      // Update merchant information
      await merchant.update({
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        cacNumber,
        businessType,
        websiteUrl,
        settlementAccountNumber: settlementAccount.accountNumber,
        settlementBankCode: settlementAccount.bankCode,
        settlementAccountName: settlementAccount.accountName,
        kycStatus: 'submitted',
        kycSubmittedAt: new Date(),
        onboardingStatus: 'submitted'
      });

      // Create/update directors
      if (directors && directors.length > 0) {
        // Remove existing directors
        await Director.destroy({ where: { merchantId: merchant.id } });

        // Create new directors
        const directorPromises = directors.map(director =>
          Director.create({
            merchantId: merchant.id,
            fullName: director.fullName,
            bvn: director.bvn,
            phone: director.phone,
            email: director.email,
            ownershipPercentage: director.ownershipPercentage
          })
        );

        await Promise.all(directorPromises);
      }

      res.json({
        success: true,
        data: merchant,
        message: 'KYC information submitted successfully'
      });
    } catch (error) {
      console.error('KYC submission error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit KYC information'
        }
      });
    }
  },

  // Upload KYC document
  async uploadKYCDocument(req, res) {
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

      const { documentType } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Document file is required'
          }
        });
      }

      // Resolve file URL: if using in-memory storage, upload to Cloudinary
      let fileUrl = file.location || file.path;
      if (!fileUrl && file.buffer) {
        const uploadResult = await new Promise((resolve, reject) => {
          const upload = cloudinary.uploader.upload_stream(
            { folder: 'kyc_documents', resource_type: 'auto' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          upload.end(file.buffer);
        });
        fileUrl = uploadResult.secure_url;
      }

      if (!fileUrl) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: 'Unable to process uploaded file'
          }
        });
      }

      // Create KYC document record
      const kycDocument = await KYCDocument.create({
        merchantId: merchant.id,
        documentType,
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        status: 'pending'
      });

      res.status(201).json({
        success: true,
        data: kycDocument,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload document'
        }
      });
    }
  },

  // Get merchant profile
  async getMerchantProfile(req, res) {
    try {
      const userId = req.user.id;
      const merchant = await Merchant.findOne({
        where: { userId },
        include: [
          {
            model: KYCDocument,
            as: 'kycDocuments'
          },
          {
            model: Director,
            as: 'directors'
          }
        ]
      });

      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Merchant account not found'
          }
        });
      }

      res.json({
        success: true,
        data: merchant
      });
    } catch (error) {
      console.error('Get merchant profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch merchant profile'
        }
      });
    }
  },

  // Update merchant profile
  async updateMerchantProfile(req, res) {
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
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        businessType,
        websiteUrl
      } = req.body;

      await merchant.update({
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        businessType,
        websiteUrl
      });

      res.json({
        success: true,
        data: merchant,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update merchant profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile'
        }
      });
    }
  },

  // Generate API key
  async generateAPIKey(req, res) {
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

      if (merchant.kycStatus !== 'approved') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'KYC must be approved to generate API key'
          }
        });
      }

      // Generate new API key
      const apiKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;

      await merchant.update({ apiKey });

      res.json({
        success: true,
        data: { apiKey },
        message: 'API key generated successfully'
      });
    } catch (error) {
      console.error('Generate API key error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate API key'
        }
      });
    }
  },

  // Get merchant statistics
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

      // Get transaction statistics (Transaction model is keyed by userId, not merchantId)
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
        attributes: ['id', 'reference', 'amount', 'status', 'type', 'createdAt']
      });

      res.json({
        success: true,
        data: {
          totalTransactions,
          completedTransactions,
          totalRevenue: totalRevenue || 0,
          pendingAmount: pendingAmount || 0,
          recentTransactions
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

  // Get all merchants (admin only)
  async getAllMerchants(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        kycStatus,
        onboardingStatus,
        search
      } = req.query;

      const whereClause = {};

      if (kycStatus) whereClause.kycStatus = kycStatus;
      if (onboardingStatus) whereClause.onboardingStatus = onboardingStatus;
      if (search) {
        whereClause[Op.or] = [
          { businessName: { [Op.iLike]: `%${search}%` } },
          { businessEmail: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Merchant.findAndCountAll({
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
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          merchants: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all merchants error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch merchants'
        }
      });
    }
  },

  // Approve merchant (admin only)
  async approveMerchant(req, res) {
    try {
      const { id } = req.params;
      const { approved } = req.body;

      const merchant = await Merchant.findByPk(id, {
        include: ['user']
      });

      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Merchant not found'
          }
        });
      }

      const updateData = {
        kycStatus: approved ? 'approved' : 'rejected',
        onboardingStatus: approved ? 'approved' : 'rejected'
      };

      if (approved) {
        updateData.kycApprovedAt = new Date();
        updateData.onboardingStatus = 'active';
        
        // Generate API key for approved merchant
        const apiKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
        updateData.apiKey = apiKey;

        // Send approval email
        await emailService.sendMerchantApprovalEmail({
          email: merchant.user.email,
          businessName: merchant.businessName,
          apiKey
        });
      }

      await merchant.update(updateData);

      res.json({
        success: true,
        data: merchant,
        message: `Merchant ${approved ? 'approved' : 'rejected'} successfully`
      });
    } catch (error) {
      console.error('Approve merchant error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process merchant approval'
        }
      });
    }
  }
};
