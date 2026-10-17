import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/features/payment/providers';
import {
  checkAndRecordWebhookIdempotence,
  fulfillPaymentOrder,
  markPaymentOrderFailed,
  markPaymentOrderRefunded,
} from '@/features/payment/services/fulfillment.service';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    const stripeProvider = getPaymentProvider('STRIPE');
    const result = await stripeProvider.handleWebhook(rawBody, {
      'stripe-signature': signature,
    });

    // Vérification stricte d'idempotence (un même event.id ne doit jamais être traité deux fois)
    const alreadyProcessed = await checkAndRecordWebhookIdempotence({
      provider: 'STRIPE',
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
      eventId: result.eventId,
      eventType: result.eventType,
      handled: result.handled,
    });
  } catch (err: any) {
    console.error(`❌ Erreur Webhook Stripe : ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
