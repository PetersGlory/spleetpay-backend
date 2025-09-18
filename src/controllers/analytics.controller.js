const analyticsService = require('../services/analytics.service');
const { Op } = require('sequelize');

module.exports = {
  // Get merchant dashboard analytics
  async getMerchantDashboard(req, res) {
    try {
      const merchantId = req.user.merchantId;
      
      if (!merchantId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Merchant ID required'
          }
        });
      }

      const {
        startDate,
        endDate
      } = req.query;

      const dateRange = {};
      if (startDate) dateRange.startDate = new Date(startDate);
      if (endDate) dateRange.endDate = new Date(endDate);

      const result = await analyticsService.getMerchantDashboardAnalytics(merchantId, dateRange);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ANALYTICS_FETCH_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get merchant dashboard error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard analytics'
        }
      });
    }
  },

  // Get admin dashboard analytics
  async getAdminDashboard(req, res) {
    try {
      const {
        startDate,
        endDate
      } = req.query;

      const dateRange = {};
      if (startDate) dateRange.startDate = new Date(startDate);
      if (endDate) dateRange.endDate = new Date(endDate);

      const result = await analyticsService.getAdminDashboardAnalytics(dateRange);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ANALYTICS_FETCH_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch admin dashboard analytics'
        }
      });
    }
  },

  // Get transaction analytics
  async getTransactionAnalytics(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        merchantId,
        startDate,
        endDate,
        status,
        type
      } = req.query;

      const filters = {
        page: parseInt(page),
        limit: parseInt(limit),
        merchantId: merchantId || req.user.merchantId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        type
      };

      const result = await analyticsService.getTransactionAnalytics(filters);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ANALYTICS_FETCH_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get transaction analytics error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transaction analytics'
        }
      });
    }
  },

  // Get revenue analytics
  async getRevenueAnalytics(req, res) {
    try {
      const {
        merchantId,
        startDate,
        endDate,
        groupBy = 'day'
      } = req.query;

      const filters = {
        merchantId: merchantId || req.user.merchantId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        groupBy
      };

      const result = await analyticsService.getRevenueAnalytics(filters);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ANALYTICS_FETCH_FAILED',
            message: result.error
          }
        });
      }

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get revenue analytics error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch revenue analytics'
        }
      });
    }
  },

  // Get custom report
  async generateReport(req, res) {
    try {
      const {
        reportType,
        startDate,
        endDate,
        merchantId,
        format = 'json'
      } = req.body;

      if (!reportType) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Report type is required'
          }
        });
      }

      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        merchantId: merchantId || req.user.merchantId
      };

      let result;

      switch (reportType) {
        case 'transactions':
          result = await analyticsService.getTransactionAnalytics(filters);
          break;
        case 'revenue':
          result = await analyticsService.getRevenueAnalytics(filters);
          break;
        case 'merchant_dashboard':
          result = await analyticsService.getMerchantDashboardAnalytics(filters.merchantId, filters);
          break;
        case 'admin_dashboard':
          result = await analyticsService.getAdminDashboardAnalytics(filters);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid report type'
            }
          });
      }

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'REPORT_GENERATION_FAILED',
            message: result.error
          }
        });
      }

      // In a real implementation, you might want to generate PDF/Excel reports
      // For now, we'll just return the JSON data
      res.json({
        success: true,
        data: {
          reportType,
          generatedAt: new Date().toISOString(),
          filters,
          data: result.data
        },
        message: 'Report generated successfully'
      });
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate report'
        }
      });
    }
  }
};
