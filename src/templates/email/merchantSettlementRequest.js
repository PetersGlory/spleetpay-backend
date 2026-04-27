const layout = require('./layout');

module.exports = ({ businessName, formattedAmount, reference, bankAccount, estimatedCompletion, dashboardUrl }) => {
  return layout(
    `
      <h2 style="margin-top:0;">Settlement Request Received</h2>

      <p>Hi <strong>${businessName}</strong>,</p>

      <p>
        We've received your settlement request and it's currently being reviewed.
        You'll be notified once it has been processed.
      </p>

      <p><strong>Settlement Details:</strong></p>

      <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
        <tr>
          <td style="padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb; width:40%;"><strong>Amount</strong></td>
          <td style="padding:10px 12px; border:1px solid #e5e7eb;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;"><strong>Reference</strong></td>
          <td style="padding:10px 12px; border:1px solid #e5e7eb; font-family:monospace;">${reference}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;"><strong>Destination Account</strong></td>
          <td style="padding:10px 12px; border:1px solid #e5e7eb;">${bankAccount}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;"><strong>Est. Completion</strong></td>
          <td style="padding:10px 12px; border:1px solid #e5e7eb;">${new Date(estimatedCompletion).toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })}</td>
        </tr>
      </table>

      <p>
        Settlements are typically completed within <strong>1 business day</strong>.
        You can track the status of this request from your dashboard.
      </p>

      <p style="text-align:center;">
        <a href="${dashboardUrl}" class="button">View Settlement Status</a>
      </p>

      <p>
        If you did not initiate this request or have any concerns,
        please contact our support team immediately.
      </p>

      <p style="margin-top:30px;">
        Best regards,<br/>
        <strong>The SpleetPay Team</strong>
      </p>
    `,
    {
      title: 'Settlement Request Received',
      headerColor: '#1434A4'
    }
  );
};