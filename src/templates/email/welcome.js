const layout = require('./layout');

module.exports = ({ firstName, appUrl }) => {
  return layout(
    `
      <h2 style="margin-top:0;">Hi ${firstName},</h2>

      <p>
        Your account is all set! You're now ready to start making payments
        and splitting bills with <strong>SpleetPay</strong>.
      </p>

      <p>Click the button below to open the app and get started:</p>

      <p style="text-align:center;">
        <a href="${appUrl}" class="button">Open SpleetPay</a>
      </p>

      <p><strong>What you can do with SpleetPay:</strong></p>

      <ul style="padding-left:20px; line-height:1.8;">
        <li>💳 Request payments from friends and family</li>
        <li>👥 Split bills and group expenses easily</li>
        <li>📊 Track all your transactions in one place</li>
        <li>🔒 Enjoy secure and fast payments</li>
      </ul>

      <p>
        Start by creating a payment request or initiating a group split —
        it’s quick and simple!
      </p>

      <p>
        If you have any questions or need help, our support team is here for you.
      </p>

      <p style="margin-top:30px;">
        Happy splitting!<br/>
        <strong>The SpleetPay Team</strong>
      </p>
    `,
    {
      title: 'Welcome to SpleetPay!',
      headerColor: '#1434A4'
    }
  );
};