const layout = require('./layout');

module.exports = ({
  contributorName,
  formattedAmount,
  description,
  paymentUrl,
  merchantName,
  expiresAt
}) => {
  return layout(
    `
      <h2 style="margin-top:0;">Hello ${contributorName},</h2>

      <p>
        You have received a payment request from 
        <strong>${merchantName}</strong>.
      </p>

      <div style="
        background:#f3f4f6;
        padding:20px;
        border-radius:8px;
        margin:20px 0;
      ">
        <div style="
          font-size:24px;
          font-weight:bold;
          color:#1434A4;
          text-align:center;
          margin-bottom:15px;
        ">
          ${formattedAmount}
        </div>

        <p><strong>Description:</strong> ${description}</p>

        ${
          expiresAt
            ? `<p><strong>Expires:</strong> ${new Date(
                expiresAt
              ).toLocaleDateString()}</p>`
            : ''
        }
      </div>

      <p>Click the button below to make your payment securely:</p>

      <p style="text-align:center;">
        <a href="${paymentUrl}" class="button">
          Pay Now
        </a>
      </p>

      <p style="font-size:14px; margin-top:20px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>

      <p style="word-break:break-all;">
        <a href="${paymentUrl}">${paymentUrl}</a>
      </p>

      <p style="margin-top:25px;">
        This payment is processed securely through SpleetPay.
        Your payment information is encrypted and protected.
      </p>

      <p>
        If you didn't expect this request, you can safely ignore this email.
      </p>

      <p style="margin-top:30px;">
        Best regards,<br/>
        <strong>The SpleetPay Team</strong>
      </p>
    `,
    {
      title: 'Payment Request',
      headerColor: '#1434A4'
    }
  );
};