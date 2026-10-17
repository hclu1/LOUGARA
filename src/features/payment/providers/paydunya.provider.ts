import crypto from 'crypto';
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
 * Connecteur PayDunya (UEMOA : Wave, Orange Money, Free Money, Moov Money — Sénégal, Côte d'Ivoire, Bénin, Togo, Mali, Burkina).
 * S'active automatiquement dès que PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY et PAYDUNYA_TOKEN sont dans .env.
 * Documentation officielle : https://paydunya.com/developers/
 */
export class PayDunyaPaymentProvider implements PaymentProvider {
  readonly code = 'PAYDUNYA' as const;
  readonly displayName = 'PayDunya (Wave & Orange Money UEMOA)';

  isConfigured(): boolean {
    return Boolean(
      process.env.PAYDUNYA_MASTER_KEY &&
        process.env.PAYDUNYA_PRIVATE_KEY &&
        process.env.PAYDUNYA_TOKEN
    );
  }

  private getBaseUrl(): string {
    return process.env.PAYDUNYA_MODE === 'live'
      ? 'https://app.paydunya.com/api/v1'
      : 'https://app.paydunya.com/sandbox-api/v1';
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY || '',
      'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY || '',
      'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN || '',
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: 'PAYDUNYA',
        orderReference: input.reference,
        status: 'PENDING',
        isTestSimulation: true,
        message:
          'Connecteur PayDunya (Wave / Orange Money) prêt mais non activé (clés PAYDUNYA_* absentes de .env). Veuillez utiliser le Virement Bancaire ou la Carte Bancaire.',
      };
    }

    const response = await fetch(`${this.getBaseUrl()}/checkout-invoice/create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        invoice: {
          total_amount: Math.round(input.amount),
          description: `Lougara B2B - ${input.planName} (${input.reference})`,
        },
        store: {
          name: 'Lougara B2B',
          website_url: process.env.NEXT_PUBLIC_APP_URL || 'https://lougara.com',
        },
        custom_data: {
          order_id: input.orderId,
          order_reference: input.reference,
          plan_code: input.planCode,
          customer_email: input.customerEmail,
        },
        actions: {
          cancel_url: input.cancelUrl,
          return_url: input.returnUrl,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lougara.com'}/api/webhooks/paydunya`,
        },
      }),
    });

    const data = await response.json();
    if (data.response_code === '00' && data.response_text) {
      return {
        success: true,
        provider: 'PAYDUNYA',
        orderReference: input.reference,
        status: 'PENDING',
        providerPaymentId: data.token,
        redirectUrl: data.response_text,
      };
    }

    return {
      success: false,
      provider: 'PAYDUNYA',
      orderReference: input.reference,
      status: 'FAILED',
      message: data.description || data.response_text || 'Erreur lors de la création de la facture PayDunya.',
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<VerifyPaymentOutput> {
    if (!this.isConfigured()) {
      return { verified: false, status: 'PENDING', rawStatus: 'not_configured' };
    }

    const response = await fetch(
      `${this.getBaseUrl()}/checkout-invoice/confirm/${encodeURIComponent(providerPaymentId)}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    const data = await response.json();
    if (data.response_code === '00' && data.status === 'completed') {
      return {
        verified: true,
        status: 'PAID',
        providerPaymentId,
        amount: Number(data.invoice?.total_amount || 0),
        currency: 'XOF',
        paidAt: new Date(),
        rawStatus: data.status,
      };
    }

    return {
      verified: false,
      status: data.status === 'cancelled' ? 'CANCELLED' : data.status === 'failed' ? 'FAILED' : 'PENDING',
      providerPaymentId,
      rawStatus: data.status || 'UNKNOWN',
    };
  }

  async handleWebhook(rawBody: string): Promise<WebhookResult> {
    const masterKey = process.env.PAYDUNYA_MASTER_KEY;
    if (!masterKey) {
      throw new Error('PAYDUNYA_MASTER_KEY non configurée.');
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      const dataStr = params.get('data');
      if (dataStr) payload = JSON.parse(dataStr);
    }

    const dataObj = payload.data || payload;
    const receivedHash = dataObj.hash;
    const expectedHash = crypto.createHash('sha512').update(masterKey).digest('hex');

    if (!receivedHash || receivedHash !== expectedHash) {
      throw new Error('Signature SHA-512 PayDunya (hash) invalide.');
    }

    const token = dataObj.invoice?.token || dataObj.token;
    const orderReference = dataObj.custom_data?.order_reference;
    const status =
      dataObj.status === 'completed'
        ? 'PAID'
        : dataObj.status === 'cancelled'
          ? 'CANCELLED'
          : 'FAILED';

    return {
      handled: true,
      eventId: `paydunya_${token}_${status}`,
      eventType: `paydunya.${dataObj.status}`,
      orderReference,
      providerPaymentId: token,
      newStatus: status,
      message: `Webhook PayDunya traité (${dataObj.status}).`,
    };
  }

  async refund(input: RefundInput): Promise<RefundOutput> {
    return {
      success: false,
      status: 'FAILED',
      message: `Les remboursements PayDunya (${input.orderReference}) s'effectuent via Push/Disburse depuis votre compte marchand PayDunya.`,
    };
  }
}
