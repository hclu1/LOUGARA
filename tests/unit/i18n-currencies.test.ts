import { describe, it, expect } from 'vitest';
import {
  translations,
  SUPPORTED_CURRENCIES,
  LOCAL_PRICES,
  formatCurrencyAmount,
  CurrencyCode,
} from '../../src/locales';
import { prisma } from '../../src/lib/prisma';

describe('Internationalisation i18n & Multidevises Lougara B2B', () => {
  it('doit contenir les dictionnaires FR et EN avec les sections clés', () => {
    expect(translations.fr).toBeDefined();
    expect(translations.en).toBeDefined();

    expect(translations.fr.nav.catalog).toBe('Catalogue & Sourcing');
    expect(translations.en.nav.catalog).toBe('Catalog & Sourcing');

    expect(translations.fr.pricing.title).toContain('Lougara B2B');
    expect(translations.en.pricing.title).toContain('Lougara B2B');
  });

  it('doit supporter toutes les devises obligatoires (EUR, USD, XOF, XAF, GNF, MAD, NGN)', () => {
    const requiredCurrencies: CurrencyCode[] = ['EUR', 'USD', 'XOF', 'XAF', 'GNF', 'MAD', 'NGN'];
    requiredCurrencies.forEach((code) => {
      expect(SUPPORTED_CURRENCIES[code]).toBeDefined();
      expect(SUPPORTED_CURRENCIES[code].symbol).toBeTruthy();
      expect(SUPPORTED_CURRENCIES[code].label).toBeTruthy();
    });
  });

  it('doit formater correctement les montants avec les règles de décimales locales', () => {
    // FCFA (XOF) n'a pas de centimes
    const xofFormatted = formatCurrencyAmount(19000, 'XOF');
    expect(xofFormatted).toContain('FCFA');
    expect(xofFormatted).toMatch(/19[, ]000 FCFA/);

    // Dollar américain affiche le symbole devant
    const usdFormatted = formatCurrencyAmount(32, 'USD');
    expect(usdFormatted.startsWith('$')).toBe(true);

    // Euro affiche le symbole après
    const eurFormatted = formatCurrencyAmount(29, 'EUR');
    expect(eurFormatted.includes('€')).toBe(true);
  });

  it('doit posséder une grille de prix locaux fixes pour tous les forfaits', () => {
    expect(LOCAL_PRICES.SUPPLIER_PRO.EUR.monthly).toBe(69);
    expect(LOCAL_PRICES.SUPPLIER_PRO.XOF.monthly).toBe(45000);
    expect(LOCAL_PRICES.BUYER_ESSENTIAL.EUR.monthly).toBe(19);
    expect(LOCAL_PRICES.BUYER_ESSENTIAL.XOF.monthly).toBe(12500);
    expect(LOCAL_PRICES.CREDIT_PACK_1.EUR.monthly).toBe(9);
    expect(LOCAL_PRICES.CREDIT_PACK_1.XOF.monthly).toBe(6000);
  });

  it('doit exposer les nouveaux modèles Prisma de monétisation et contacts', () => {
    expect(prisma.subscriptionPlanV2).toBeDefined();
    expect(prisma.planPrice).toBeDefined();
    expect(prisma.contactCredit).toBeDefined();
    expect(prisma.contactRequest).toBeDefined();
    expect(prisma.billingEvent).toBeDefined();
  });
});
