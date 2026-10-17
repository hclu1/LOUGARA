import crypto from 'crypto';
import { CurrencyCode, LOCAL_PRICES, SUPPORTED_CURRENCIES } from '@/locales/currencies';
import { PaymentBillingCycleType } from '../types';

export interface ResolvedPlanPricing {
  planCode: string;
  planNameFr: string;
  planNameEn: string;
  targetRole: 'SUPPLIER' | 'BUYER' | 'CREDIT';
  billingCycle: PaymentBillingCycleType;
  amount: number;
  currency: CurrencyCode;
  creditsIncluded: number;
  maxProducts: number;
}

const PLAN_METADATA: Record<
  string,
  {
    nameFr: string;
    nameEn: string;
    targetRole: 'SUPPLIER' | 'BUYER' | 'CREDIT';
    creditsIncluded: number;
    maxProducts: number;
    forcedCycle?: PaymentBillingCycleType;
  }
> = {
  SUPPLIER_ESSENTIAL: {
    nameFr: 'Formule Fournisseur — Catalogue Essentiel',
    nameEn: 'Supplier Plan — Essential Catalog',
    targetRole: 'SUPPLIER',
    creditsIncluded: 0,
    maxProducts: 20,
  },
  SUPPLIER_PRO: {
    nameFr: 'Formule Fournisseur — Catalogue Pro (Badge KYB)',
    nameEn: 'Supplier Plan — Pro Catalog (KYB Badge)',
    targetRole: 'SUPPLIER',
    creditsIncluded: 0,
    maxProducts: 50,
  },
  SUPPLIER_PREMIUM: {
    nameFr: 'Formule Fournisseur — Catalogue Premium Industriel',
    nameEn: 'Supplier Plan — Industrial Premium Catalog',
    targetRole: 'SUPPLIER',
    creditsIncluded: 0,
    maxProducts: 100,
  },
  BUYER_ESSENTIAL: {
    nameFr: 'Formule Entrepreneur — Sourcing Essentiel (3 contacts/mois)',
    nameEn: 'Entrepreneur Plan — Essential Sourcing (3 contacts/mo)',
    targetRole: 'BUYER',
    creditsIncluded: 3,
    maxProducts: 0,
  },
  BUYER_PRO: {
    nameFr: 'Formule Entrepreneur — Sourcing Pro (15 contacts/mois)',
    nameEn: 'Entrepreneur Plan — Pro Sourcing (15 contacts/mo)',
    targetRole: 'BUYER',
    creditsIncluded: 15,
    maxProducts: 0,
  },
  BUYER_VIP: {
    nameFr: 'Formule Entrepreneur — Centrale d’Achat VIP (50 contacts/mois)',
    nameEn: 'Entrepreneur Plan — VIP Purchasing Hub (50 contacts/mo)',
    targetRole: 'BUYER',
    creditsIncluded: 50,
    maxProducts: 0,
  },
  CREDIT_PACK_1: {
    nameFr: 'Pack Flash — 1 Crédit de Mise en Relation B2B',
    nameEn: 'Flash Pack — 1 B2B Connection Credit',
    targetRole: 'CREDIT',
    creditsIncluded: 1,
    maxProducts: 0,
    forcedCycle: 'ONE_TIME',
  },
  CREDIT_PACK_5: {
    nameFr: 'Pack Croissance — 5 Crédits de Mise en Relation B2B',
    nameEn: 'Growth Pack — 5 B2B Connection Credits',
    targetRole: 'CREDIT',
    creditsIncluded: 5,
    maxProducts: 0,
    forcedCycle: 'ONE_TIME',
  },
  CREDIT_PACK_15: {
    nameFr: 'Pack Volume — 15 Crédits de Mise en Relation B2B',
    nameEn: 'Volume Pack — 15 B2B Connection Credits',
    targetRole: 'CREDIT',
    creditsIncluded: 15,
    maxProducts: 0,
    forcedCycle: 'ONE_TIME',
  },
  // Compatibilité avec les anciens codes V1
  STANDARD: {
    nameFr: 'Formule Standard Lougara',
    nameEn: 'Lougara Standard Plan',
    targetRole: 'SUPPLIER',
    creditsIncluded: 15,
    maxProducts: 15,
  },
  PREMIUM: {
    nameFr: 'Formule Premium Lougara',
    nameEn: 'Lougara Premium Plan',
    targetRole: 'SUPPLIER',
    creditsIncluded: 50,
    maxProducts: 50,
  },
  VIP: {
    nameFr: 'Formule VIP Enterprise Lougara',
    nameEn: 'Lougara VIP Enterprise Plan',
    targetRole: 'SUPPLIER',
    creditsIncluded: 100,
    maxProducts: -1,
  },
};

const LEGACY_MAPPING: Record<string, string> = {
  STANDARD: 'SUPPLIER_ESSENTIAL',
  PREMIUM: 'SUPPLIER_PRO',
  VIP: 'SUPPLIER_PREMIUM',
};

/**
 * Calcule et valide le montant exact d'une offre côté serveur.
 * Ne fait JAMAIS confiance au montant envoyé par le navigateur.
 */
export function resolveServerOrderPricing(
  rawPlanCode: string,
  requestedCycle: PaymentBillingCycleType = 'MONTHLY',
  requestedCurrency: string = 'EUR'
): ResolvedPlanPricing {
  const normalizedCode = (rawPlanCode || '').trim().toUpperCase();
  const meta = PLAN_METADATA[normalizedCode];

  if (!meta) {
    throw new Error(`Code d'offre ou de forfait invalide : ${rawPlanCode}`);
  }

  const currency: CurrencyCode =
    requestedCurrency.toUpperCase() in SUPPORTED_CURRENCIES
      ? (requestedCurrency.toUpperCase() as CurrencyCode)
      : 'EUR';

  const effectiveCycle: PaymentBillingCycleType = meta.forcedCycle || requestedCycle;
  const priceKey = LEGACY_MAPPING[normalizedCode] || normalizedCode;
  const currencyMatrix = LOCAL_PRICES[priceKey];

  if (!currencyMatrix || !currencyMatrix[currency]) {
    throw new Error(`Tarif introuvable pour l'offre ${normalizedCode} en devise ${currency}`);
  }

  const priceEntry = currencyMatrix[currency];
  const amount =
    effectiveCycle === 'ANNUAL' ? priceEntry.annual : priceEntry.monthly;

  if (amount <= 0) {
    throw new Error(`L'offre ${normalizedCode} est gratuite et ne nécessite pas de paiement.`);
  }

  return {
    planCode: normalizedCode,
    planNameFr: meta.nameFr,
    planNameEn: meta.nameEn,
    targetRole: meta.targetRole,
    billingCycle: effectiveCycle,
    amount,
    currency,
    creditsIncluded: meta.creditsIncluded,
    maxProducts: meta.maxProducts,
  };
}

/**
 * Génère une référence de commande unique et lisible pour les libellés de virement (ex: LOU-2026-4829).
 */
export function generateOrderReference(date: Date = new Date()): string {
  const year = date.getFullYear();
  const randomChars = crypto.randomBytes(2).toString('hex').toUpperCase();
  const randomDigits = Math.floor(10 + Math.random() * 90);
  return `LOU-${year}-${randomDigits}${randomChars.slice(0, 2)}`;
}
