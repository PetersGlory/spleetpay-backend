const layout = require('./layout');

module.exports = ({ name, email, temporaryPassword, dashboardUrl }) => {
  return layout(
    `
      <h2 style="margin-top:0;">
        🔒 Password Reset Request
      </h2>

      <p>
        Hello ${name}, your administrator password has been reset by a system administrator.
        Please use the new temporary password below to log in.
      </p>

      <h3>Your New Login Credentials</h3>

      <div style="
        background:#F3F4F6;
        padding:15px;
        border-radius:6px;
        margin:20px 0;
        font-family:monospace;
        word-break:break-all;
        font-size:14px;
      ">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>New Temporary Password:</strong> ${temporaryPassword}</p>
      </div>

      ${
        dashboardUrl
          ? `<p style="text-align:center; margin:25px 0;">
              <a href="${dashboardUrl}" class="button">
                Login to Admin Dashboard
              </a>
            </p>`
          : ''
      }

      <div style="
        background:#FEF3C7;
        border:1px solid #F59E0B;
        padding:15px;
        border-radius:6px;
        margin:20px 0;
      ">
        <p><strong>⚠️ Important Security Notice:</strong></p>
        <ul style="padding-left:20px; line-height:1.6;">
          <li>This is a temporary password that expires in 24 hours</li>
          <li>You must change your password on next login</li>
          <li>If you did not request this reset, contact the system administrator immediately</li>
          <li>Keep your new credentials secure</li>
        </ul>
      </div>

      <h3>Next Steps</h3>
      <ol style="padding-left:20px; line-height:1.6;">
        <li>Log in to the admin dashboard using the new credentials</li>
        <li>Change your temporary password to a secure one</li>
        <li>Consider enabling two-factor authentication for added security</li>
      </ol>

      <p style="margin-top:30px;">
        Best regards,<br/>
        <strong>The SpleetPay Team</strong>
      </p>
    `,
    {
      title: 'Password Reset - SpleetPay Admin',
      headerColor: '#DC2626'
    }
  );
};