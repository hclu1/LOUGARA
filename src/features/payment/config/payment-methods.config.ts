import { CurrencyCode } from '@/locales/currencies';
import { PaymentChannelType, PaymentProviderCode } from '../types';

export interface PaymentMethodOption {
  id: string;
  provider: PaymentProviderCode;
  channel: PaymentChannelType;
  labelFr: string;
  labelEn: string;
  descriptionFr: string;
  descriptionEn: string;
  badgeFr?: string;
  badgeEn?: string;
  logos: string[];
  supportsSubscriptions: boolean;
  supportsOneTime: boolean;
  requiresEnvActivation?: boolean;
}

export interface CountryPaymentConfig {
  countryCode: string;
  countryNameFr: string;
  countryNameEn: string;
  flag: string;
  defaultCurrency: CurrencyCode;
  supportedCurrencies: CurrencyCode[];
  availableMethods: PaymentMethodOption[];
}

/**
 * Catalogue déclaratif des moyens de paiement réutilisables par pays.
 */
export const PAYMENT_METHOD_CATALOG: Record<string, PaymentMethodOption> = {
  STRIPE_AUTOMATIC: {
    id: 'STRIPE_AUTOMATIC',
    provider: 'STRIPE',
    channel: 'card',
    labelFr: 'Carte Bancaire, Apple Pay, Google Pay, Link & SEPA',
    labelEn: 'Credit/Debit Card, Apple Pay, Google Pay, Link & SEPA',
    descriptionFr: 'Paiement instantané sécurisé 3D Secure (Visa, Mastercard, CB, Portefeuilles & SEPA).',
    descriptionEn: 'Instant 3D Secure payment (Visa, Mastercard, Wallets & SEPA Direct Debit).',
    badgeFr: 'Activation immédiate',
    badgeEn: 'Instant activation',
    logos: ['Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'Link', 'SEPA'],
    supportsSubscriptions: true,
    supportsOneTime: true,
  },
  BANK_TRANSFER_RIB: {
    id: 'BANK_TRANSFER_RIB',
    provider: 'BANK_TRANSFER',
    channel: 'bank_transfer',
    labelFr: 'Virement Bancaire (RIB IBAN / SEPA / SWIFT)',
    labelEn: 'Bank Wire Transfer (IBAN / SEPA / SWIFT)',
    descriptionFr: 'Réglez par virement sur le compte bancaire Lougara avec votre référence unique.',
    descriptionEn: 'Pay via bank transfer to Lougara account using your unique order reference.',
    badgeFr: 'Idéal Comptabilité B2B',
    badgeEn: 'B2B Accounting Friendly',
    logos: ['SEPA', 'IBAN', 'SWIFT'],
    supportsSubscriptions: true,
    supportsOneTime: true,
  },
  PAYDUNYA_MOBILE_MONEY: {
    id: 'PAYDUNYA_MOBILE_MONEY',
    provider: 'PAYDUNYA',
    channel: 'wave',
    labelFr: 'Wave & Orange Money (via PayDunya)',
    labelEn: 'Wave & Orange Money (via PayDunya)',
    descriptionFr: 'Paiement mobile instantané en Franc CFA (UEMOA : Sénégal, Côte d’Ivoire, Bénin, Togo, Mali, Burkina).',
    descriptionEn: 'Instant mobile payment in CFA Franc (WAEMU: Senegal, Ivory Coast, Benin, Togo, Mali, Burkina).',
    badgeFr: 'Mobile Money UEMOA',
    badgeEn: 'WAEMU Mobile Money',
    logos: ['Wave', 'Orange Money', 'Free Money', 'Moov'],
    supportsSubscriptions: true,
    supportsOneTime: true,
    requiresEnvActivation: true,
  },
  CINETPAY_MOBILE_MONEY: {
    id: 'CINETPAY_MOBILE_MONEY',
    provider: 'CINETPAY',
    channel: 'orange_money',
    labelFr: 'Orange Money, MTN MoMo & Moov (via CinetPay)',
    labelEn: 'Orange Money, MTN MoMo & Moov (via CinetPay)',
    descriptionFr: 'Paiement Mobile Money Afrique de l’Ouest & Centrale (XOF, XAF, GNF).',
    descriptionEn: 'Mobile Money for West & Central Africa (XOF, XAF, GNF).',
    badgeFr: 'Afrique Francophone',
    badgeEn: 'Francophone Africa',
    logos: ['Orange Money', 'MTN MoMo', 'Moov Money', 'Wave'],
    supportsSubscriptions: true,
    supportsOneTime: true,
    requiresEnvActivation: true,
  },
  FLUTTERWAVE_AFRICA: {
    id: 'FLUTTERWAVE_AFRICA',
    provider: 'FLUTTERWAVE',
    channel: 'mtn_momo',
    labelFr: 'Mobile Money & Cartes Locales (via Flutterwave)',
    labelEn: 'Mobile Money & Local Cards (via Flutterwave)',
    descriptionFr: 'Support panafricain multi-devises (MTN, Airtel, M-Pesa, Virements NGN/XAF/USD).',
    descriptionEn: 'Pan-African multi-currency support (MTN, Airtel, M-Pesa, NGN/XAF/USD transfers).',
    badgeFr: 'Panafricain',
    badgeEn: 'Pan-African',
    logos: ['Flutterwave', 'MTN MoMo', 'Airtel', 'Verve'],
    supportsSubscriptions: true,
    supportsOneTime: true,
    requiresEnvActivation: true,
  },
};

/**
 * Configuration déclarative Pays -> Devise par défaut -> Moyens de paiement disponibles.
 * Pour ajouter un nouveau pays, il suffit d'ajouter une entrée dans ce tableau sans modifier le code métier.
 */
export const COUNTRY_PAYMENT_CONFIGS: CountryPaymentConfig[] = [
  {
    countryCode: 'FR',
    countryNameFr: 'France & Zone Euro',
    countryNameEn: 'France & Eurozone',
    flag: '🇫🇷',
    defaultCurrency: 'EUR',
    supportedCurrencies: ['EUR', 'USD'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
    ],
  },
  {
    countryCode: 'BE',
    countryNameFr: 'Belgique / Suisse / Luxembourg',
    countryNameEn: 'Belgium / Switzerland / Luxembourg',
    flag: '🇧🇪',
    defaultCurrency: 'EUR',
    supportedCurrencies: ['EUR', 'USD'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
    ],
  },
  {
    countryCode: 'SN',
    countryNameFr: 'Sénégal',
    countryNameEn: 'Senegal',
    flag: '🇸🇳',
    defaultCurrency: 'XOF',
    supportedCurrencies: ['XOF', 'EUR', 'USD'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
      PAYMENT_METHOD_CATALOG.PAYDUNYA_MOBILE_MONEY,
      PAYMENT_METHOD_CATALOG.CINETPAY_MOBILE_MONEY,
    ],
  },
  {
    countryCode: 'CI',
    countryNameFr: 'Côte d’Ivoire',
    countryNameEn: 'Ivory Coast',
    flag: '🇨🇮',
    defaultCurrency: 'XOF',
    supportedCurrencies: ['XOF', 'EUR', 'USD'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
      PAYMENT_METHOD_CATALOG.CINETPAY_MOBILE_MONEY,
      PAYMENT_METHOD_CATALOG.PAYDUNYA_MOBILE_MONEY,
    ],
  },
  {
    countryCode: 'CM',
    countryNameFr: 'Cameroun',
    countryNameEn: 'Cameroon',
    flag: '🇨🇲',
    defaultCurrency: 'XAF',
    supportedCurrencies: ['XAF', 'EUR', 'USD'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
      PAYMENT_METHOD_CATALOG.CINETPAY_MOBILE_MONEY,
      PAYMENT_METHOD_CATALOG.FLUTTERWAVE_AFRICA,
    ],
  },
  {
    countryCode: 'GA',
    countryNameFr: 'Gabon / Congo / Tchad (CEMAC)',
    countryNameEn: 'Gabon / Congo / Chad (CEMAC)',
    flag: '🇬🇦',
    defaultCurrency: 'XAF',
    supportedCurrencies: ['XAF', 'EUR', 'USD'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
      PAYMENT_METHOD_CATALOG.CINETPAY_MOBILE_MONEY,
      PAYMENT_METHOD_CATALOG.FLUTTERWAVE_AFRICA,
    ],
  },
  {
    countryCode: 'BJ',
    countryNameFr: 'Bénin / Togo / Burkina / Mali',
    countryNameEn: 'Benin / Togo / Burkina / Mali',
    flag: '🇧🇯',
    defaultCurrency: 'XOF',
    supportedCurrencies: ['XOF', 'EUR', 'USD'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
      PAYMENT_METHOD_CATALOG.CINETPAY_MOBILE_MONEY,
      PAYMENT_METHOD_CATALOG.PAYDUNYA_MOBILE_MONEY,
    ],
  },
  {
    countryCode: 'GN',
    countryNameFr: 'Guinée (Conakry)',
    countryNameEn: 'Guinea (Conakry)',
    flag: '🇬🇳',
    defaultCurrency: 'GNF',
    supportedCurrencies: ['GNF', 'EUR', 'USD'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
      PAYMENT_METHOD_CATALOG.CINETPAY_MOBILE_MONEY,
    ],
  },
  {
    countryCode: 'MA',
    countryNameFr: 'Maroc / Maghreb',
    countryNameEn: 'Morocco / Maghreb',
    flag: '🇲🇦',
    defaultCurrency: 'MAD',
    supportedCurrencies: ['MAD', 'EUR', 'USD'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
    ],
  },
  {
    countryCode: 'NG',
    countryNameFr: 'Nigéria / Ghana / Afrique Anglophone',
    countryNameEn: 'Nigeria / Ghana / Anglophone Africa',
    flag: '🇳🇬',
    defaultCurrency: 'NGN',
    supportedCurrencies: ['NGN', 'USD', 'EUR'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.FLUTTERWAVE_AFRICA,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
    ],
  },
  {
    countryCode: 'CD',
    countryNameFr: 'RD Congo (RDC)',
    countryNameEn: 'DR Congo (DRC)',
    flag: '🇨🇩',
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.CINETPAY_MOBILE_MONEY,
      PAYMENT_METHOD_CATALOG.FLUTTERWAVE_AFRICA,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
    ],
  },
  {
    countryCode: 'INTL',
    countryNameFr: 'International (Amérique, Asie, Moyen-Orient)',
    countryNameEn: 'International (Americas, Asia, Middle East)',
    flag: '🌍',
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR'],
    availableMethods: [
      PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
      PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
    ],
  },
];

/**
 * Retourne la configuration de paiement correspondant au code pays (fallback sur FR).
 */
export function getCountryPaymentConfig(countryCode?: string): CountryPaymentConfig {
  if (!countryCode) return COUNTRY_PAYMENT_CONFIGS[0];
  const normalized = countryCode.trim().toUpperCase();
  return (
    COUNTRY_PAYMENT_CONFIGS.find((c) => c.countryCode === normalized) ||
    COUNTRY_PAYMENT_CONFIGS[0]
  );
}
