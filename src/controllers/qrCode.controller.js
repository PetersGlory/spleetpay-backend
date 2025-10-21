const { QRCode, Merchant } = require('../models');
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
  }
};
