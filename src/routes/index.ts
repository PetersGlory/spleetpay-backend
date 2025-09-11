import { Router } from 'express';
import authRoutes from './auth.routes.js';
import merchantsRoutes from './merchants.routes.js';
import transactionsRoutes from './transactions.routes.js';
import groupSplitsRoutes from './group-splits.routes.js';
import settlementsRoutes from './settlements.routes.js';
import qrCodesRoutes from './qr-codes.routes.js';
import adminmerchantsRoutes from './admin/merchants.routes.js';
import admintransactionsRoutes from './admin/transactions.routes.js';
import adminsettlementsRoutes from './admin/settlements.routes.js';
import adminanalyticsRoutes from './admin/analytics.routes.js';
import adminconfigRoutes from './admin/config.routes.js';
import adminlogsRoutes from './admin/logs.routes.js';
import webhookspaymentStatusRoutes from './webhooks/payment-status.routes.js';
import webhooksSettlementStatusRoutes from './webhooks/settlement-status.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/merchants', merchantsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/group-splits', groupSplitsRoutes);
router.use('/settlements', settlementsRoutes);
router.use('/qr-codes', qrCodesRoutes);
router.use('/admin/merchants', adminmerchantsRoutes);
router.use('/admin/transactions', admintransactionsRoutes);
router.use('/admin/settlements', adminsettlementsRoutes);
router.use('/admin/analytics', adminanalyticsRoutes);
router.use('/admin/config', adminconfigRoutes);
router.use('/admin/logs', adminlogsRoutes);
router.use('/webhooks/payment-status', webhookspaymentStatusRoutes);
router.use('/webhooks/settlement-status', webhooksSettlementStatusRoutes);
router.use('/health', healthRoutes);

export default router;