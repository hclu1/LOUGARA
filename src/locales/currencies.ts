export type CurrencyCode = 'EUR' | 'USD' | 'XOF' | 'XAF' | 'GNF' | 'MAD' | 'NGN';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'Euro (€)',
    flag: '🇪🇺',
    decimals: 2,
    symbolPosition: 'after',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'US Dollar ($)',
    flag: '🇺🇸',
    decimals: 2,
    symbolPosition: 'before',
  },
  XOF: {
    code: 'XOF',
    symbol: 'FCFA',
    label: 'Franc CFA UEMOA (XOF)',
    flag: '🇸🇳',
    decimals: 0,
    symbolPosition: 'after',
  },
  XAF: {
    code: 'XAF',
    symbol: 'FCFA',
    label: 'Franc CFA CEMAC (XAF)',
    flag: '🇨🇲',
    decimals: 0,
    symbolPosition: 'after',
  },
  GNF: {
    code: 'GNF',
    symbol: 'GNF',
    label: 'Franc Guinéen (GNF)',
    flag: '🇬🇳',
    decimals: 0,
    symbolPosition: 'after',
  },
  MAD: {
    code: 'MAD',
    symbol: 'MAD',
    label: 'Dirham Marocain (MAD)',
    flag: '🇲🇦',
    decimals: 0,
    symbolPosition: 'after',
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    label: 'Naira Nigérian (NGN)',
    flag: '🇳🇬',
    decimals: 0,
    symbolPosition: 'before',
  },
};

/**
 * Grille de prix locaux fixes arrondis pour garantir l'équité de pouvoir d'achat (PPP)
 * et éviter les commissions de conversion bancaires locales.
 */
export const LOCAL_PRICES: Record<string, Record<CurrencyCode, { monthly: number; annual: number }>> = {
  // --- FORMULES FOURNISSEURS ---
  SUPPLIER_FREE: {
    EUR: { monthly: 0, annual: 0 },
    USD: { monthly: 0, annual: 0 },
    XOF: { monthly: 0, annual: 0 },
    XAF: { monthly: 0, annual: 0 },
    GNF: { monthly: 0, annual: 0 },
    MAD: { monthly: 0, annual: 0 },
    NGN: { monthly: 0, annual: 0 },
  },
  SUPPLIER_ESSENTIAL: {
    EUR: { monthly: 29, annual: 279 },
    USD: { monthly: 32, annual: 299 },
    XOF: { monthly: 19000, annual: 180000 },
    XAF: { monthly: 19000, annual: 180000 },
    GNF: { monthly: 275000, annual: 2600000 },
    MAD: { monthly: 310, annual: 2950 },
    NGN: { monthly: 45000, annual: 430000 },
  },
  SUPPLIER_PRO: {
    EUR: { monthly: 69, annual: 659 },
    USD: { monthly: 75, annual: 715 },
    XOF: { monthly: 45000, annual: 430000 },
    XAF: { monthly: 45000, annual: 430000 },
    GNF: { monthly: 650000, annual: 6200000 },
    MAD: { monthly: 740, annual: 7000 },
    NGN: { monthly: 110000, annual: 1050000 },
  },
  SUPPLIER_PREMIUM: {
    EUR: { monthly: 129, annual: 1239 },
    USD: { monthly: 139, annual: 1340 },
    XOF: { monthly: 85000, annual: 810000 },
    XAF: { monthly: 85000, annual: 810000 },
    GNF: { monthly: 1200000, annual: 11500000 },
    MAD: { monthly: 1380, annual: 13200 },
    NGN: { monthly: 210000, annual: 2000000 },
  },

  // --- FORMULES ENTREPRENEURS ---
  BUYER_FREE: {
    EUR: { monthly: 0, annual: 0 },
    USD: { monthly: 0, annual: 0 },
    XOF: { monthly: 0, annual: 0 },
    XAF: { monthly: 0, annual: 0 },
    GNF: { monthly: 0, annual: 0 },
    MAD: { monthly: 0, annual: 0 },
    NGN: { monthly: 0, annual: 0 },
  },
  BUYER_ESSENTIAL: {
    EUR: { monthly: 19, annual: 179 },
    USD: { monthly: 21, annual: 199 },
    XOF: { monthly: 12500, annual: 118000 },
    XAF: { monthly: 12500, annual: 118000 },
    GNF: { monthly: 180000, annual: 1700000 },
    MAD: { monthly: 200, annual: 1900 },
    NGN: { monthly: 30000, annual: 285000 },
  },
  BUYER_PRO: {
    EUR: { monthly: 49, annual: 469 },
    USD: { monthly: 54, annual: 510 },
    XOF: { monthly: 32000, annual: 305000 },
    XAF: { monthly: 32000, annual: 305000 },
    GNF: { monthly: 460000, annual: 4400000 },
    MAD: { monthly: 520, annual: 4950 },
    NGN: { monthly: 78000, annual: 740000 },
  },
  BUYER_VIP: {
    EUR: { monthly: 99, annual: 949 },
    USD: { monthly: 109, annual: 1040 },
    XOF: { monthly: 65000, annual: 620000 },
    XAF: { monthly: 65000, annual: 620000 },
    GNF: { monthly: 940000, annual: 9000000 },
    MAD: { monthly: 1050, annual: 10000 },
    NGN: { monthly: 160000, annual: 1500000 },
  },

  // --- PACKS DE CRÉDITS PONCTUELS (PAY-AS-YOU-GO) ---
  CREDIT_PACK_1: {
    EUR: { monthly: 9, annual: 9 },
    USD: { monthly: 10, annual: 10 },
    XOF: { monthly: 6000, annual: 6000 },
    XAF: { monthly: 6000, annual: 6000 },
    GNF: { monthly: 85000, annual: 85000 },
    MAD: { monthly: 95, annual: 95 },
    NGN: { monthly: 14000, annual: 14000 },
  },
  CREDIT_PACK_5: {
    EUR: { monthly: 39, annual: 39 },
    USD: { monthly: 42, annual: 42 },
    XOF: { monthly: 25000, annual: 25000 },
    XAF: { monthly: 25000, annual: 25000 },
    GNF: { monthly: 370000, annual: 370000 },
    MAD: { monthly: 415, annual: 415 },
    NGN: { monthly: 62000, annual: 62000 },
  },
  CREDIT_PACK_15: {
    EUR: { monthly: 99, annual: 99 },
    USD: { monthly: 109, annual: 109 },
    XOF: { monthly: 65000, annual: 65000 },
    XAF: { monthly: 65000, annual: 65000 },
    GNF: { monthly: 940000, annual: 940000 },
    MAD: { monthly: 1050, annual: 1050 },
    NGN: { monthly: 160000, annual: 160000 },
  },
};

/**
 * Formate un montant dans la devise ciblée avec ses séparateurs de milliers
 */
export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  const conf = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.EUR;
  const rounded = conf.decimals === 0 ? Math.round(amount) : amount;
  const formattedNumber = new Intl.NumberFormat(currency === 'EUR' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: conf.decimals,
    maximumFractionDigits: conf.decimals,
  }).format(rounded);

  if (conf.symbolPosition === 'before') {
    return `${conf.symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${conf.symbol}`;
}
