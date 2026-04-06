const layout = require('./layout');

module.exports = ({
  name,
  formattedAmount,
  description,
  reference,
  merchantName,
  date
}) => {
  return layout(
    `
      <h2 style="margin-top:0;">Hello ${name},</h2>

      <p>Your payment has been processed successfully 🎉</p>

      <div style="
        background:#f3f4f6;
        padding:20px;
        border-radius:8px;
        margin:20px 0;
      ">
        <div style="
          font-size:24px;
          font-weight:bold;
          color:#10B981;
          text-align:center;
          margin-bottom:15px;
        ">
          ${formattedAmount}
        </div>

        <p><strong>To:</strong> ${merchantName}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Date:</strong> ${date}</p>
      </div>

      <p>
        Thank you for using <strong>SpleetPay</strong>.
        You can view your transaction history in your dashboard anytime.
      </p>

      <p>
        If you have any questions about this transaction,
        please contact our support team.
      </p>

      <p style="margin-top:30px;">
        Best regards,<br/>
        <strong>The SpleetPay Team</strong>
      </p>
    `,
    {
      title: 'Payment Successful!',
      headerColor: '#10B981'
    }
  );
};