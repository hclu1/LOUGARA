import { CurrencyCode, formatCurrencyAmount } from '@/locales/currencies';
import { BankTransferDetails } from '../types';

/**
 * Coordonnées bancaires officielles (RIB Qonto Lougara) et mentions légales
 * pour les virements bancaires et la génération des factures PDF.
 */
export const LOUGARA_RIB_CONFIG = {
  companyBrandName: process.env.LEGAL_COMPANY_NAME || 'Lougara',
  holderName:
    process.env.BANK_TRANSFER_HOLDER ||
    'Lougara (EI - CHAMPAGNE Christelle / Mimonga)',
  legalOwnerName:
    process.env.LEGAL_HOLDER_NAME || 'EI - CHAMPAGNE Christelle / Mimonga',
  ownerAddress:
    process.env.LEGAL_ADDRESS ||
    '30 BIS RUE du Vieil Abreuvoir, 78100 Saint-Germain-en-Laye, France',
  iban: process.env.BANK_TRANSFER_IBAN || 'FR76 1695 8000 0112 9657 5872 333',
  bic: process.env.BANK_TRANSFER_BIC || 'QNTOFRP1XXX',
  partnerSwift: process.env.BANK_TRANSFER_PARTNER_SWIFT || 'TRWIBEB3XXX',
  bankName:
    process.env.BANK_TRANSFER_BANK_NAME ||
    'Qonto SA, 18 rue de Navarin, 75009 Paris, France',
  siret:
    process.env.LEGAL_SIRET ||
    'EI - CHAMPAGNE Christelle / Mimonga (Saint-Germain-en-Laye)',
  vatNotice:
    process.env.LEGAL_VAT_NOTICE || 'TVA non applicable, art. 293 B du CGI',
  supportEmail: 'contact@lougara.com',
};

/**
 * Construit l'objet complet des instructions de virement bancaire pour une commande.
 */
export function buildBankTransferInstructions(
  reference: string,
  amount: number,
  currency: CurrencyCode
): BankTransferDetails {
  return {
    holderName: LOUGARA_RIB_CONFIG.holderName,
    iban: LOUGARA_RIB_CONFIG.iban,
    bic: LOUGARA_RIB_CONFIG.bic,
    partnerSwift: LOUGARA_RIB_CONFIG.partnerSwift,
    bankName: LOUGARA_RIB_CONFIG.bankName,
    ownerAddress: LOUGARA_RIB_CONFIG.ownerAddress,
    reference,
    amount,
    currency,
    exactAmountFormatted: formatCurrencyAmount(amount, currency),
  };
}
