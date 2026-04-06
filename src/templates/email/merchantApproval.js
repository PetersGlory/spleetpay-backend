const layout = require('./layout');

module.exports = ({ businessName, apiKey, dashboardUrl }) => {
  return layout(
    `
      <h2 style="margin-top:0;">
        🎉 Congratulations ${businessName} Team!
      </h2>

      <p>
        Your merchant account has been successfully approved
        and is now <strong>active</strong> on SpleetPay.
      </p>

      <h3>Your API Key</h3>

      <div style="
        background:#F3F4F6;
        padding:15px;
        border-radius:6px;
        margin:20px 0;
        font-family:monospace;
        word-break:break-all;
        font-size:14px;
      ">
        ${apiKey}
      </div>

      <p>
        <strong>Important:</strong>
        Keep your API key secure and never expose it publicly.
        Treat it like a password.
      </p>

      ${
        dashboardUrl
          ? `
        <p style="text-align:center; margin:25px 0;">
          <a href="${dashboardUrl}" class="button">
            Go to Merchant Dashboard
          </a>
        </p>
      `
          : ''
      }

      <h3>What’s Next?</h3>

      <ul style="padding-left:20px; line-height:1.8;">
        <li>Access your merchant dashboard</li>
        <li>Integrate our payment APIs using your API key</li>
        <li>Start accepting payments from customers</li>
        <li>Monitor transactions and settlements</li>
      </ul>

      <p>
        You can now start accepting both
        <strong>Pay-for-Me</strong> and
        <strong>Group Split</strong> payments.
      </p>

      <p>
        If you need help with integration,
        our support team is ready to assist you.
      </p>

      <p style="margin-top:30px;">
        Welcome to the SpleetPay merchant community.<br/>
        <strong>The SpleetPay Team</strong>
      </p>
    `,
    {
      title: 'Merchant Account Approved',
      headerColor: '#10B981'
    }
  );
};