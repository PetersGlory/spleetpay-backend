const sequelize = require('../config/database');

// Import all models
const User = require('./user');
const AdminUser = require('./adminUser');
const Merchant = require('./merchant');
const Transaction = require('./transaction');
const GroupSplitContributor = require('./groupSplitContributor');
const Settlement = require('./settlement');
const QRCode = require('./qrCode');
const KYCDocument = require('./kycDocument');
const Director = require('./director');
const Refund = require('./refund');
const Dispute = require('./dispute');
const Wallet = require('./wallet');

// Define associations
User.hasMany(Merchant, { foreignKey: 'userId', as: 'merchants' });
Merchant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Merchant.hasMany(Transaction, { foreignKey: 'merchantId', as: 'transactions' });
Transaction.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Merchant.hasMany(QRCode, { foreignKey: 'merchantId', as: 'qrCodes' });
QRCode.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Merchant.hasMany(KYCDocument, { foreignKey: 'merchantId', as: 'kycDocuments' });
KYCDocument.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Merchant.hasMany(Director, { foreignKey: 'merchantId', as: 'directors' });
Director.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Merchant.hasMany(Settlement, { foreignKey: 'merchantId', as: 'settlements' });
Settlement.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Transaction.hasMany(GroupSplitContributor, { foreignKey: 'transactionId', as: 'contributors' });
GroupSplitContributor.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

Transaction.hasMany(Refund, { foreignKey: 'paymentId', as: 'refunds' });
Refund.belongsTo(Transaction, { foreignKey: 'paymentId', as: 'payment' });

Transaction.hasMany(Dispute, { foreignKey: 'transactionId', as: 'disputes' });
Dispute.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

Merchant.hasMany(Dispute, { foreignKey: 'merchantId', as: 'disputes' });
Dispute.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

User.hasMany(Dispute, { foreignKey: 'customerId', as: 'disputes' });
Dispute.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    // Disable foreign key checks for MySQL compatibility
    if (sequelize.getDialect() === 'mysql') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    }
    
    const alterOption = process.env.NODE_ENV === 'development';
    
    // Sync models in order to handle dependencies
    await User.sync({ alter: alterOption });
    await AdminUser.sync({ alter: alterOption });
    await Merchant.sync({ alter: alterOption });
    await Transaction.sync({ alter: alterOption });
    await GroupSplitContributor.sync({ alter: alterOption });
    await Settlement.sync({ alter: alterOption });
    await QRCode.sync({ alter: alterOption });
    await KYCDocument.sync({ alter: alterOption });
    await Director.sync({ alter: alterOption });
    await Refund.sync({ alter: alterOption });
    await Dispute.sync({ alter: alterOption });
    await Wallet.sync({ alter: alterOption });
    
    // Re-enable foreign key checks for MySQL
    if (sequelize.getDialect() === 'mysql') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    }
    
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  AdminUser,
  Merchant,
  Transaction,
  GroupSplitContributor,
  Settlement,
  QRCode,
  KYCDocument,
  Director,
  Refund,
  Dispute,
  Wallet,
  syncDatabase
};