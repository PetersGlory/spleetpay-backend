// utils/bankHelper.js

/**
 * Build a bank lookup map from Paystack bank list response
 * @param {Array} banks - Array of bank objects from Paystack /bank endpoint
 * @returns {Object} Map of bankCode -> bankName
 */
const buildBankMap = (banks = []) => {
  return banks.reduce((map, bank) => {
    if (bank.active && !bank.is_deleted) {
      map[bank.code] = bank.name;
    }
    return map;
  }, {});
};

/**
 * Get bank name from a pre-built bank map
 * @param {Object} bankMap - Map built by buildBankMap()
 * @param {string} bankCode - The bank code to look up
 * @returns {string} Bank name or 'Unknown Bank'
 */
const getBankName = (bankMap, bankCode) => {
  if (!bankCode || !bankMap) return 'Unknown Bank';
  return bankMap[String(bankCode)] || 'Unknown Bank';
};

/**
 * Fallback static map for when Paystack is unavailable
 * Only used as a last resort
 */
const FALLBACK_BANKS = {
  '044': 'Access Bank',
  '050': 'Ecobank Nigeria',
  '070': 'Fidelity Bank',
  '011': 'First Bank of Nigeria',
  '214': 'First City Monument Bank (FCMB)',
  '058': 'Guaranty Trust Bank',
  '030': 'Heritage Bank',
  '082': 'Keystone Bank',
  '076': 'Polaris Bank',
  '221': 'Stanbic IBTC Bank',
  '068': 'Standard Chartered Bank',
  '232': 'Sterling Bank',
  '032': 'Union Bank',
  '033': 'United Bank for Africa (UBA)',
  '215': 'Unity Bank',
  '035': 'Wema Bank',
  '057': 'Zenith Bank',
  '305': 'Opay',
  '50211': 'Kuda Bank',
  '090405': 'Moniepoint Microfinance Bank',
  '090175': 'PalmPay',
};

const getFallbackBankName = (bankCode) => {
  if (!bankCode) return 'Unknown Bank';
  return FALLBACK_BANKS[String(bankCode)] || 'Unknown Bank';
};

module.exports = { buildBankMap, getBankName, getFallbackBankName, FALLBACK_BANKS };