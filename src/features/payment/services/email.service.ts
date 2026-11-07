import { CurrencyCode, formatCurrencyAmount } from '@/locales/currencies';
import { LOUGARA_RIB_CONFIG } from '../config/rib.config';
import { BankTransferDetails } from '../types';

export interface EmailLogEntry {
  id: string;
  to: string;
  subject: string;
  type: 'TRANSFER_INSTRUCTIONS' | 'PAYMENT_CONFIRMED' | 'PAYMENT_FAILED' | 'PASSWORD_CREATION_INVITE';
  orderReference: string;
  sentViaApi: boolean;
  createdAt: string;
}

const globalForEmails = globalThis as unknown as {
  emailLogs: EmailLogEntry[] | undefined;
};

if (!globalForEmails.emailLogs) {
  globalForEmails.emailLogs = [];
}

export function getSentEmailLogs(): EmailLogEntry[] {
  return globalForEmails.emailLogs || [];
}

async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
  type: EmailLogEntry['type'];
  orderReference: string;
  attachments?: Array<{ filename: string; content: string }>;
}): Promise<{ success: boolean; sentViaApi: boolean }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'Lougara Facturation <facturation@lougara.com>';
  let sentViaApi = false;

  if (resendApiKey && resendApiKey.trim() !== '') {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [params.to],
          subject: params.subject,
          html: params.html,
          attachments: params.attachments,
        }),
      });
      sentViaApi = res.ok;
    } catch (err) {
      console.warn('Erreur envoi Resend API (fallback journal local):', err);
    }
  }

  const logEntry: EmailLogEntry = {
    id: `eml_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    to: params.to,
    subject: params.subject,
    type: params.type,
    orderReference: params.orderReference,
    sentViaApi,
    createdAt: new Date().toISOString(),
  };

  globalForEmails.emailLogs?.unshift(logEntry);
  console.log(`📧 [EMAIL ${params.type}] Destinataire: ${params.to} | Sujet: ${params.subject}`);

  return { success: true, sentViaApi };
}

/**
 * 1. Email d'instructions de virement bancaire (RIB Lougara)
 */
export async function sendBankTransferInstructionsEmail(params: {
  to: string;
  customerName: string;
  planName: string;
  rib: BankTransferDetails;
}) {
  const { to, customerName, planName, rib } = params;
  const subject = `[Lougara] Instructions de virement bancaire — Réf. ${rib.reference}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0B132B; color: #F8FAFC; padding: 32px; border-radius: 16px; border: 1px solid #D4AF37;">
      <h2 style="color: #D4AF37; margin-top: 0;">Instructions de Virement Bancaire — Lougara</h2>
      <p>Bonjour <strong>${customerName}</strong>,</p>
      <p>Votre commande pour <strong>${planName}</strong> a bien été enregistrée avec le statut <strong>« En attente de virement »</strong>.</p>
      <p>Pour activer votre accès dans les plus brefs délais, veuillez effectuer un virement bancaire avec les coordonnées exactes ci-dessous :</p>
      
      <div style="background: #1E293B; padding: 20px; border-radius: 12px; border-left: 4px solid #D4AF37; margin: 20px 0;">
        <p style="margin: 6px 0;"><strong>Titulaire du compte :</strong> ${rib.holderName}</p>
        <p style="margin: 6px 0;"><strong>IBAN :</strong> <code style="color: #FBBF24; font-size: 15px;">${rib.iban}</code></p>
        <p style="margin: 6px 0;"><strong>BIC / SWIFT :</strong> <code style="color: #FBBF24;">${rib.bic}</code> (SWIFT banque partenaire si demandé : ${rib.partnerSwift})</p>
        <p style="margin: 6px 0;"><strong>Banque :</strong> ${rib.bankName}</p>
        <p style="margin: 6px 0;"><strong>Montant exact à virer :</strong> <strong style="color: #34D399; font-size: 16px;">${rib.exactAmountFormatted}</strong></p>
        <p style="margin: 10px 0 0 0; padding-top: 10px; border-top: 1px solid #334155;">
          <strong>Référence obligatoire à indiquer dans le libellé :</strong><br/>
          <span style="display: inline-block; margin-top: 6px; background: #D4AF37; color: #0B132B; padding: 6px 14px; border-radius: 6px; font-weight: bold; font-size: 16px;">${rib.reference}</span>
        </p>
      </div>

      <p style="font-size: 13px; color: #94A3B8;">
        Dès réception de votre virement sur notre compte professionnel, votre accès sera immédiatement activé et votre facture officielle acquittée vous sera transmise par email.
      </p>
      <p style="font-size: 12px; color: #64748B; margin-top: 24px;">
        ${LOUGARA_RIB_CONFIG.companyBrandName} — ${LOUGARA_RIB_CONFIG.ownerAddress}
      </p>
    </div>
  `;

  return dispatchEmail({
    to,
    subject,
    html,
    type: 'TRANSFER_INSTRUCTIONS',
    orderReference: rib.reference,
  });
}

/**
 * 2. Email de confirmation de paiement + Facture PDF en pièce jointe
 */
export async function sendPaymentConfirmedEmail(params: {
  to: string;
  customerName: string;
  planName: string;
  orderReference: string;
  invoiceNumber: string;
  amount: number;
  currency: CurrencyCode;
  pdfBuffer: Buffer;
}) {
  const formattedAmount = formatCurrencyAmount(params.amount, params.currency);
  const subject = `[Lougara] Paiement confirmé & Facture ${params.invoiceNumber} (${params.orderReference})`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lougara.com';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0B132B; color: #F8FAFC; padding: 32px; border-radius: 16px; border: 1px solid #10B981;">
      <h2 style="color: #34D399; margin-top: 0;">Paiement Confirmé & Accès Activé</h2>
      <p>Bonjour <strong>${params.customerName}</strong>,</p>
      <p>Nous vous confirmons la bonne réception de votre règlement de <strong>${formattedAmount}</strong> pour l'offre <strong>${params.planName}</strong>.</p>
      <p>Votre accès et vos quotas sur la plateforme <strong>Lougara B2B</strong> sont désormais pleinement actifs.</p>
      
      <div style="background: #1E293B; padding: 16px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Numéro de facture :</strong> ${params.invoiceNumber}</p>
        <p style="margin: 4px 0;"><strong>Référence de commande :</strong> ${params.orderReference}</p>
        <p style="margin: 4px 0;"><strong>Montant acquitté :</strong> ${formattedAmount}</p>
      </div>

      <p>Votre facture PDF officielle est jointe à cet email et reste téléchargeable à tout moment depuis votre espace client :</p>
      <p style="margin: 20px 0;">
        <a href="${appUrl}/paiement/historique" style="background: #D4AF37; color: #0B132B; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Consulter mon historique & mes factures
        </a>
      </p>
      <p style="font-size: 12px; color: #64748B; margin-top: 24px;">
        ${LOUGARA_RIB_CONFIG.companyBrandName} — ${LOUGARA_RIB_CONFIG.legalOwnerName} — ${LOUGARA_RIB_CONFIG.ownerAddress}
      </p>
    </div>
  `;

  return dispatchEmail({
    to: params.to,
    subject,
    html,
    type: 'PAYMENT_CONFIRMED',
    orderReference: params.orderReference,
    attachments: [
      {
        filename: `Facture-${params.invoiceNumber}.pdf`,
        content: params.pdfBuffer.toString('base64'),
      },
    ],
  });
}

/**
 * 3. Email d'alerte en cas de paiement échoué
 */
export async function sendPaymentFailedEmail(params: {
  to: string;
  customerName: string;
  planName: string;
  orderReference: string;
  reason?: string;
}) {
  const subject = `[Lougara] Échec de votre paiement — Réf. ${params.orderReference}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lougara.com';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0B132B; color: #F8FAFC; padding: 32px; border-radius: 16px; border: 1px solid #EF4444;">
      <h2 style="color: #F87171; margin-top: 0;">Information sur votre tentative de paiement</h2>
      <p>Bonjour <strong>${params.customerName}</strong>,</p>
      <p>La transaction concernant votre commande <strong>${params.planName}</strong> (Réf. <strong>${params.orderReference}</strong>) n'a pas pu aboutir.</p>
      ${params.reason ? `<p style="color: #FCA5A5;">Motif indiqué : ${params.reason}</p>` : ''}
      <p>Aucun montant n'a été débité. Vous pouvez réessayer par carte bancaire ou opter directement pour le <strong>Virement Bancaire (RIB)</strong> :</p>
      <p style="margin: 20px 0;">
        <a href="${appUrl}/paiement?ref=${encodeURIComponent(params.orderReference)}" style="background: #D4AF37; color: #0B132B; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Finaliser ma commande sur Lougara
        </a>
      </p>
    </div>
  `;

  return dispatchEmail({
    to: params.to,
    subject,
    html,
    type: 'PAYMENT_FAILED',
    orderReference: params.orderReference,
  });
}

/**
 * 4. Email envoyé au client lors de la création de son contact (Étape 4/5) pour créer son mot de passe
 */
export async function sendPasswordCreationEmail(params: {
  to: string;
  contactName: string;
  companyName?: string;
}) {
  const cleanEmail = params.to.trim().toLowerCase();
  const displayName = params.contactName.trim() || params.companyName || 'Partenaire Lougara';
  const companyLabel = params.companyName?.trim() || 'Votre Catalogue Professionnel';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lougara.com';
  const createPasswordUrl = `${appUrl}/connexion?mode=register_password&email=${encodeURIComponent(
    cleanEmail
  )}&company=${encodeURIComponent(companyLabel)}&name=${encodeURIComponent(displayName)}`;
  const loginCatalogUrl = `${appUrl}/connexion?email=${encodeURIComponent(
    cleanEmail
  )}&company=${encodeURIComponent(companyLabel)}`;

  const subject = `[Lougara] Créez votre mot de passe pour votre catalogue (${companyLabel})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0B132B; color: #F8FAFC; padding: 32px; border-radius: 16px; border: 1px solid #D4AF37;">
      <h2 style="color: #D4AF37; margin-top: 0;">Création de votre mot de passe client — Lougara B2B</h2>
      <p>Bonjour <strong>${displayName}</strong>,</p>
      <p>Votre contact commercial (Étape 4/5) pour le catalogue <strong>${companyLabel}</strong> a bien été enregistré sur la plateforme <strong>Lougara B2B</strong>.</p>
      <p>Pour faciliter votre connexion lorsque vous cliquez sur <strong>« Connexion »</strong> depuis votre catalogue, votre adresse e-mail (<strong style="color: #FBBF24;">${cleanEmail}</strong>) s'affichera automatiquement et il vous suffira de renseigner votre mot de passe.</p>
      
      <div style="background: #1E293B; padding: 20px; border-radius: 12px; border-left: 4px solid #D4AF37; margin: 20px 0;">
        <p style="margin: 6px 0;"><strong>Entreprise / Catalogue :</strong> ${companyLabel}</p>
        <p style="margin: 6px 0;"><strong>Identifiant (pré-rempli sur votre catalogue) :</strong> <code style="color: #FBBF24; font-size: 14px;">${cleanEmail}</code></p>
      </div>

      <p style="margin: 22px 0;">
        <a href="${createPasswordUrl}" style="background: #D4AF37; color: #0B132B; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Créer ou définir mon mot de passe
        </a>
      </p>

      <p style="font-size: 13px; color: #94A3B8;">
        Si vous avez déjà défini votre mot de passe à l'étape 4/5, vous pouvez vous connecter directement en un clic depuis votre catalogue ou via <a href="${loginCatalogUrl}" style="color: #FBBF24;">votre espace de connexion</a>.
      </p>
      <p style="font-size: 12px; color: #64748B; margin-top: 24px;">
        ${LOUGARA_RIB_CONFIG.companyBrandName} — ${LOUGARA_RIB_CONFIG.legalOwnerName} — ${LOUGARA_RIB_CONFIG.ownerAddress}
      </p>
    </div>
  `;

  return dispatchEmail({
    to: cleanEmail,
    subject,
    html,
    type: 'PASSWORD_CREATION_INVITE',
    orderReference: `PWD-${Date.now()}`,
  });
}
