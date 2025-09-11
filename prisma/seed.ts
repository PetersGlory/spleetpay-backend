import { PrismaClient, UserRole, UserStatus, KycStatus, OnboardingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('Admin123!', 12);
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'superadmin@spleetpay.com' },
    update: {},
    create: {
      email: 'superadmin@spleetpay.com',
      passwordHash: superAdminPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      permissions: [
        'users.read', 'users.write', 'users.delete',
        'merchants.read', 'merchants.write', 'merchants.delete',
        'transactions.read', 'transactions.write', 'transactions.delete',
        'settlements.read', 'settlements.write', 'settlements.delete',
        'analytics.read', 'config.read', 'config.write',
        'logs.read', 'admin.read', 'admin.write'
      ],
      department: 'IT',
      status: UserStatus.ACTIVE
    }
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@spleetpay.com' },
    update: {},
    create: {
      email: 'admin@spleetpay.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      permissions: [
        'users.read', 'users.write',
        'merchants.read', 'merchants.write',
        'transactions.read', 'transactions.write',
        'settlements.read', 'settlements.write',
        'analytics.read', 'logs.read'
      ],
      department: 'Operations',
      status: UserStatus.ACTIVE
    }
  });

  console.log('✅ Admin created:', admin.email);

  // Create Moderator
  const moderatorPassword = await bcrypt.hash('Moderator123!', 12);
  const moderator = await prisma.adminUser.upsert({
    where: { email: 'moderator@spleetpay.com' },
    update: {},
    create: {
      email: 'moderator@spleetpay.com',
      passwordHash: moderatorPassword,
      name: 'Moderator User',
      role: UserRole.MODERATOR,
      permissions: [
        'users.read', 'merchants.read', 'merchants.write',
        'transactions.read', 'settlements.read'
      ],
      department: 'Customer Support',
      status: UserStatus.ACTIVE
    }
  });

  console.log('✅ Moderator created:', moderator.email);

  // Create Analyst
  const analystPassword = await bcrypt.hash('Analyst123!', 12);
  const analyst = await prisma.adminUser.upsert({
    where: { email: 'analyst@spleetpay.com' },
    update: {},
    create: {
      email: 'analyst@spleetpay.com',
      passwordHash: analystPassword,
      name: 'Analyst User',
      role: UserRole.ANALYST,
      permissions: [
        'users.read', 'merchants.read', 'transactions.read',
        'settlements.read', 'analytics.read'
      ],
      department: 'Analytics',
      status: UserStatus.ACTIVE
    }
  });

  console.log('✅ Analyst created:', analyst.email);

  // Create Sample Merchant User
  const merchantPassword = await bcrypt.hash('Merchant123!', 12);
  const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant@example.com' },
    update: {},
    create: {
      email: 'merchant@example.com',
      passwordHash: merchantPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+234901234567',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      walletBalance: 50000,
      currency: 'NGN'
    }
  });

  console.log('✅ Merchant User created:', merchantUser.email);

  // Create Sample Merchant Business
  const sampleMerchant = await prisma.merchant.upsert({
    where: { id: 'sample-merchant-id' },
    update: {},
    create: {
      id: 'sample-merchant-id',
      userId: merchantUser.id,
      businessName: 'Sample Restaurant Ltd',
      businessEmail: 'business@samplerestaurant.com',
      businessPhone: '+234901234568',
      businessAddress: '123 Restaurant Street, Lagos, Nigeria',
      businessType: 'Food & Beverage',
      websiteUrl: 'https://samplerestaurant.com',
      cacNumber: 'RC123456789',
      taxId: 'TAX123456',
      kycStatus: KycStatus.VERIFIED,
      onboardingStatus: OnboardingStatus.ACTIVE,
      kycSubmittedAt: new Date('2024-01-01'),
      kycApprovedAt: new Date('2024-01-02'),
      apiKey: 'sk_test_sample_merchant_api_key_123456789',
      webhookUrl: 'https://samplerestaurant.com/webhooks/spleetpay',
      settlementAccountNumber: '1234567890',
      settlementBankCode: '058',
      settlementAccountName: 'Sample Restaurant Ltd',
      settlementSchedule: 'daily',
      fees: {
        transactionFee: 1.5,
        settlementFee: 0.5,
        currency: 'NGN'
      }
    }
  });

  console.log('✅ Sample Merchant created:', sampleMerchant.businessName);

  // Create Sample Directors
  await prisma.director.upsert({
    where: { id: 'sample-director-1' },
    update: {},
    create: {
      id: 'sample-director-1',
      merchantId: sampleMerchant.id,
      fullName: 'John Doe',
      bvn: '12345678901',
      phone: '+234901234567',
      email: 'john@samplerestaurant.com',
      ownershipPercentage: 60.0
    }
  });

  await prisma.director.upsert({
    where: { id: 'sample-director-2' },
    update: {},
    create: {
      id: 'sample-director-2',
      merchantId: sampleMerchant.id,
      fullName: 'Jane Smith',
      bvn: '12345678902',
      phone: '+234901234569',
      email: 'jane@samplerestaurant.com',
      ownershipPercentage: 40.0
    }
  });

  console.log('✅ Sample Directors created');

  // Create Sample Transactions
  const sampleTransactions = [
    {
      id: 'txn-001',
      reference: 'TXN001',
      type: 'PAY_FOR_ME' as const,
      amount: 25000,
      currency: 'NGN',
      status: 'SUCCESSFUL' as const,
      description: 'Restaurant bill payment',
      customerName: 'Customer One',
      customerEmail: 'customer1@example.com',
      customerPhone: '+234901234570',
      paymentMethod: 'card',
      paymentGateway: 'paystack',
      gatewayReference: 'PSK_001',
      merchantFee: 375,
      gatewayFee: 125,
      netAmount: 24500,
      merchantId: sampleMerchant.id
    },
    {
      id: 'txn-002',
      reference: 'TXN002',
      type: 'GROUP_SPLIT' as const,
      amount: 75000,
      currency: 'NGN',
      status: 'PARTIAL' as const,
      description: 'Group dinner payment',
      customerName: 'Customer Two',
      customerEmail: 'customer2@example.com',
      customerPhone: '+234901234571',
      paymentMethod: 'bank_transfer',
      paymentGateway: 'flutterwave',
      gatewayReference: 'FLW_001',
      merchantFee: 1125,
      gatewayFee: 375,
      netAmount: 73500,
      merchantId: sampleMerchant.id
    }
  ];

  for (const txnData of sampleTransactions) {
    await prisma.transaction.upsert({
      where: { id: txnData.id },
      update: {},
      create: txnData
    });
  }

  console.log('✅ Sample Transactions created');

  // Create Sample Group Split Contributors
  await prisma.groupSplitContributor.createMany({
    data: [
      {
        id: 'contributor-1',
        transactionId: 'txn-002',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+234901234572',
        amount: 25000,
        status: 'PAID'
      },
      {
        id: 'contributor-2',
        transactionId: 'txn-002',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '+234901234573',
        amount: 25000,
        status: 'PAID'
      },
      {
        id: 'contributor-3',
        transactionId: 'txn-002',
        name: 'Carol Brown',
        email: 'carol@example.com',
        phone: '+234901234574',
        amount: 25000,
        status: 'PENDING'
      }
    ],
    skipDuplicates: true
  });

  console.log('✅ Sample Group Split Contributors created');

  // Create Sample Settlement
  await prisma.settlement.upsert({
    where: { id: 'settlement-001' },
    update: {},
    create: {
      id: 'settlement-001',
      merchantId: sampleMerchant.id,
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
      totalAmount: 100000,
      feeAmount: 1500,
      netAmount: 98500,
      transactionCount: 2,
      status: 'COMPLETED',
      bankAccount: {
        accountNumber: '1234567890',
        bankCode: '058',
        accountName: 'Sample Restaurant Ltd'
      },
      reference: 'SETTLE001',
      settlementType: 'T_1',
      processedAt: new Date('2024-02-01')
    }
  });

  console.log('✅ Sample Settlement created');

  // Create Sample QR Codes
  await prisma.qrCode.createMany({
    data: [
      {
        id: 'qr-001',
        merchantId: sampleMerchant.id,
        name: 'Restaurant Payment',
        type: 'PAY_FOR_ME',
        amount: 50000,
        description: 'Payment for restaurant bill',
        isActive: true,
        usageLimit: 100,
        usageCount: 15,
        qrData: 'QR_DATA_SAMPLE_001'
      },
      {
        id: 'qr-002',
        merchantId: sampleMerchant.id,
        name: 'Group Split Payment',
        type: 'GROUP_SPLIT',
        description: 'Group payment for shared expenses',
        isActive: true,
        usageLimit: 50,
        usageCount: 5,
        qrData: 'QR_DATA_SAMPLE_002'
      }
    ],
    skipDuplicates: true
  });

  console.log('✅ Sample QR Codes created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('Super Admin: superadmin@spleetpay.com / Admin123!');
  console.log('Admin: admin@spleetpay.com / Admin123!');
  console.log('Moderator: moderator@spleetpay.com / Moderator123!');
  console.log('Analyst: analyst@spleetpay.com / Analyst123!');
  console.log('Merchant: merchant@example.com / Merchant123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });