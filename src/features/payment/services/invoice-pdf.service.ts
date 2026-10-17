import { CurrencyCode, formatCurrencyAmount } from '@/locales/currencies';
import { LOUGARA_RIB_CONFIG } from '../config/rib.config';

export interface InvoiceDocumentData {
  invoiceNumber: string; // Ex: FAC-2026-0001
  orderReference: string; // Ex: LOU-2026-4829
  issuedAt: Date;
  paidAt?: Date | null;
  customerName: string;
  customerCompany?: string | null;
  customerEmail: string;
  customerAddress?: string | null;
  planName: string;
  billingCycle: string;
  paymentProvider: string;
  amountHt: number;
  taxRate: number;
  taxAmount: number;
  amountTtc: number;
  currency: CurrencyCode;
}

/**
 * Nettoie une chaîne pour l'encodage WinAnsi PDF (remplace les caractères spéciaux hors ASCII/Latin-1).
 */
function sanitizePdfText(text: string): string {
  return text
    .replace(/€/g, 'EUR')
    .replace(/₦/g, 'NGN ')
    .replace(/[—–]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents combinés pour compatibilité 100% lecteurs PDF
    .replace(/[()\\]/g, '');
}

/**
 * Génère un fichier PDF 1.4 binaire natif, valide et téléchargeable sans dépendance externe lourde.
 * Contient la numérotation séquentielle (FAC-AAAA-XXXX) et toutes les mentions légales de Lougara.
 */
export function generateInvoicePdfBuffer(data: InvoiceDocumentData): Buffer {
  const issueDateStr = data.issuedAt.toISOString().split('T')[0];
  const paidDateStr = (data.paidAt || data.issuedAt).toISOString().split('T')[0];

  const cycleLabel =
    data.billingCycle === 'ANNUAL'
      ? 'Abonnement Annuel (12 mois)'
      : data.billingCycle === 'MONTHLY'
        ? 'Abonnement Mensuel'
        : 'Achat unitaire (Pack Credits)';

  const htFormatted = sanitizePdfText(formatCurrencyAmount(data.amountHt, data.currency));
  const taxFormatted = sanitizePdfText(formatCurrencyAmount(data.taxAmount, data.currency));
  const ttcFormatted = sanitizePdfText(formatCurrencyAmount(data.amountTtc, data.currency));

  const lines: Array<{ x: number; y: number; size: number; bold?: boolean; text: string }> = [
    // En-tête Société Lougara
    { x: 50, y: 780, size: 20, bold: true, text: 'LOUGARA B2B' },
    { x: 50, y: 762, size: 10, bold: true, text: sanitizePdfText(LOUGARA_RIB_CONFIG.holderName) },
    { x: 50, y: 748, size: 9, text: sanitizePdfText(LOUGARA_RIB_CONFIG.ownerAddress) },
    { x: 50, y: 735, size: 9, text: `SIRET / Immatriculation : ${sanitizePdfText(LOUGARA_RIB_CONFIG.siret)}` },
    { x: 50, y: 722, size: 9, text: `Email : ${LOUGARA_RIB_CONFIG.supportEmail} | Web : https://lougara.com` },

    // Bloc Numéro de Facture (Droite)
    { x: 350, y: 780, size: 16, bold: true, text: `FACTURE ${sanitizePdfText(data.invoiceNumber)}` },
    { x: 350, y: 762, size: 10, text: `Date d'emission : ${issueDateStr}` },
    { x: 350, y: 748, size: 10, text: `Date de reglement : ${paidDateStr}` },
    { x: 350, y: 734, size: 10, bold: true, text: `Ref. Commande : ${sanitizePdfText(data.orderReference)}` },
    { x: 350, y: 720, size: 10, bold: true, text: 'Statut : PAYEE / ACQUITTEE' },

    // Séparateur
    { x: 50, y: 695, size: 10, text: '------------------------------------------------------------------------------------------------------' },

    // Bloc Client (Facturé à)
    { x: 50, y: 672, size: 11, bold: true, text: 'FACTURE A (CLIENT) :' },
    { x: 50, y: 656, size: 10, bold: true, text: sanitizePdfText(data.customerCompany || data.customerName) },
    { x: 50, y: 642, size: 10, text: `Contact : ${sanitizePdfText(data.customerName)}` },
    { x: 50, y: 628, size: 10, text: `Email : ${sanitizePdfText(data.customerEmail)}` },
    { x: 50, y: 614, size: 10, text: `Localisation : ${sanitizePdfText(data.customerAddress || 'Client B2B International')}` },

    // Tableau des prestations
    { x: 50, y: 580, size: 10, text: '------------------------------------------------------------------------------------------------------' },
    { x: 50, y: 564, size: 10, bold: true, text: 'DESIGNATION DE LA PRESTATION' },
    { x: 340, y: 564, size: 10, bold: true, text: 'CYCLE' },
    { x: 460, y: 564, size: 10, bold: true, text: 'MONTANT HT' },
    { x: 50, y: 550, size: 10, text: '------------------------------------------------------------------------------------------------------' },

    { x: 50, y: 530, size: 10, bold: true, text: sanitizePdfText(data.planName) },
    { x: 340, y: 530, size: 9, text: sanitizePdfText(cycleLabel) },
    { x: 460, y: 530, size: 10, bold: true, text: htFormatted },
    { x: 50, y: 514, size: 9, text: `Moyen de paiement : ${sanitizePdfText(data.paymentProvider)} (Ref. ${sanitizePdfText(data.orderReference)})` },

    { x: 50, y: 485, size: 10, text: '------------------------------------------------------------------------------------------------------' },

    // Totaux
    { x: 340, y: 460, size: 10, text: 'Total Hors Taxes (HT) :' },
    { x: 460, y: 460, size: 10, bold: true, text: htFormatted },

    { x: 340, y: 442, size: 10, text: `TVA (${data.taxRate}%) :` },
    { x: 460, y: 442, size: 10, text: taxFormatted },

    { x: 340, y: 420, size: 12, bold: true, text: 'NET A PAYER (TTC) :' },
    { x: 460, y: 420, size: 12, bold: true, text: ttcFormatted },

    // Mentions fiscales & RIB
    { x: 50, y: 370, size: 9, bold: true, text: `Mention legale TVA : ${sanitizePdfText(LOUGARA_RIB_CONFIG.vatNotice)}` },
    { x: 50, y: 354, size: 9, text: 'Facture acquittee. Aucun escompte pour paiement anticipe.' },

    { x: 50, y: 320, size: 10, bold: true, text: 'COORDONNEES BANCAIRES DE LA SOCIETE (RIB QONTO) :' },
    { x: 50, y: 304, size: 9, text: `Titulaire : ${sanitizePdfText(LOUGARA_RIB_CONFIG.holderName)}` },
    { x: 50, y: 290, size: 9, text: `IBAN : ${sanitizePdfText(LOUGARA_RIB_CONFIG.iban)} | BIC/SWIFT : ${sanitizePdfText(LOUGARA_RIB_CONFIG.bic)}` },
    { x: 50, y: 276, size: 9, text: `Domiciliation : ${sanitizePdfText(LOUGARA_RIB_CONFIG.bankName)}` },

    // Pied de page
    { x: 50, y: 80, size: 8, text: '------------------------------------------------------------------------------------------------------' },
    {
      x: 50,
      y: 65,
      size: 8,
      text: sanitizePdfText(
        `${LOUGARA_RIB_CONFIG.companyBrandName} - ${LOUGARA_RIB_CONFIG.legalOwnerName} - ${LOUGARA_RIB_CONFIG.ownerAddress}`
      ),
    },
  ];

  const streamCommands = lines
    .map((line) => {
      const font = line.bold ? '/F2' : '/F1';
      return `BT ${font} ${line.size} Tf ${line.x} ${line.y} Td (${line.text}) Tj ET`;
    })
    .join('\n');

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj'
  );
  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(streamCommands, 'utf8')} >>\nstream\n${streamCommands}\nendstream\nendobj`
  );
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj'
  );
  objects.push(
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj'
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj + '\n';
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}
