import { buildBankTransferInstructions } from '../config/rib.config';
import { PaymentProvider } from '../provider.interface';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
  RefundInput,
  RefundOutput,
  VerifyPaymentOutput,
  WebhookResult,
} from '../types';

/**
 * Prestataire de Virement Bancaire Manuel (RIB Lougara / Qonto).
 * Génère les instructions de virement avec la référence unique LOU-AAAA-XXXX
 * et place la commande au statut WAITING_TRANSFER jusqu'à validation par l'Admin.
 */
export class BankTransferPaymentProvider implements PaymentProvider {
  readonly code = 'BANK_TRANSFER' as const;
  readonly displayName = 'Virement Bancaire Manuel (RIB / IBAN)';

  isConfigured(): boolean {
    return true; // Toujours disponible grâce au RIB officiel Lougara intégré
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const bankTransferDetails = buildBankTransferInstructions(
      input.reference,
      input.amount,
      input.currency
    );

    return {
      success: true,
      provider: 'BANK_TRANSFER',
      orderReference: input.reference,
      status: 'WAITING_TRANSFER',
      providerPaymentId: `RIB-${input.reference}`,
      bankTransferDetails,
      message:
        'Votre commande est enregistrée en attente de virement. Veuillez indiquer la référence exacte dans le libellé de votre virement.',
    };
  }

  async verifyPayment(providerPaymentId: string, orderReference?: string): Promise<VerifyPaymentOutput> {
    return {
      verified: false,
      status: 'WAITING_TRANSFER',
      providerPaymentId: providerPaymentId || `RIB-${orderReference || ''}`,
      rawStatus: 'waiting_admin_validation',
    };
  }

  async handleWebhook(): Promise<WebhookResult> {
    return {
      handled: false,
      eventId: `manual_${Date.now()}`,
      eventType: 'bank_transfer.manual_only',
      message: 'Les virements bancaires manuels sont validés depuis le back-office Admin (/admin/paiements).',
    };
  }

  async refund(input: RefundInput): Promise<RefundOutput> {
    return {
      success: true,
      refundId: `REFUND-RIB-${input.orderReference}`,
      status: 'REFUNDED',
      message:
        'Commande marquée comme remboursée dans le système. Pensez à émettre le virement retour depuis votre interface bancaire Qonto.',
    };
  }
}
