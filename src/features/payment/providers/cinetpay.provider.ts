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
 * Connecteur CinetPay (Afrique de l'Ouest & Centrale : Orange Money, MTN MoMo, Moov Money, Wave).
 * S'active automatiquement dès que CINETPAY_API_KEY et CINETPAY_SITE_ID sont présents dans .env.
 * Documentation officielle : https://docs.cinetpay.com/
 */
export class CinetPayPaymentProvider implements PaymentProvider {
  readonly code = 'CINETPAY' as const;
  readonly displayName = 'CinetPay (Orange Money, MTN, Moov, Wave)';

  isConfigured(): boolean {
    return Boolean(process.env.CINETPAY_API_KEY && process.env.CINETPAY_SITE_ID);
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;

    if (!apiKey || !siteId) {
      return {
        success: false,
        provider: 'CINETPAY',
        orderReference: input.reference,
        status: 'PENDING',
        isTestSimulation: true,
        message:
          'Connecteur CinetPay prêt mais non activé (variables CINETPAY_API_KEY et CINETPAY_SITE_ID absentes de .env). Veuillez utiliser le Virement Bancaire ou la Carte Bancaire.',
      };
    }

    const payload = {
      apikey: apiKey,
      site_id: siteId,
      transaction_id: input.reference,
      amount: Math.round(input.amount),
      currency: input.currency,
      description: `Lougara B2B - ${input.planName} (${input.reference})`,
      return_url: input.returnUrl,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lougara.com'}/api/webhooks/cinetpay`,
      channels: 'ALL',
      customer_email: input.customerEmail,
      customer_name: input.customerName || 'Client Lougara',
      metadata: JSON.stringify({
        orderId: input.orderId,
        orderReference: input.reference,
        planCode: input.planCode,
      }),
    };

    const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.code === '201' && data.data?.payment_url) {
      return {
        success: true,
        provider: 'CINETPAY',
        orderReference: input.reference,
        status: 'PENDING',
        providerPaymentId: data.data.payment_token || input.reference,
        redirectUrl: data.data.payment_url,
      };
    }

    return {
      success: false,
      provider: 'CINETPAY',
      orderReference: input.reference,
      status: 'FAILED',
      message: data.description || data.message || 'Erreur lors de l’initialisation CinetPay.',
    };
  }

  async verifyPayment(providerPaymentId: string, orderReference?: string): Promise<VerifyPaymentOutput> {
    const apiKey = process.env.CINETPAY_API_KEY;
    const siteId = process.env.CINETPAY_SITE_ID;
    const transactionId = orderReference || providerPaymentId;

    if (!apiKey || !siteId) {
      return { verified: false, status: 'PENDING', rawStatus: 'not_configured' };
    }

    const response = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: transactionId,
      }),
    });

    const data = await response.json();
    if (data.code === '00' && data.data?.status === 'ACCEPTED') {
      return {
        verified: true,
        status: 'PAID',
        providerPaymentId: transactionId,
        amount: Number(data.data.amount),
        currency: data.data.currency,
        paidAt: new Date(),
        rawStatus: data.data.status,
      };
    }

    return {
      verified: false,
      status: data.data?.status === 'REFUSED' ? 'FAILED' : 'PENDING',
      providerPaymentId: transactionId,
      rawStatus: data.data?.status || 'UNKNOWN',
    };
  }

  async handleWebhook(
    rawBody: string,
    headers: Record<string, string | null>
  ): Promise<WebhookResult> {
    const secretKey = process.env.CINETPAY_SECRET_KEY;
    const xToken = headers['x-token'];

    let bodyData: Record<string, any> = {};
    try {
      bodyData = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      params.forEach((v, k) => {
        bodyData[k] = v;
      });
    }

    // Vérification HMAC si CINETPAY_SECRET_KEY est configurée
    if (secretKey && xToken) {
      const signedData =
        (bodyData.cpm_site_id || '') +
        (bodyData.cpm_trans_id || '') +
        (bodyData.cpm_trans_date || '') +
        (bodyData.cpm_amount || '') +
        (bodyData.cpm_currency || '') +
        (bodyData.signature || '') +
        (bodyData.payment_method || '') +
        (bodyData.cel_phone_num || '') +
        (bodyData.cpm_phone_prefixe || '') +
        (bodyData.cpm_language || '') +
        (bodyData.cpm_version || '') +
        (bodyData.cpm_payment_config || '') +
        (bodyData.cpm_page_action || '') +
        (bodyData.cpm_custom || '') +
        (bodyData.cpm_designation || '') +
        (bodyData.cpm_error_message || '');

      const expectedToken = crypto
        .createHmac('sha256', secretKey)
        .update(signedData)
        .digest('hex');

      if (expectedToken !== xToken) {
        throw new Error('Signature HMAC CinetPay (x-token) invalide.');
      }
    }

    const transactionId = bodyData.cpm_trans_id || bodyData.transaction_id;
    if (!transactionId) {
      throw new Error('Identifiant de transaction CinetPay manquant dans le webhook.');
    }

    // Double vérification serveur systématique auprès de l'API CinetPay
    const check = await this.verifyPayment(transactionId, transactionId);

    return {
      handled: true,
      eventId: `cinetpay_${transactionId}_${check.status}`,
      eventType: `cinetpay.${check.status.toLowerCase()}`,
      orderReference: transactionId,
      providerPaymentId: transactionId,
      newStatus: check.status,
      message: `Webhook CinetPay vérifié (${check.rawStatus}).`,
    };
  }

  async refund(input: RefundInput): Promise<RefundOutput> {
    return {
      success: false,
      status: 'FAILED',
      message: `Les remboursements Mobile Money CinetPay (${input.orderReference}) doivent être initiés depuis le tableau de bord marchand CinetPay Transfert.`,
    };
  }
}
