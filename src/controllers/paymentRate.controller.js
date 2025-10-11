const { PaymentRate } = require('../models');

module.exports = {
  // Create new payment rates
  async createPaymentRate(req, res) {
    const {title, ratePercentage, slugType} = req.body;

    try{
      const paymentRates = await PaymentRate.create({
        title,
        slug:slugType,
        ratePercent: ratePercentage
      });

      return res.status(201).json({
        success: true,
        data: paymentRates,
        message: 'Payment rate created successfully'
      });
    }catch(error){
      console.error('Payment Rate Creation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment rate'
        }
      });
    }
  },

  // Update a payment rate
  async updatePaymentRate(req, res) {
    const { id } = req.params;
    const { title, ratePercentage, slugType } = req.body;

    try {
      const paymentRate = await PaymentRate.findByPk(id);
      if (!paymentRate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Payment rate not found'
          }
        });
      }

      paymentRate.title = title !== undefined ? title : paymentRate.title;
      paymentRate.slug = slugType !== undefined ? slugType : paymentRate.slug;
      paymentRate.ratePercent = ratePercentage !== undefined ? ratePercentage : paymentRate.ratePercent;

      await paymentRate.save();

      return res.json({
        success: true,
        data: paymentRate,
        message: 'Payment rate updated successfully'
      });
    } catch (error) {
      console.error('Payment Rate Update error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update payment rate'
        }
      });
    }
  },

  // Delete a payment rate
  async deletePaymentRate(req, res) {
    const { id } = req.params;
    try {
      const paymentRate = await PaymentRate.findByPk(id);
      if (!paymentRate) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Payment rate not found'
          }
        });
      }

      await paymentRate.destroy();

      return res.json({
        success: true,
        message: 'Payment rate deleted successfully'
      });
    } catch (error) {
      console.error('Payment Rate Deletion error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete payment rate'
        }
      });
    }
  },


}