const sequelize = require('../config/database');

// Import all models
const User = require('./user');
const AdminUser = require('./adminUser');
const Merchant = require('./merchant');
const PaymentRequest = require('./paymentRequest');
const SplitParticipant = require('./splitParticipant');
const Transaction = require('./transaction');
const WalletTransaction = require('./walletTransaction');
const GroupSplitContributor = require('./groupSplitContributor');
const Settlement = require('./settlement');
const QRCode = require('./qrCode');
const KYCDocument = require('./kycDocument');
const Director = require('./director');
const Refund = require('./refund');
const Dispute = require('./dispute');
const Wallet = require('./wallet');
const PaymentRate = require('./paymentRate');
const AdminPermission = require('./adminPermission');
const AdminSetting = require('./adminSetting');
const AuditLog = require('./auditLog');

// Define associations
// User associations
// User.hasMany(PaymentRequest, { foreignKey: 'userId', as: 'paymentRequests' });
// PaymentRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(WalletTransaction, { foreignKey: 'userId', as: 'walletTransactions' });
WalletTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// PaymentRequest associations
PaymentRequest.hasMany(SplitParticipant, { foreignKey: 'paymentRequestId', as: 'participants' });
SplitParticipant.belongsTo(PaymentRequest, { foreignKey: 'paymentRequestId', as: 'paymentRequest' });

PaymentRequest.hasMany(Transaction, { foreignKey: 'paymentRequestId', as: 'transactions' });
Transaction.belongsTo(PaymentRequest, { foreignKey: 'paymentRequestId', as: 'paymentRequest' });

// SplitParticipant associations
SplitParticipant.hasMany(Transaction, { foreignKey: 'participantId', as: 'transactions' });
Transaction.belongsTo(SplitParticipant, { foreignKey: 'participantId', as: 'participant' });

// Transaction associations
Transaction.hasOne(WalletTransaction, { foreignKey: 'transactionId', as: 'walletTransaction' });
WalletTransaction.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Admin and Merchant associations (keeping existing)
User.hasMany(Merchant, { foreignKey: 'userId', as: 'merchants' });
Merchant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Merchant ↔ Transaction
Merchant.hasMany(Transaction, { foreignKey: 'merchantId', as: 'transactions' });
Transaction.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

// Transaction ↔ GroupSplitContributor
Transaction.hasMany(GroupSplitContributor, { foreignKey: 'transactionId', as: 'contributors' });
GroupSplitContributor.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

Merchant.hasMany(Settlement, { foreignKey: 'merchantId', as: 'settlements' });
Settlement.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Merchant.hasMany(QRCode, { foreignKey: 'merchantId', as: 'qrCodes' });
QRCode.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Merchant.hasMany(KYCDocument, { foreignKey: 'merchantId', as: 'kycDocuments' });
KYCDocument.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Merchant.hasMany(Director, { foreignKey: 'merchantId', as: 'directors' });
Director.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

Transaction.hasMany(Refund, { foreignKey: 'transactionId', as: 'refunds' });
Refund.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

Transaction.hasOne(Dispute, { foreignKey: 'transactionId', as: 'dispute' });
Dispute.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Admin associations
AdminUser.hasMany(AdminPermission, { foreignKey: 'adminId', as: 'adminPermissions' });
AdminPermission.belongsTo(AdminUser, { foreignKey: 'adminId', as: 'admin' });

AdminUser.hasMany(AdminSetting, { foreignKey: 'updatedBy', as: 'updatedSettings' });
AdminSetting.belongsTo(AdminUser, { foreignKey: 'updatedBy', as: 'updatedByAdmin' });

AdminUser.hasMany(AuditLog, { foreignKey: 'adminId', as: 'auditLogs' });
AuditLog.belongsTo(AdminUser, { foreignKey: 'adminId', as: 'admin' });

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
    await PaymentRequest.sync({ alter: alterOption });
    await SplitParticipant.sync({ alter: alterOption });
    await Transaction.sync({ alter: alterOption });
    await WalletTransaction.sync({ alter: alterOption });
    await Merchant.sync({ alter: alterOption });
    await GroupSplitContributor.sync({ alter: alterOption });
    await Settlement.sync({ alter: alterOption });
    await QRCode.sync({ alter: alterOption });
    await KYCDocument.sync({ alter: alterOption });
    await Director.sync({ alter: alterOption });
    await Refund.sync({ alter: alterOption });
    await Dispute.sync({ alter: alterOption });
    await Wallet.sync({ alter: alterOption });
    await PaymentRate.sync({ alter: alterOption });
    await AdminPermission.sync({ alter: alterOption });
    await AdminSetting.sync({ alter: alterOption });
    await AuditLog.sync({ alter: alterOption });
    
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
  PaymentRequest,
  SplitParticipant,
  Transaction,
  WalletTransaction,
  Merchant,
  GroupSplitContributor,
  Settlement,
  QRCode,
  KYCDocument,
  Director,
  Refund,
  Dispute,
  Wallet,
  PaymentRate,
  AdminPermission,
  AdminSetting,
  AuditLog,
  syncDatabase
};