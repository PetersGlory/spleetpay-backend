const layout = require('./layout');

module.exports = ({ name, email, temporaryPassword, role, dashboardUrl }) => {
  return layout(
    `
      <h2 style="margin-top:0;">
        🔐 Welcome to SpleetPay Admin, ${name}!
      </h2>

      <p>
        Your administrator account has been successfully created with the role of <strong>${role}</strong>.
      </p>

      <h3>Your Login Credentials</h3>

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
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
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
          <li>You must change your password on first login</li>
          <li>Keep your credentials secure and never share them</li>
          <li>Use strong, unique passwords for your account</li>
        </ul>
      </div>

      <h3>Getting Started</h3>
      <ol style="padding-left:20px; line-height:1.6;">
        <li>Log in to the admin dashboard using the credentials above</li>
        <li>Change your temporary password immediately</li>
        <li>Review your assigned permissions and role</li>
        <li>Familiarize yourself with the admin interface</li>
      </ol>

      <p style="margin-top:30px;">
        Welcome aboard!<br/>
        <strong>The SpleetPay Team</strong>
      </p>
    `,
    {
      title: 'Welcome to SpleetPay Admin',
      headerColor: '#1F2937'
    }
  );
};