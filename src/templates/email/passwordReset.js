const layout = require('./layout');

module.exports = ({ firstName, resetUrl, expiryMinutes }) => {
  return layout(
    `
      <h2 style="margin-top:0;">Hello ${firstName},</h2>

      <p>
        We received a request to reset your password for your
        <strong>SpleetPay</strong> account.
      </p>

      <p>Click the button below to reset your password:</p>

      <p style="text-align:center; margin:25px 0;">
        <a href="${resetUrl}" class="button">
          Reset Password
        </a>
      </p>

      <p>
        If the button doesn’t work, copy and paste this link into your browser:
      </p>

      <p style="word-break:break-all;">
        <a href="${resetUrl}">${resetUrl}</a>
      </p>

      <div style="
        background:#FEF3CD;
        border:1px solid #F59E0B;
        padding:15px;
        border-radius:6px;
        margin:20px 0;
      ">
        <strong>Important:</strong>
        This link will expire in ${expiryMinutes} minutes for security reasons.
        If you don’t reset your password within this time,
        you’ll need to request a new reset link.
      </div>

      <p>
        If you didn’t request a password reset,
        please ignore this email. Your password will remain unchanged.
      </p>

      <p>
        For security reasons, never share this link with anyone.
      </p>

      <p style="margin-top:30px;">
        Best regards,<br/>
        <strong>The SpleetPay Team</strong>
      </p>
    `,
    {
      title: 'Password Reset Request',
      headerColor: '#EF4444'
    }
  );
};