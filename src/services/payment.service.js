const axios = require('axios');
const crypto = require('crypto');
const { Transaction, GroupSplitContributor } = require('../models');

class PaymentService {
  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    this.paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY;
    this.baseURL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Initialize a payment transaction with Paystack
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Paystack response
   */
  async initializePayment(paymentData) {
    try {
      const {
        email,
        amount,
        reference,
        metadata = {},
        callback_url,
        currency = 'NGN'
      } = paymentData;

      const requestData = {
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference,
        metadata,
        currency,
        callback_url
      };

      const response = await this.axiosInstance.post('/transaction/initialize', requestData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initialization failed'
      };
    }
  }

  /**
   * Verify a payment transaction
   * @param {string} reference - Transaction reference
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(reference) {
    try {
      const response = await this.axiosInstance.get(`/transaction/verify/${reference}`);
      
      if (response.data.status && response.data.data.status === 'success') {
        return {
          success: true,
          data: response.data.data,
          verified: true
        };
      } else {
        return {
          success: false,
          verified: false,
          data: response.data.data
        };
      }
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      return {
        success: false,
        verified: false,
        error: error.response?.data?.message || 'Payment verification failed'
      };
    }
  }

  /**
   * Process refund
   * @param {Object} refundData - Refund details
   * @returns {Promise<Object>} Refund result
   */
  async processRefund(refundData) {
    try {
      const {
        transaction_reference,
        amount,
        reason,
        currency = 'NGN'
      } = refundData;

      const requestData = {
        transaction: transaction_reference,
        amount: Math.round(amount * 100), // Convert to kobo
        currency,
        reason
      };

      const response = await this.axiosInstance.post('/refund', requestData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Paystack refund error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Refund processing failed'
      };
    }
  }

  /**
   * Create transfer recipient
   * @param {Object} recipientData - Recipient details
   * @returns {Promise<Object>} Recipient creation result
   */
  async createTransferRecipient(recipientData) {
    try {
      const {
        type = 'nuban',
        name,
        account_number,
        bank_code,
        currency = 'NGN'
      } = recipientData;

      const requestData = {
        type,
        name,
        account_number,
        bank_code,
        currency
      };

      const response = await this.axiosInstance.post('/transferrecipient', requestData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Paystack recipient creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Recipient creation failed'
      };
    }
  }

  /**
   * Process transfer
   * @param {Object} transferData - Transfer details
   * @returns {Promise<Object>} Transfer result
   */
  async processTransfer(transferData) {
    try {
      const {
        source = 'balance',
        amount,
        recipient,
        reason,
        currency = 'NGN'
      } = transferData;

      const requestData = {
        source,
        amount: Math.round(amount * 100), // Convert to kobo
        recipient,
        reason,
        currency
      };

      const response = await this.axiosInstance.post('/transfer', requestData);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Paystack transfer error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Transfer processing failed'
      };
    }
  }

  /**
   * Get list of banks
   * @returns {Promise<Object>} Banks list
   */
  async getBanks() {
    try {
      const response = await this.axiosInstance.get('/bank?currency=NGN');
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Paystack banks error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch banks'
      };
    }
  }

  /**
   * Resolve bank account
   * @param {string} accountNumber - Account number
   * @param {string} bankCode - Bank code
   * @returns {Promise<Object>} Account resolution result
   */
  async resolveBankAccount(accountNumber, bankCode) {
    try {
      const response = await this.axiosInstance.get(`/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Paystack account resolution error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Account resolution failed'
      };
    }
  }

  /**
   * Generate transaction reference
   * @returns {string} Unique transaction reference
   */
  generateReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `SPL_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Verify webhook signature
   * @param {string} payload - Webhook payload
   * @param {string} signature - Webhook signature
   * @returns {boolean} Signature validity
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
        .update(payload, 'utf-8')
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Process webhook event
   * @param {Object} eventData - Webhook event data
   * @returns {Promise<Object>} Processing result
   */
  async processWebhookEvent(eventData) {
    try {
      const { event, data } = eventData;

      switch (event) {
        case 'charge.success':
          return await this.handleSuccessfulPayment(data);
        case 'charge.failed':
          return await this.handleFailedPayment(data);
        case 'transfer.success':
          return await this.handleSuccessfulTransfer(data);
        case 'transfer.failed':
          return await this.handleFailedTransfer(data);
        default:
          console.log(`Unhandled webhook event: ${event}`);
          return { success: true, message: 'Event received but not processed' };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        success: false,
        error: 'Webhook processing failed'
      };
    }
  }

  /**
   * Handle successful payment
   * @param {Object} paymentData - Payment data from webhook
   * @returns {Promise<Object>} Processing result
   */
  async handleSuccessfulPayment(paymentData) {
    try {
      const { reference, amount, status, customer } = paymentData;
      
      // Find transaction in database
      const transaction = await Transaction.findOne({ 
        where: { reference },
        include: ['contributors']
      });

      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      // Update transaction status
      await transaction.update({
        status: 'completed',
        gatewayReference: paymentData.transfer_code || paymentData.reference,
        pspResponse: paymentData,
        netAmount: (amount / 100) - transaction.gatewayFee - transaction.merchantFee
      });

      // If it's a group split, update contributor status
      if (transaction.type === 'group_split' && transaction.contributors) {
        // Find the specific contributor who made the payment
        const contributor = transaction.contributors.find(c => 
          c.email === customer.email || c.status === 'pending'
        );
        
        if (contributor) {
          await contributor.update({
            status: 'paid',
            paidAt: new Date(),
            paymentReference: reference
          });
        }

        // Check if all contributors have paid
        const remainingContributors = await GroupSplitContributor.count({
          where: { 
            transactionId: transaction.id,
            status: 'pending'
          }
        });

        if (remainingContributors === 0) {
          await transaction.update({ status: 'completed' });
        } else {
          await transaction.update({ status: 'partial' });
        }
      }

      return { 
        success: true, 
        message: 'Payment processed successfully',
        transactionId: transaction.id
      };
    } catch (error) {
      console.error('Successful payment handling error:', error);
      return { success: false, error: 'Failed to process successful payment' };
    }
  }

  /**
   * Handle failed payment
   * @param {Object} paymentData - Payment data from webhook
   * @returns {Promise<Object>} Processing result
   */
  async handleFailedPayment(paymentData) {
    try {
      const { reference } = paymentData;
      
      // Find transaction in database
      const transaction = await Transaction.findOne({ where: { reference } });

      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      // Update transaction status
      await transaction.update({
        status: 'failed',
        pspResponse: paymentData
      });

      return { 
        success: true, 
        message: 'Failed payment processed',
        transactionId: transaction.id
      };
    } catch (error) {
      console.error('Failed payment handling error:', error);
      return { success: false, error: 'Failed to process failed payment' };
    }
  }

  /**
   * Handle successful transfer (settlement)
   * @param {Object} transferData - Transfer data from webhook
   * @returns {Promise<Object>} Processing result
   */
  async handleSuccessfulTransfer(transferData) {
    try {
      // Update settlement status in database
      // This would typically update the Settlement model
      console.log('Successful transfer:', transferData);
      
      return { 
        success: true, 
        message: 'Transfer processed successfully'
      };
    } catch (error) {
      console.error('Successful transfer handling error:', error);
      return { success: false, error: 'Failed to process successful transfer' };
    }
  }

  /**
   * Handle failed transfer
   * @param {Object} transferData - Transfer data from webhook
   * @returns {Promise<Object>} Processing result
   */
  async handleFailedTransfer(transferData) {
    try {
      // Update settlement status in database
      console.log('Failed transfer:', transferData);
      
      return { 
        success: true, 
        message: 'Failed transfer processed'
      };
    } catch (error) {
      console.error('Failed transfer handling error:', error);
      return { success: false, error: 'Failed to process failed transfer' };
    }
  }
}

module.exports = new PaymentService();
