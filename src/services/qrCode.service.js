const QRCode = require('qrcode');
const { QRCode: QRCodeModel } = require('../models');

class QRCodeService {
  /**
   * Generate QR code data URL
   * @param {string} data - Data to encode in QR code
   * @param {Object} options - QR code options
   * @returns {Promise<string>} QR code data URL
   */
  async generateQRCodeDataURL(data, options = {}) {
    try {
      const defaultOptions = {
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      };

      const qrOptions = { ...defaultOptions, ...options };
      const qrDataURL = await QRCode.toDataURL(data, qrOptions);
      
      return qrDataURL;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code buffer
   * @param {string} data - Data to encode in QR code
   * @param {Object} options - QR code options
   * @returns {Promise<Buffer>} QR code buffer
   */
  async generateQRCodeBuffer(data, options = {}) {
    try {
      const defaultOptions = {
        type: 'png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      };

      const qrOptions = { ...defaultOptions, ...options };
      const qrBuffer = await QRCode.toBuffer(data, qrOptions);
      
      return qrBuffer;
    } catch (error) {
      console.error('QR code buffer generation error:', error);
      throw new Error('Failed to generate QR code buffer');
    }
  }

  /**
   * Create payment QR code for merchant
   * @param {Object} qrCodeData - QR code details
   * @returns {Promise<Object>} Created QR code
   */
  async createPaymentQRCode(qrCodeData) {
    try {
      const {
        merchantId,
        name,
        type,
        amount,
        description,
        usageLimit,
        expiresAt
      } = qrCodeData;

      // Generate payment URL
      const baseUrl = process.env.FRONTEND_URL || 'https://spleetpay.ng';
      const paymentUrl = `${baseUrl}/pay?type=${type}&merchant=${merchantId}`;
      
      if (amount) {
        paymentUrl += `&amount=${amount}`;
      }

      // Generate QR code data URL
      const qrDataURL = await this.generateQRCodeDataURL(paymentUrl);

      // Save QR code to database
      const qrCode = await QRCodeModel.create({
        merchantId,
        name,
        type,
        amount,
        description,
        isActive: true,
        usageLimit,
        expiresAt,
        qrData: qrDataURL
      });

      return {
        success: true,
        data: {
          id: qrCode.id,
          name: qrCode.name,
          type: qrCode.type,
          amount: qrCode.amount,
          description: qrCode.description,
          qrData: qrCode.qrData,
          paymentUrl,
          usageLimit: qrCode.usageLimit,
          usageCount: qrCode.usageCount,
          expiresAt: qrCode.expiresAt,
          createdAt: qrCode.createdAt
        }
      };
    } catch (error) {
      console.error('QR code creation error:', error);
      return {
        success: false,
        error: 'Failed to create QR code'
      };
    }
  }

  /**
   * Get QR code by ID
   * @param {string} qrCodeId - QR code ID
   * @returns {Promise<Object>} QR code data
   */
  async getQRCode(qrCodeId) {
    try {
      const qrCode = await QRCodeModel.findByPk(qrCodeId, {
        include: ['merchant']
      });

      if (!qrCode) {
        return {
          success: false,
          error: 'QR code not found'
        };
      }

      return {
        success: true,
        data: qrCode
      };
    } catch (error) {
      console.error('QR code retrieval error:', error);
      return {
        success: false,
        error: 'Failed to retrieve QR code'
      };
    }
  }

  /**
   * Get merchant's QR codes
   * @param {string} merchantId - Merchant ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} QR codes list
   */
  async getMerchantQRCodes(merchantId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        isActive = true
      } = filters;

      const whereClause = { merchantId };
      
      if (type) {
        whereClause.type = type;
      }
      
      if (isActive !== undefined) {
        whereClause.isActive = isActive;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await QRCodeModel.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return {
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
      };
    } catch (error) {
      console.error('Merchant QR codes retrieval error:', error);
      return {
        success: false,
        error: 'Failed to retrieve QR codes'
      };
    }
  }

  /**
   * Update QR code
   * @param {string} qrCodeId - QR code ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Update result
   */
  async updateQRCode(qrCodeId, updateData) {
    try {
      const qrCode = await QRCodeModel.findByPk(qrCodeId);

      if (!qrCode) {
        return {
          success: false,
          error: 'QR code not found'
        };
      }

      // Update QR code
      await qrCode.update(updateData);

      // If amount or type changed, regenerate QR code
      if (updateData.amount !== undefined || updateData.type !== undefined) {
        const baseUrl = process.env.FRONTEND_URL || 'https://spleetpay.ng';
        const paymentUrl = `${baseUrl}/pay?type=${qrCode.type}&merchant=${qrCode.merchantId}`;
        
        if (qrCode.amount) {
          paymentUrl += `&amount=${qrCode.amount}`;
        }

        const qrDataURL = await this.generateQRCodeDataURL(paymentUrl);
        await qrCode.update({ qrData: qrDataURL });
      }

      return {
        success: true,
        data: qrCode
      };
    } catch (error) {
      console.error('QR code update error:', error);
      return {
        success: false,
        error: 'Failed to update QR code'
      };
    }
  }

  /**
   * Deactivate QR code
   * @param {string} qrCodeId - QR code ID
   * @returns {Promise<Object>} Deactivation result
   */
  async deactivateQRCode(qrCodeId) {
    try {
      const qrCode = await QRCodeModel.findByPk(qrCodeId);

      if (!qrCode) {
        return {
          success: false,
          error: 'QR code not found'
        };
      }

      await qrCode.update({ isActive: false });

      return {
        success: true,
        message: 'QR code deactivated successfully'
      };
    } catch (error) {
      console.error('QR code deactivation error:', error);
      return {
        success: false,
        error: 'Failed to deactivate QR code'
      };
    }
  }

  /**
   * Increment QR code usage
   * @param {string} qrCodeId - QR code ID
   * @returns {Promise<Object>} Usage increment result
   */
  async incrementUsage(qrCodeId) {
    try {
      const qrCode = await QRCodeModel.findByPk(qrCodeId);

      if (!qrCode) {
        return {
          success: false,
          error: 'QR code not found'
        };
      }

      const newUsageCount = qrCode.usageCount + 1;

      // Check if usage limit is reached
      if (qrCode.usageLimit && newUsageCount >= qrCode.usageLimit) {
        await qrCode.update({ 
          usageCount: newUsageCount,
          isActive: false
        });
      } else {
        await qrCode.update({ usageCount: newUsageCount });
      }

      return {
        success: true,
        data: {
          usageCount: newUsageCount,
          isActive: qrCode.isActive
        }
      };
    } catch (error) {
      console.error('QR code usage increment error:', error);
      return {
        success: false,
        error: 'Failed to increment usage'
      };
    }
  }

  /**
   * Generate dynamic payment URL
   * @param {Object} paymentData - Payment data
   * @returns {string} Payment URL
   */
  generatePaymentURL(paymentData) {
    const {
      merchantId,
      type,
      amount,
      description,
      customerEmail,
      customerName,
      reference
    } = paymentData;

    const baseUrl = process.env.FRONTEND_URL || 'https://spleetpay.ng';
    const params = new URLSearchParams({
      type,
      merchant: merchantId
    });

    if (amount) params.append('amount', amount);
    if (description) params.append('description', description);
    if (customerEmail) params.append('email', customerEmail);
    if (customerName) params.append('name', customerName);
    if (reference) params.append('ref', reference);

    return `${baseUrl}/pay?${params.toString()}`;
  }
}

module.exports = new QRCodeService();
