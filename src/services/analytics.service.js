const { 
  Transaction, 
  Merchant, 
  User, 
  Settlement,
  GroupSplitContributor,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');

class AnalyticsService {
  /**
   * Get dashboard analytics for merchants
   * @param {string} merchantId - Merchant ID
   * @param {Object} dateRange - Date range filter
   * @returns {Promise<Object>} Dashboard analytics
   */
  async getMerchantDashboardAnalytics(merchantId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const whereClause = { merchantId };
      
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = startDate;
        if (endDate) whereClause.createdAt[Op.lte] = endDate;
      }

      // Get transaction statistics
      const [
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        failedTransactions,
        totalRevenue,
        totalFees
      ] = await Promise.all([
        Transaction.count({ where: whereClause }),
        Transaction.count({ where: { ...whereClause, status: 'completed' } }),
        Transaction.count({ where: { ...whereClause, status: 'pending' } }),
        Transaction.count({ where: { ...whereClause, status: 'failed' } }),
        Transaction.sum('amount', { where: { ...whereClause, status: 'completed' } }),
        Transaction.sum('merchantFee', { where: { ...whereClause, status: 'completed' } })
      ]);

      // Get transaction types breakdown
      const transactionTypes = await Transaction.findAll({
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
        ],
        where: whereClause,
        group: ['type']
      });

      // Get recent transactions
      const recentTransactions = await Transaction.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: ['id', 'reference', 'type', 'amount', 'status', 'createdAt', 'customerName']
      });

      // Get monthly revenue trend (last 12 months)
      const monthlyRevenue = await Transaction.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
          [sequelize.fn('SUM', sequelize.col('merchantFee')), 'fees']
        ],
        where: {
          ...whereClause,
          status: 'completed',
          createdAt: {
            [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']]
      });

      // Calculate success rate
      const successRate = totalTransactions > 0 
        ? ((completedTransactions / totalTransactions) * 100).toFixed(2)
        : 0;

      // Calculate average transaction value
      const averageTransactionValue = completedTransactions > 0
        ? (totalRevenue / completedTransactions).toFixed(2)
        : 0;

      return {
        success: true,
        data: {
          overview: {
            totalTransactions,
            completedTransactions,
            pendingTransactions,
            failedTransactions,
            totalRevenue: totalRevenue || 0,
            totalFees: totalFees || 0,
            netRevenue: (totalRevenue || 0) - (totalFees || 0),
            successRate: parseFloat(successRate),
            averageTransactionValue: parseFloat(averageTransactionValue)
          },
          transactionTypes: transactionTypes.map(type => ({
            type: type.type,
            count: parseInt(type.dataValues.count),
            totalAmount: parseFloat(type.dataValues.totalAmount) || 0
          })),
          recentTransactions,
          monthlyRevenue: monthlyRevenue.map(month => ({
            month: month.dataValues.month,
            transactionCount: parseInt(month.dataValues.transactionCount),
            revenue: parseFloat(month.dataValues.revenue) || 0,
            fees: parseFloat(month.dataValues.fees) || 0
          }))
        }
      };
    } catch (error) {
      console.error('Merchant dashboard analytics error:', error);
      return {
        success: false,
        error: 'Failed to fetch dashboard analytics'
      };
    }
  }

  /**
   * Get admin dashboard analytics
   * @param {Object} dateRange - Date range filter
   * @returns {Promise<Object>} Admin dashboard analytics
   */
  async getAdminDashboardAnalytics(dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const whereClause = {};
      
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = startDate;
        if (endDate) whereClause.createdAt[Op.lte] = endDate;
      }

      // Get platform-wide statistics
      const [
        totalUsers,
        totalMerchants,
        activeMerchants,
        totalTransactions,
        completedTransactions,
        totalRevenue,
        totalFees,
        pendingSettlements
      ] = await Promise.all([
        User.count({ where: whereClause }),
        Merchant.count({ where: whereClause }),
        Merchant.count({ where: { ...whereClause, kycStatus: 'approved' } }),
        Transaction.count({ where: whereClause }),
        Transaction.count({ where: { ...whereClause, status: 'completed' } }),
        Transaction.sum('amount', { where: { ...whereClause, status: 'completed' } }),
        Transaction.sum('gatewayFee', { where: { ...whereClause, status: 'completed' } }),
        Settlement.count({ where: { status: 'pending' } })
      ]);

      // Get transaction types breakdown
      const transactionTypes = await Transaction.findAll({
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
        ],
        where: whereClause,
        group: ['type']
      });

      // Get merchant performance (top 10)
      // Fix MySQL error: group by must use column names as they exist in the DB (snake_case), not model field names (camelCase)
      // Also, use correct include syntax for the merchant association
      const topMerchants = await Transaction.findAll({
        attributes: [
          'merchantId',
          [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'transactionCount'],
          [sequelize.fn('SUM', sequelize.col('Transaction.amount')), 'totalRevenue']
        ],
        where: { ...whereClause, status: 'completed' },
        include: [{
          model: Merchant,
          as: 'merchant',
          attributes: ['businessName'],
          required: true
        }],
        group: ['Transaction.merchant_id', 'merchant.id'],
        order: [[sequelize.fn('SUM', sequelize.col('Transaction.amount')), 'DESC']],
        limit: 10
      });

      // Get daily transaction volume (last 30 days)
      const dailyVolume = await Transaction.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'volume']
        ],
        where: {
          ...whereClause,
          status: 'completed',
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
      });

      // Get KYC status breakdown
      const kycStatusBreakdown = await Merchant.findAll({
        attributes: [
          'kycStatus',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: whereClause,
        group: ['kycStatus']
      });

      return {
        success: true,
        data: {
          overview: {
            totalUsers,
            totalMerchants,
            activeMerchants,
            totalTransactions,
            completedTransactions,
            totalRevenue: totalRevenue || 0,
            totalFees: totalFees || 0,
            pendingSettlements,
            successRate: totalTransactions > 0 
              ? ((completedTransactions / totalTransactions) * 100).toFixed(2)
              : 0
          },
          transactionTypes: transactionTypes.map(type => ({
            type: type.type,
            count: parseInt(type.dataValues.count),
            totalAmount: parseFloat(type.dataValues.totalAmount) || 0
          })),
          topMerchants: topMerchants.map(merchant => ({
            merchantId: merchant.merchantId,
            businessName: merchant.merchant?.businessName,
            transactionCount: parseInt(merchant.dataValues.transactionCount),
            totalRevenue: parseFloat(merchant.dataValues.totalRevenue) || 0
          })),
          dailyVolume: dailyVolume.map(day => ({
            date: day.dataValues.date,
            transactionCount: parseInt(day.dataValues.transactionCount),
            volume: parseFloat(day.dataValues.volume) || 0
          })),
          kycStatusBreakdown: kycStatusBreakdown.map(status => ({
            status: status.kycStatus,
            count: parseInt(status.dataValues.count)
          }))
        }
      };
    } catch (error) {
      console.error('Admin dashboard analytics error:', error);
      return {
        success: false,
        error: 'Failed to fetch admin dashboard analytics'
      };
    }
  }

  /**
   * Get transaction analytics with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Transaction analytics
   */
  async getTransactionAnalytics(filters = {}) {
    try {
      const {
        merchantId,
        startDate,
        endDate,
        status,
        type,
        page = 1,
        limit = 20
      } = filters;

      const whereClause = {};
      
      if (merchantId) whereClause.merchantId = merchantId;
      if (status) whereClause.status = status;
      if (type) whereClause.type = type;
      
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = startDate;
        if (endDate) whereClause.createdAt[Op.lte] = endDate;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Transaction.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [{
          association: 'merchant',
          attributes: ['businessName'],
          required: false
        }]
      });

      // Get summary statistics
      const summary = await Transaction.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
          [sequelize.fn('AVG', sequelize.col('amount')), 'averageAmount']
        ],
        where: whereClause
      });

      return {
        success: true,
        data: {
          transactions: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          },
          summary: {
            totalCount: parseInt(summary[0]?.dataValues.totalCount) || 0,
            totalAmount: parseFloat(summary[0]?.dataValues.totalAmount) || 0,
            averageAmount: parseFloat(summary[0]?.dataValues.averageAmount) || 0
          }
        }
      };
    } catch (error) {
      console.error('Transaction analytics error:', error);
      return {
        success: false,
        error: 'Failed to fetch transaction analytics'
      };
    }
  }

  /**
   * Get revenue analytics
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Revenue analytics
   */
  async getRevenueAnalytics(filters = {}) {
    try {
      const {
        merchantId,
        startDate,
        endDate,
        groupBy = 'day' // day, week, month
      } = filters;

      const whereClause = {
        status: 'completed'
      };
      
      if (merchantId) whereClause.merchantId = merchantId;
      
      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt[Op.gte] = startDate;
        if (endDate) whereClause.createdAt[Op.lte] = endDate;
      }

      let dateTrunc;
      switch (groupBy) {
        case 'week':
          dateTrunc = sequelize.fn('DATE_TRUNC', 'week', sequelize.col('createdAt'));
          break;
        case 'month':
          dateTrunc = sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'));
          break;
        default:
          dateTrunc = sequelize.fn('DATE', sequelize.col('createdAt'));
      }

      const revenueData = await Transaction.findAll({
        attributes: [
          [dateTrunc, 'period'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
          [sequelize.fn('SUM', sequelize.col('merchantFee')), 'merchantFees'],
          [sequelize.fn('SUM', sequelize.col('gatewayFee')), 'gatewayFees']
        ],
        where: whereClause,
        group: [dateTrunc],
        order: [[dateTrunc, 'ASC']]
      });

      return {
        success: true,
        data: revenueData.map(period => ({
          period: period.dataValues.period,
          transactionCount: parseInt(period.dataValues.transactionCount),
          revenue: parseFloat(period.dataValues.revenue) || 0,
          merchantFees: parseFloat(period.dataValues.merchantFees) || 0,
          gatewayFees: parseFloat(period.dataValues.gatewayFees) || 0,
          netRevenue: (parseFloat(period.dataValues.revenue) || 0) - 
                     (parseFloat(period.dataValues.merchantFees) || 0) - 
                     (parseFloat(period.dataValues.gatewayFees) || 0)
        }))
      };
    } catch (error) {
      console.error('Revenue analytics error:', error);
      return {
        success: false,
        error: 'Failed to fetch revenue analytics'
      };
    }
  }
}

module.exports = new AnalyticsService();
