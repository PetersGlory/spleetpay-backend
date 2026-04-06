const layout = (content, { headerColor = '#1434A4', title }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; background:#f5f5f5; margin:0; }
  .container { max-width:600px; margin:20px auto; }
  .header { background:${headerColor}; color:white; padding:20px; text-align:center; border-radius:8px 8px 0 0; }
  .content { background:white; padding:30px; border-radius:0 0 8px 8px; }
  .button { background:${headerColor}; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; display:inline-block; }
  .footer { text-align:center; margin-top:20px; font-size:12px; color:#666; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${title}</h2>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} SpleetPay
    </div>
  </div>
</body>
</html>
`;

module.exports = layout;