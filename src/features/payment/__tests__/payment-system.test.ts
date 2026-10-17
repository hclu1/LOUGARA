import { describe, it, expect } from 'vitest';
import { getCountryPaymentConfig } from '../config/payment-methods.config';
import { buildBankTransferInstructions, LOUGARA_RIB_CONFIG } from '../config/rib.config';
import { getPaymentProvider } from '../providers';
import { toStripeSmallestUnit } from '../providers/stripe.provider';
import {
  checkAndRecordWebhookIdempotence,
  createPaymentOrderRecord,
  fulfillPaymentOrder,
} from '../services/fulfillment.service';
import { generateInvoicePdfBuffer } from '../services/invoice-pdf.service';
import {
  generateOrderReference,
  resolveServerOrderPricing,
} from '../services/pricing.service';

describe('Système de Paiement Modulaire Lougara', () => {
  it('valide les montants côté serveur pour EUR, XOF, XAF et USD sans faire confiance au client', () => {
    const proEurMonthly = resolveServerOrderPricing('SUPPLIER_PRO', 'MONTHLY', 'EUR');
    expect(proEurMonthly.amount).toBe(69);
    expect(proEurMonthly.currency).toBe('EUR');

    const proXofAnnual = resolveServerOrderPricing('SUPPLIER_PRO', 'ANNUAL', 'XOF');
    expect(proXofAnnual.amount).toBe(430000);
    expect(proXofAnnual.currency).toBe('XOF');

    const pack5Xaf = resolveServerOrderPricing('CREDIT_PACK_5', 'MONTHLY', 'XAF');
    expect(pack5Xaf.billingCycle).toBe('ONE_TIME');
    expect(pack5Xaf.amount).toBe(25000);
    expect(pack5Xaf.creditsIncluded).toBe(5);

    expect(() => resolveServerOrderPricing('SUPPLIER_FREE', 'MONTHLY', 'EUR')).toThrow();
    expect(() => resolveServerOrderPricing('PLAN_INCONNU', 'MONTHLY', 'EUR')).toThrow();
  });

  it('génère une référence unique au format LOU-AAAA-XXXX', () => {
    const ref = generateOrderReference(new Date('2026-10-17T10:00:00Z'));
    expect(ref).toMatch(/^LOU-2026-[A-Z0-9]{4}$/);
  });

  it('expose les coordonnées exactes du RIB Lougara (Qonto) pour le virement bancaire', async () => {
    const rib = buildBankTransferInstructions('LOU-2026-9988', 69, 'EUR');
    expect(rib.holderName).toContain('Lougara');
    expect(rib.iban).toBe('FR76 1695 8000 0112 9657 5872 333');
    expect(rib.bic).toBe('QNTOFRP1XXX');
    expect(rib.partnerSwift).toBe('TRWIBEB3XXX');
    expect(rib.reference).toBe('LOU-2026-9988');

    const bankProvider = getPaymentProvider('BANK_TRANSFER');
    const created = await bankProvider.createPayment({
      orderId: 'ord_test_1',
      reference: 'LOU-2026-9988',
      planCode: 'SUPPLIER_PRO',
      planName: 'Formule Pro',
      billingCycle: 'MONTHLY',
      amount: 69,
      currency: 'EUR',
      customerEmail: 'client@test-lougara.com',
      countryCode: 'FR',
      returnUrl: 'https://lougara.com/paiement/succes',
      cancelUrl: 'https://lougara.com/paiement/echec',
    });

    expect(created.success).toBe(true);
    expect(created.status).toBe('WAITING_TRANSFER');
    expect(created.bankTransferDetails?.iban).toBe(LOUGARA_RIB_CONFIG.iban);
  });

  it('sélectionne automatiquement la devise et les moyens de paiement selon le pays', () => {
    const fr = getCountryPaymentConfig('FR');
    expect(fr.defaultCurrency).toBe('EUR');
    expect(fr.availableMethods.map((m) => m.provider)).toContain('STRIPE');
    expect(fr.availableMethods.map((m) => m.provider)).toContain('BANK_TRANSFER');

    const sn = getCountryPaymentConfig('SN');
    expect(sn.defaultCurrency).toBe('XOF');
    expect(sn.availableMethods.map((m) => m.provider)).toContain('PAYDUNYA');
    expect(sn.availableMethods.map((m) => m.provider)).toContain('CINETPAY');

    const cm = getCountryPaymentConfig('CM');
    expect(cm.defaultCurrency).toBe('XAF');
    expect(cm.availableMethods.map((m) => m.provider)).toContain('FLUTTERWAVE');
  });

  it('convertit correctement les devises avec et sans décimales pour Stripe', () => {
    expect(toStripeSmallestUnit(69, 'EUR')).toBe(6900);
    expect(toStripeSmallestUnit(75, 'USD')).toBe(7500);
    // XOF et XAF sont des devises zéro-décimale dans Stripe
    expect(toStripeSmallestUnit(45000, 'XOF')).toBe(45000);
    expect(toStripeSmallestUnit(45000, 'XAF')).toBe(45000);
  });

  it('garantit l’idempotence des webhooks et la génération de facture PDF séquentielle lors de la validation Admin', async () => {
    const eventId = `evt_test_${Date.now()}`;
    const firstCheck = await checkAndRecordWebhookIdempotence({
      provider: 'STRIPE',
      eventId,
      eventType: 'payment_intent.succeeded',
    });
    expect(firstCheck).toBe(false);

    const duplicateCheck = await checkAndRecordWebhookIdempotence({
      provider: 'STRIPE',
      eventId,
      eventType: 'payment_intent.succeeded',
    });
    expect(duplicateCheck).toBe(true);

    // Création d'une commande en attente de virement puis validation Admin "Marquer comme payé"
    const ref = generateOrderReference();
    await createPaymentOrderRecord({
      reference: ref,
      customerEmail: 'acheteur@lougara-test.com',
      customerName: 'Amadou Diallo',
      companyName: 'Sahel Distribution SARL',
      countryCode: 'SN',
      planCode: 'BUYER_PRO',
      planName: 'Entrepreneur Pro',
      billingCycle: 'MONTHLY',
      amount: 32000,
      currency: 'XOF',
      provider: 'BANK_TRANSFER',
      status: 'WAITING_TRANSFER',
    });

    const fulfillment1 = await fulfillPaymentOrder({
      orderIdentifier: ref,
      validatedByEmail: 'champagcrypt@gmail.com',
    });
    expect(fulfillment1.success).toBe(true);
    expect(fulfillment1.alreadyPaid).toBe(false);
    expect(fulfillment1.order.status).toBe('PAID');
    expect(fulfillment1.invoiceNumber).toMatch(/^FAC-\d{4}-\d{4}$/);

    // Appel doublon idempotent
    const fulfillment2 = await fulfillPaymentOrder({
      orderIdentifier: ref,
      validatedByEmail: 'champagcrypt@gmail.com',
    });
    expect(fulfillment2.alreadyPaid).toBe(true);
    expect(fulfillment2.invoiceNumber).toBe(fulfillment1.invoiceNumber);

    // Vérification du binaire PDF généré
    const pdfBuffer = generateInvoicePdfBuffer({
      invoiceNumber: fulfillment1.invoiceNumber,
      orderReference: ref,
      issuedAt: new Date(),
      paidAt: new Date(),
      customerName: 'Amadou Diallo',
      customerCompany: 'Sahel Distribution SARL',
      customerEmail: 'acheteur@lougara-test.com',
      planName: 'Entrepreneur Pro',
      billingCycle: 'MONTHLY',
      paymentProvider: 'BANK_TRANSFER',
      amountHt: 32000,
      taxRate: 0,
      taxAmount: 0,
      amountTtc: 32000,
      currency: 'XOF',
    });

    const pdfContent = pdfBuffer.toString('utf8');
    expect(pdfContent.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfContent).toContain('LOUGARA B2B');
    expect(pdfContent).toContain('FR76 1695 8000 0112 9657 5872 333');
    expect(pdfContent).toContain(fulfillment1.invoiceNumber);
  });
});
