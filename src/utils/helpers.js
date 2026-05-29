const { buildBankMap, getBankName, getFallbackBankName } = require('./bankHelper.js');
const paystackService = require('../services/payment.service.js'); // wherever getBanks() lives

// Cache the bank map so you're not hitting Paystack on every request
let cachedBankMap = null;
let cacheExpiry = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — banks don't change often

const getResolvedBankMap = async () => {
  const now = Date.now();

  if (cachedBankMap && cacheExpiry && now < cacheExpiry) {
    return cachedBankMap;
  }

  const result = await paystackService.getBanks();

  if (result.success && Array.isArray(result.data)) {
    cachedBankMap = buildBankMap(result.data);
    cacheExpiry = now + CACHE_TTL_MS;
    return cachedBankMap;
  }

  // Paystack unavailable — return null so caller falls back
  console.warn('Could not fetch banks from Paystack, falling back to static map');
  return null;
};

// Use it anywhere you need a bank name
const resolveBankName = async (bankCode) => {
  const bankMap = await getResolvedBankMap();

  if (bankMap) {
    return getBankName(bankMap, bankCode);
  }

  return getFallbackBankName(bankCode); // static fallback
};

module.exports = { resolveBankName, getResolvedBankMap };