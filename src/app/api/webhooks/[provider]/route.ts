import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/features/payment/providers';
import {
  checkAndRecordWebhookIdempotence,
  fulfillPaymentOrder,
  markPaymentOrderFailed,
  markPaymentOrderRefunded,
} from '@/features/payment/services/fulfillment.service';
import { PaymentProviderCode } from '@/features/payment/types';

export async function POST(
  req: Request,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await context.params;
    const providerCode = provider.toUpperCase() as PaymentProviderCode;

    if (!['CINETPAY', 'FLUTTERWAVE', 'PAYDUNYA', 'STRIPE'].includes(providerCode)) {
      return NextResponse.json(
        { error: `Prestataire webhook non supporté : ${provider}` },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const headersObj: Record<string, string | null> = {
      'stripe-signature': req.headers.get('stripe-signature'),
      'x-token': req.headers.get('x-token'),
      'verif-hash': req.headers.get('verif-hash'),
    };

    const paymentProvider = getPaymentProvider(providerCode);
    const result = await paymentProvider.handleWebhook(rawBody, headersObj);

    const alreadyProcessed = await checkAndRecordWebhookIdempotence({
      provider: providerCode,
      eventId: result.eventId,
      eventType: result.eventType,
      payload: rawBody,
    });

    if (alreadyProcessed) {
      return NextResponse.json({
        received: true,
        idempotentDuplicate: true,
        eventId: result.eventId,
      });
    }

    const identifier = result.orderReference || result.providerPaymentId;
    if (result.handled && identifier) {
      if (result.newStatus === 'PAID') {
        await fulfillPaymentOrder({
          orderIdentifier: identifier,
          providerPaymentId: result.providerPaymentId,
        });
      } else if (result.newStatus === 'FAILED') {
        await markPaymentOrderFailed(identifier, result.message);
      } else if (result.newStatus === 'REFUNDED') {
        await markPaymentOrderRefunded(identifier);
      }
    }

    return NextResponse.json({
      received: true,
      provider: providerCode,
      eventId: result.eventId,
      newStatus: result.newStatus,
    });
  } catch (err: any) {
    console.error('Erreur Webhook Prestataire:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur traitement webhook' },
      { status: 400 }
    );
  }
}
