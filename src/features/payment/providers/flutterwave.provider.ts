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
 * Connecteur Flutterwave (Nigéria, Cameroun, Ghana, Kenya, Afrique Centrale & Australe).
 * S'active automatiquement dès que FLUTTERWAVE_SECRET_KEY est présent dans .env.
 * Documentation officielle : https://developer.flutterwave.com/docs
 */
export class FlutterwavePaymentProvider implements PaymentProvider {
  readonly code = 'FLUTTERWAVE' as const;
  readonly displayName = 'Flutterwave (Mobile Money & Cartes Afrique)';

  isConfigured(): boolean {
    return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!secretKey) {
      return {
        success: false,
        provider: 'FLUTTERWAVE',
        orderReference: input.reference,
        status: 'PENDING',
        isTestSimulation: true,
        message:
          'Connecteur Flutterwave prêt mais non activé (FLUTTERWAVE_SECRET_KEY absente de .env). Veuillez utiliser le Virement Bancaire ou la Carte Bancaire.',
      };
    }

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: input.reference,
        amount: input.amount,
        currency: input.currency,
        redirect_url: input.returnUrl,
        customer: {
          email: input.customerEmail,
          name: input.customerName || 'Client Lougara B2B',
        },
        customizations: {
          title: 'Lougara B2B',
          description: `${input.planName} (${input.reference})`,
        },
        meta: {
          orderId: input.orderId,
          orderReference: input.reference,
          planCode: input.planCode,
        },
      }),
    });

    const data = await response.json();
    if (data.status === 'success' && data.data?.link) {
      return {
        success: true,
        provider: 'FLUTTERWAVE',
        orderReference: input.reference,
        status: 'PENDING',
        providerPaymentId: input.reference,
        redirectUrl: data.data.link,
      };
    }

    return {
      success: false,
      provider: 'FLUTTERWAVE',
      orderReference: input.reference,
      status: 'FAILED',
      message: data.message || 'Erreur lors de la création du paiement Flutterwave.',
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<VerifyPaymentOutput> {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return { verified: false, status: 'PENDING', rawStatus: 'not_configured' };
    }

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
        providerPaymentId
      )}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      }
    );

    const data = await response.json();
    if (data.status === 'success' && data.data?.status === 'successful') {
      return {
        verified: true,
        status: 'PAID',
        providerPaymentId: String(data.data.id),
        amount: Number(data.data.amount),
        currency: data.data.currency,
        paidAt: new Date(data.data.created_at || Date.now()),
        rawStatus: data.data.status,
      };
    }

    return {
      verified: false,
      status: data.data?.status === 'failed' ? 'FAILED' : 'PENDING',
      providerPaymentId,
      rawStatus: data.data?.status || 'UNKNOWN',
    };
  }

  async handleWebhook(
    rawBody: string,
    headers: Record<string, string | null>
  ): Promise<WebhookResult> {
    const expectedHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
    const signature = headers['verif-hash'];

    if (!expectedHash || signature !== expectedHash) {
      throw new Error('Signature Webhook Flutterwave (verif-hash) invalide.');
    }

    const payload = JSON.parse(rawBody);
    const txRef = payload.data?.tx_ref || payload.txRef;
    const flwId = String(payload.data?.id || txRef);

    // Vérification serveur systématique auprès de Flutterwave
    const verified = await this.verifyPayment(txRef);

    return {
      handled: true,
      eventId: `flw_${flwId}_${verified.status}`,
      eventType: payload.event || `charge.${verified.status.toLowerCase()}`,
      orderReference: txRef,
      providerPaymentId: flwId,
      newStatus: verified.status,
      message: `Webhook Flutterwave traité (${verified.rawStatus}).`,
    };
  }

  async refund(input: RefundInput): Promise<RefundOutput> {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey || !input.providerPaymentId) {
      return {
        success: false,
        status: 'FAILED',
        message: 'Flutterwave non configuré ou ID de transaction manquant.',
      };
    }

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${input.providerPaymentId}/refund`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input.amount ? { amount: input.amount } : {}),
      }
    );

    const data = await response.json();
    if (data.status === 'success') {
      return {
        success: true,
        refundId: String(data.data?.id || `flw_ref_${Date.now()}`),
        status: 'REFUNDED',
        message: 'Remboursement Flutterwave effectué.',
      };
    }

    return {
      success: false,
      status: 'FAILED',
      message: data.message || 'Échec du remboursement Flutterwave.',
    };
  }
}
