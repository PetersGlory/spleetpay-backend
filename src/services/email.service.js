const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.fromEmail = process.env.FROM_EMAIL || 'noreply@spleetpay.ng';
    this.fromName = process.env.FROM_NAME || 'SpleetPay';
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
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to SpleetPay</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1434A4; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #1434A4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SpleetPay!</h1>
          </div>
          <div class="content">
            <h2>Hi ${firstName},</h2>
            <p>Your account is all set! You're now ready to start making payments and splitting bills with SpleetPay.</p>
            
            <p>Click the button below to open the app and get started:</p>
            
            <a href="${appUrl}" class="button">Open SpleetPay</a>
            
            <p>What you can do with SpleetPay:</p>
            <ul>
              <li>💳 Request payments from friends and family</li>
              <li>👥 Split bills and group expenses easily</li>
              <li>📊 Track all your transactions in one place</li>
              <li>🔒 Enjoy secure and fast payments</li>
            </ul>
            
            <p>Start by creating a payment request or initiating a group split - it's quick and simple!</p>
            
            <p>If you have any questions or need help, our support team is here for you.</p>
            
            <p>Happy splitting!<br>The SpleetPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 SpleetPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

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

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Request from ${merchantName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1434A4; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #1434A4; text-align: center; margin: 20px 0; }
          .button { background: #1434A4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${contributorName},</h2>
            <p>You have received a payment request from <strong>${merchantName}</strong>.</p>
            
            <div class="payment-details">
              <div class="amount">${formattedAmount}</div>
              <p><strong>Description:</strong> ${description}</p>
              ${expiresAt ? `<p><strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString()}</p>` : ''}
            </div>
            
            <p>Click the button below to make your payment securely:</p>
            
            <a href="${paymentUrl}" class="button">Pay Now</a>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="${paymentUrl}">${paymentUrl}</a></p>
            
            <p>This payment is processed securely through SpleetPay. Your payment information is encrypted and protected.</p>
            
            <p>If you didn't expect this payment request, please ignore this email.</p>
            
            <p>Best regards,<br>The SpleetPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 SpleetPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

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

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Successful!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your payment has been processed successfully.</p>
            
            <div class="payment-details">
              <div class="amount">${formattedAmount}</div>
              <p><strong>To:</strong> ${merchantName}</p>
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Thank you for using SpleetPay for your payment. You can view your transaction history in your account dashboard.</p>
            
            <p>If you have any questions about this transaction, please contact our support team.</p>
            
            <p>Best regards,<br>The SpleetPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 SpleetPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

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
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #FEF3CD; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>We received a request to reset your password for your SpleetPay account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            
            <div class="warning">
              <p><strong>Important:</strong> This link will expire in 1 hour for security reasons. If you don't reset your password within this time, you'll need to request a new reset link.</p>
            </div>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>For security reasons, never share this link with anyone.</p>
            
            <p>Best regards,<br>The SpleetPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 SpleetPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

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
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Merchant Account Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .api-key { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace; word-break: break-all; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <h2>Your Merchant Account Has Been Approved</h2>
          </div>
          <div class="content">
            <h3>Hello ${businessName} Team,</h3>
            <p>Great news! Your merchant account has been successfully approved and is now active on SpleetPay.</p>
            
            <h4>Your API Key:</h4>
            <div class="api-key">${apiKey}</div>
            
            <p><strong>Important:</strong> Keep your API key secure and never share it publicly. You can use this key to integrate SpleetPay's payment services into your application.</p>
            
            <h4>What's Next?</h4>
            <ul>
              <li>Access your merchant dashboard to manage your account</li>
              <li>Integrate our payment APIs using your API key</li>
              <li>Start accepting payments from your customers</li>
              <li>Monitor your transactions and settlements</li>
            </ul>
            
            <p>You can now start accepting both "Pay-for-Me" and "Group Split" payments from your customers.</p>
            
            <p>If you have any questions or need assistance with integration, please contact our support team.</p>
            
            <p>Welcome to the SpleetPay merchant community!</p>
            
            <p>Best regards,<br>The SpleetPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 SpleetPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

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
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to SpleetPay Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1F2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .password { font-family: monospace; font-size: 18px; font-weight: bold; color: #DC2626; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Welcome to SpleetPay Admin</h1>
            <h2>Your Administrator Account Has Been Created</h2>
          </div>
          <div class="content">
            <h3>Hello ${name},</h3>
            <p>Welcome to the SpleetPay admin team! Your administrator account has been successfully created with the role of <strong>${role}</strong>.</p>
            
            <div class="credentials">
              <h4>Your Login Credentials:</h4>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <span class="password">${temporaryPassword}</span></p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important Security Notice:</strong></p>
              <ul>
                <li>This is a temporary password that expires in 24 hours</li>
                <li>You must change your password on first login</li>
                <li>Keep your credentials secure and never share them</li>
                <li>Use strong, unique passwords for your account</li>
              </ul>
            </div>
            
            <h4>Getting Started:</h4>
            <ol>
              <li>Log in to the admin dashboard using the credentials above</li>
              <li>Change your temporary password immediately</li>
              <li>Review your assigned permissions and role</li>
              <li>Familiarize yourself with the admin interface</li>
            </ol>
            
            <p>If you have any questions or need assistance, please contact the system administrator.</p>
            
            <p>Welcome aboard!</p>
            
            <p>Best regards,<br>The SpleetPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 SpleetPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

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
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - SpleetPay Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .credentials { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .password { font-family: monospace; font-size: 18px; font-weight: bold; color: #DC2626; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
            <h2>Your Admin Password Has Been Reset</h2>
          </div>
          <div class="content">
            <h3>Hello ${name},</h3>
            <p>Your administrator password has been reset by a system administrator. Please use the new temporary password below to log in.</p>
            
            <div class="credentials">
              <h4>Your New Login Credentials:</h4>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>New Temporary Password:</strong> <span class="password">${temporaryPassword}</span></p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important Security Notice:</strong></p>
              <ul>
                <li>This is a temporary password that expires in 24 hours</li>
                <li>You must change your password on next login</li>
                <li>If you did not request this reset, contact the system administrator immediately</li>
                <li>Keep your new credentials secure</li>
              </ul>
            </div>
            
            <h4>Next Steps:</h4>
            <ol>
              <li>Log in to the admin dashboard using the new credentials</li>
              <li>Change your temporary password to a secure one</li>
              <li>Consider enabling two-factor authentication for added security</li>
            </ol>
            
            <p>If you have any questions or concerns, please contact the system administrator.</p>
            
            <p>Best regards,<br>The SpleetPay Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 SpleetPay. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Password Reset - SpleetPay Admin',
      html
    });
  }
}

module.exports = new EmailService();
