const nodemailer = require('nodemailer');
const welcome = require('../templates/email/welcome');
const paymentRequest = require('../templates/email/paymentRequest');
const paymentConfirmation = require('../templates/email/paymentConfirmation');
const passwordReset = require('../templates/email/passwordReset');
const merchantApproval = require('../templates/email/merchantApproval');
const adminWelcome = require('../templates/email/adminWelcome');
const adminPasswordReset = require('../templates/email/adminPasswordReset');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g. mail.spleetpay.ng
      port: 465,
      secure: true, // MUST be true for 465
      auth: {
        user: `${process.env.SMTP_USER}`,
        pass: process.env.SMTP_PASS
      }
    });

    this.fromEmail = process.env.FROM_EMAIL ?? 'no-reply@spleetpay.ng';
    this.fromName = process.env.FROM_NAME ?? 'SpleetPay';

    this.transporter.verify()
      .then(() => console.log('SMTP Ready'))
      .catch(err => console.error('SMTP Error:', err));
  }

  /**
   * Send email
   * @param {Object} emailData - Email details
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(emailData) {
    try {
      const {
        to,
        subject,
        html,
        text,
        attachments = []
      } = emailData;

      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        text,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: 'Failed to send email'
      };
    }
  }

  /**
   * Send welcome email to new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Send result
   */
  async sendWelcomeEmail(userData) {
    const { email, firstName } = userData;
    
    const appUrl = `${process.env.FRONTEND_URL}`;

    const html = welcome({
      firstName,
      appUrl: appUrl
    });

    return await this.sendEmail({
      to: email,
      subject: 'Welcome to SpleetPay - Get Started!',
      html
    });
  }

  /**
   * Send payment request email
   * @param {Object} paymentData - Payment request data
   * @returns {Promise<Object>} Send result
   */
  async sendPaymentRequestEmail(paymentData) {
    const { 
      contributorEmail, 
      contributorName, 
      amount, 
      currency, 
      description, 
      paymentUrl,
      merchantName,
      expiresAt 
    } = paymentData;
    
    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN'
    }).format(amount);

    const html = paymentRequest({
      contributorName,
      formattedAmount,
      description,
      paymentUrl,
      merchantName,
      expiresAt
    });

    return await this.sendEmail({
      to: contributorEmail,
      subject: `Payment Request: ${formattedAmount} from ${merchantName}`,
      html
    });
  }

  /**
   * Send payment confirmation email
   * @param {Object} confirmationData - Payment confirmation data
   * @returns {Promise<Object>} Send result
   */
  async sendPaymentConfirmationEmail(confirmationData) {
    const { 
      email, 
      name, 
      amount, 
      currency, 
      description, 
      reference,
      merchantName 
    } = confirmationData;
    
    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN'
    }).format(amount);

    const html = paymentConfirmation({
      name,
      formattedAmount,
      description,
      reference,
      merchantName,
      date: new Date().toLocaleDateString()
    });

    return await this.sendEmail({
      to: email,
      subject: `Payment Confirmation: ${formattedAmount}`,
      html
    });
  }

  /**
   * Send password reset email
   * @param {Object} resetData - Password reset data
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordResetEmail(resetData) {
    const { email, firstName, resetToken } = resetData;
    
    const expiryMinutes = 30; // or 15 or whatever you use

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = passwordReset({
      firstName,
      resetUrl,
      expiryMinutes
    });

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your SpleetPay Password',
      html
    });
  }

  /**
   * Send merchant approval email
   * @param {Object} approvalData - Merchant approval data
   * @returns {Promise<Object>} Send result
   */
  async sendMerchantApprovalEmail(approvalData) {
    const { email, businessName, apiKey } = approvalData;
    
    const html = merchantApproval({
      businessName,
      apiKey,
      dashboardUrl: process.env.MERCHANT_DASHBOARD_URL
    });

    return await this.sendEmail({
      to: email,
      subject: '🎉 Your SpleetPay Merchant Account Has Been Approved!',
      html
    });
  }

  /**
   * Send admin welcome email
   * @param {Object} adminData - Admin data
   * @returns {Promise<Object>} Send result
   */
  async sendAdminWelcomeEmail(adminData) {
    const { email, name, temporaryPassword, role } = adminData;
    const dashboardUrl = process.env.ADMIN_DASHBOARD_URL;

    
    const html = adminWelcome({
      name,
      email,
      temporaryPassword,
      role,
      dashboardUrl
    });

    return await this.sendEmail({
      to: email,
      subject: 'Welcome to SpleetPay Admin - Account Created',
      html
    });
  }

  /**
   * Send admin password reset email
   * @param {Object} adminData - Admin data
   * @returns {Promise<Object>} Send result
   */
  async sendAdminPasswordResetEmail(adminData) {
    const { email, name, temporaryPassword } = adminData;
    const dashboardUrl = process.env.ADMIN_DASHBOARD_URL;

    const html = adminPasswordReset({
      name,
      email,
      temporaryPassword,
      dashboardUrl
    });

    return await this.sendEmail({
      to: email,
      subject: 'Password Reset - SpleetPay Admin',
      html
    });
  }
}

module.exports = new EmailService();
