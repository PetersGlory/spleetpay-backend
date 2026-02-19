const { Merchant, User } = require('../models');

/**
 * Platform API key authentication middleware.
 *
 * Reads the X-API-Key header, looks up the matching merchant, and attaches
 * both `req.merchant` and `req.user` (the merchant's owning user) so that
 * downstream controllers can work as normal.
 *
 * Usage: add `authenticatePlatformKey` before any platform route handler.
 */
const authenticatePlatformKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing X-API-Key header'
        }
      });
    }

    // Only accept keys that look like ours (sk_live_ prefix)
    if (!apiKey.startsWith('sk_live_')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid API key format'
        }
      });
    }

    const merchant = await Merchant.findOne({
      where: { apiKey },
      include: [{ model: User, as: 'user' }]
    });

    if (!merchant) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or revoked API key'
        }
      });
    }

    // Only approved merchants with active onboarding may use the Platform API
    if (merchant.kycStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'KYC_NOT_APPROVED',
          message: 'Your KYC has not been approved yet. Please complete verification to access the Platform API.'
        }
      });
    }

    if (merchant.onboardingStatus !== 'active') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'MERCHANT_INACTIVE',
          message: 'Your merchant account is not yet active.'
        }
      });
    }

    // Attach to request so controllers can read merchant details
    req.merchant = merchant;
    req.user     = merchant.user;   // controllers already use req.user.id

    next();
  } catch (error) {
    console.error('Platform API key authentication error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication failed'
      }
    });
  }
};

module.exports = authenticatePlatformKey;