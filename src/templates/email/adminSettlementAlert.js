const layout = require('./layout');

module.exports = ({ businessName, formattedAmount, reference, bankAccount, merchantId, adminDashboardUrl }) => {
  return layout(
    `
      <h2 style="margin-top:0;">New Settlement Request</h2>

      <p>Hi Admin,</p>

      <p>
        A merchant has submitted a new settlement request that requires your review and approval.
      </p>

      <p><strong>Request Details:</strong></p>

      <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
        <tr>
          <td style="padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb; width:40%;"><strong>Merchant</strong></td>
          <td style="padding:10px 12px; border:1px solid #e5e7eb;">${businessName}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;"><strong>Amount Requested</strong></td>
          <td style="padding:10px 12px; border:1px solid #e5e7eb;"><strong>${formattedAmount}</strong></td>
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
          <td style="padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;"><strong>Submitted At</strong></td>
          <td style="padding:10px 12px; border:1px solid #e5e7eb;">${new Date().toLocaleString('en-NG', { dateStyle: 'full', timeStyle: 'short' })}</td>
        </tr>
      </table>

      <p>
        Please review this request and take the appropriate action —
        approve to begin processing or reject if something looks incorrect.
      </p>

      <p style="text-align:center;">
        <a href="${adminDashboardUrl}" class="button">Review in Dashboard</a>
      </p>

      <p style="
        background: #fef9c3;
        border-left: 4px solid #eab308;
        padding: 12px 16px;
        border-radius: 4px;
        font-size: 14px;
        color: #713f12;
      ">
        ⚠️ Do not approve settlements you did not independently verify.
        Always confirm the destination account matches merchant records.
      </p>

      <p style="margin-top:30px;">
        — <strong>SpleetPay Automated Alerts</strong>
      </p>
    `,
    {
      title: 'New Settlement Request — Action Required',
      headerColor: '#991B1B'
    }
  );
};