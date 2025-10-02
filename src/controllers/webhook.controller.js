const paymentService = require('../services/payment.service');
const webSocketService = require('../services/websocket.service');
const walletController = require('./wallet.controller');
const { Transaction, PaymentRequest, SplitParticipant, WalletTransaction, GroupSplitContributor } = require('../models');

module.exports = {
  // Handle Paystack webhooks
  async handlePaystackWebhook(req, res) {
    try {
      const signature = req.headers['x-paystack-signature'];
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      const isValidSignature = paymentService.verifyWebhookSignature(payload, signature);
      
      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Invalid webhook signature'
          }
        });
      }

      const { event, data } = req.body;

      // Process webhook event
      const result = await paymentService.processWebhookEvent({ event, data });

      if (!result.success) {
        console.error('Webhook processing failed:', result.error);
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEBHOOK_PROCESSING_FAILED',
            message: result.error
          }
        });
      }

      // Handle specific events for real-time updates
      if (event === 'charge.success') {
        // Find transaction and emit update
        const transaction = await Transaction.findOne({
          where: { providerTransactionId: data.reference },
          include: [
            { association: 'paymentRequest' },
            { association: 'participant' }
          ]
        });

        if (transaction) {
          // Credit user wallet
          await walletController.creditWallet(
            transaction.userId,
            transaction.amount,
            transaction.currency,
            `Payment received from ${transaction.participant?.name || 'participant'}`,
            transaction.id
          );

          // Update participant payment status if it's a group split
          if (transaction.participantId) {
            await SplitParticipant.update(
              { 
                hasPaid: true, 
                paidAmount: transaction.amount,
                paidAt: new Date(),
                paymentMethod: transaction.paymentMethod
              },
              { where: { id: transaction.participantId } }
            );
          }

          // Update transaction status
          await transaction.update({ status: 'completed' });

          webSocketService.emitTransactionUpdate({
            transactionId: transaction.id,
            paymentRequestId: transaction.paymentRequestId,
            participantId: transaction.participantId,
            status: 'completed',
            amountPaid: transaction.amount,
            totalCollected: await this.getTotalCollected(transaction.paymentRequestId)
          });
        }
      } else if (event === 'charge.failed') {
        // Handle failed payment
        const transaction = await Transaction.findOne({
          where: { reference: data.reference }
        });

        if (transaction) {
          await transaction.update({
            status: 'failed',
            pspResponse: data
          });

          webSocketService.emitTransactionUpdate({
            transaction,
            merchantId: transaction.merchantId
          });
        }
      }

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      console.error('Webhook handling error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Webhook processing failed'
        }
      });
    }
  },

  // Handle settlement status webhooks
  async handleSettlementWebhook(req, res) {
    try {
      const { settlementId, status, reference } = req.body;

      if (!settlementId || !status) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Settlement ID and status are required'
          }
        });
      }

      // Update settlement status in database
      // This would typically update the Settlement model
      console.log('Settlement webhook received:', { settlementId, status, reference });

      // Emit real-time notification
      webSocketService.emitSettlementUpdate({
        settlement: {
          id: settlementId,
          status,
          reference
        }
      });

      res.json({
        success: true,
        message: 'Settlement webhook processed successfully'
      });
    } catch (error) {
      console.error('Settlement webhook error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Settlement webhook processing failed'
        }
      });
    }
  },

  // Handle group split payment notifications
  async handleGroupSplitPayment(req, res) {
    try {
      const { transactionId, contributorId, amount, reference } = req.body;

      if (!transactionId || !contributorId || !amount) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Transaction ID, contributor ID, and amount are required'
          }
        });
      }

      // Find the contributor
      const contributor = await GroupSplitContributor.findOne({
        where: { id: contributorId, transactionId }
      });

      if (!contributor) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Contributor not found'
          }
        });
      }

      // Update contributor status
      await contributor.update({
        status: 'paid',
        paidAt: new Date(),
        paymentReference: reference
      });

      // Check if all contributors have paid
      const transaction = await Transaction.findByPk(transactionId, {
        include: [{ association: 'contributors' }]
      });

      const remainingContributors = await GroupSplitContributor.count({
        where: { 
          transactionId,
          status: 'pending'
        }
      });

      // Update transaction status
      if (remainingContributors === 0) {
        await transaction.update({ status: 'completed' });
      } else {
        await transaction.update({ status: 'partial' });
      }

      // Emit real-time notification
      webSocketService.emitPaymentReceived({
        transaction,
        contributorId,
        merchantId: transaction.merchantId,
        amount
      });

      res.json({
        success: true,
        message: 'Group split payment processed successfully'
      });
    } catch (error) {
      console.error('Group split payment webhook error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Group split payment processing failed'
        }
      });
    }
  },

  // Helper method to get total collected for a payment request
  async getTotalCollected(paymentRequestId) {
    const transactions = await Transaction.findAll({
      where: {
        paymentRequestId,
        status: 'completed'
      }
    });
    
    return transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  }
};
