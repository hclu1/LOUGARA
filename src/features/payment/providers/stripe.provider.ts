import Stripe from 'stripe';
import { getStripeServerClient } from '@/lib/stripe';
import { SUPPORTED_CURRENCIES } from '@/locales/currencies';
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
 * Devises "zéro décimale" selon la documentation officielle Stripe.
 * Pour ces devises, 19000 XOF s'envoie tel quel (19000) et non multiplié par 100.
 */
const STRIPE_ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF',
  'CLP',
  'DJF',
  'GNF',
  'JPY',
  'KMF',
  'KRW',
  'MGA',
  'PYG',
  'RWF',
  'UGX',
  'VND',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
]);

export function toStripeSmallestUnit(amount: number, currency: string): number {
  const upper = currency.toUpperCase();
  if (STRIPE_ZERO_DECIMAL_CURRENCIES.has(upper)) {
    return Math.round(amount);
  }
  const conf = SUPPORTED_CURRENCIES[upper as keyof typeof SUPPORTED_CURRENCIES];
  const decimals = conf ? conf.decimals : 2;
  if (decimals === 0) {
    // Attention : certaines devises affichées sans décimales dans l'UI (ex: MAD, NGN)
    // sont malgré tout à 2 décimales côté API Stripe (centimes / kobo).
    return Math.round(amount * 100);
  }
  return Math.round(amount * Math.pow(10, decimals));
}

export function fromStripeSmallestUnit(amountInSmallestUnit: number, currency: string): number {
  const upper = currency.toUpperCase();
  if (STRIPE_ZERO_DECIMAL_CURRENCIES.has(upper)) {
    return amountInSmallestUnit;
  }
  return amountInSmallestUnit / 100;
}

export class StripePaymentProvider implements PaymentProvider {
  readonly code = 'STRIPE' as const;
  readonly displayName = 'Stripe (Carte, Apple Pay, Google Pay, Link, SEPA)';

  isConfigured(): boolean {
    return Boolean(
      process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_SECRET_KEY.trim() !== '' &&
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim() !== ''
    );
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const stripe = getStripeServerClient();

    if (!stripe) {
      return {
        success: false,
        provider: 'STRIPE',
        orderReference: input.reference,
        status: 'PENDING',
        isTestSimulation: true,
        message:
          'Les clés API Stripe (STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) ne sont pas encore renseignées dans .env. Vous pouvez tester immédiatement le Virement Bancaire (RIB) ou renseigner vos clés de test Stripe (pk_test_... / sk_test_...).',
      };
    }

    const stripeAmount = toStripeSmallestUnit(input.amount, input.currency);
    const stripeCurrency = input.currency.toLowerCase();

    const metadata: Record<string, string> = {
      orderId: input.orderId,
      orderReference: input.reference,
      planCode: input.planCode,
      planName: input.planName,
      billingCycle: input.billingCycle,
      customerEmail: input.customerEmail,
      companyId: input.companyId || '',
      countryCode: input.countryCode,
      ...(input.metadata || {}),
    };

    // Rechercher ou créer le client Stripe pour permettre le Portail Client (Customer Portal)
    // et la sauvegarde du moyen de paiement pour les abonnements mensuels / annuels.
    let customerId: string | undefined;
    try {
      const existingCustomers = await stripe.customers.list({
        email: input.customerEmail,
        limit: 1,
      });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const createdCustomer = await stripe.customers.create({
          email: input.customerEmail,
          name: input.companyName || input.customerName || input.customerEmail,
          metadata: {
            companyId: input.companyId || '',
            countryCode: input.countryCode,
          },
        });
        customerId = createdCustomer.id;
      }
    } catch (custErr) {
      console.warn('Info création client Stripe:', custErr);
    }

    // Création d'un PaymentIntent compatible avec le Stripe Payment Element intégré
    // et activant automatiquement Cartes, Apple Pay, Google Pay, Link et Prélèvement SEPA
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: stripeAmount,
      currency: stripeCurrency,
      customer: customerId,
      description: `Lougara B2B — ${input.planName} (${input.reference})`,
      receipt_email: input.customerEmail,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    };

    // Si c'est un abonnement récurrent (mensuel ou annuel), on enregistre le moyen de paiement pour les échéances suivantes
    if (input.billingCycle === 'MONTHLY' || input.billingCycle === 'ANNUAL') {
      paymentIntentParams.setup_future_usage = 'off_session';
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams, {
      idempotencyKey: `pi_create_${input.reference}`,
    });

    return {
      success: true,
      provider: 'STRIPE',
      orderReference: input.reference,
      status: 'PENDING',
      providerPaymentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<VerifyPaymentOutput> {
    const stripe = getStripeServerClient();
    if (!stripe) {
      return {
        verified: false,
        status: 'PENDING',
        rawStatus: 'stripe_not_configured',
      };
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(providerPaymentId);

    if (paymentIntent.status === 'succeeded') {
      return {
        verified: true,
        status: 'PAID',
        providerPaymentId: paymentIntent.id,
        amount: fromStripeSmallestUnit(paymentIntent.amount_received || paymentIntent.amount, paymentIntent.currency),
        currency: paymentIntent.currency.toUpperCase(),
        paidAt: new Date(paymentIntent.created * 1000),
        rawStatus: paymentIntent.status,
      };
    }

    if (paymentIntent.status === 'canceled') {
      return {
        verified: false,
        status: 'CANCELLED',
        providerPaymentId: paymentIntent.id,
        rawStatus: paymentIntent.status,
      };
    }

    if (paymentIntent.status === 'requires_payment_method' && paymentIntent.last_payment_error) {
      return {
        verified: false,
        status: 'FAILED',
        providerPaymentId: paymentIntent.id,
        rawStatus: paymentIntent.status,
      };
    }

    return {
      verified: false,
      status: 'PENDING',
      providerPaymentId: paymentIntent.id,
      rawStatus: paymentIntent.status,
    };
  }

  async handleWebhook(
    rawBody: string,
    headers: Record<string, string | null>
  ): Promise<WebhookResult> {
    const stripe = getStripeServerClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !webhookSecret) {
      throw new Error('Stripe ou STRIPE_WEBHOOK_SECRET non configuré côté serveur.');
    }

    const signature = headers['stripe-signature'];
    if (!signature) {
      throw new Error('En-tête stripe-signature manquant.');
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        return {
          handled: true,
          eventId: event.id,
          eventType: event.type,
          orderReference: pi.metadata?.orderReference,
          providerPaymentId: pi.id,
          newStatus: 'PAID',
          message: `PaymentIntent ${pi.id} payé avec succès.`,
        };
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        return {
          handled: true,
          eventId: event.id,
          eventType: event.type,
          orderReference: pi.metadata?.orderReference,
          providerPaymentId: pi.id,
          newStatus: 'FAILED',
          message: pi.last_payment_error?.message || `Échec du PaymentIntent ${pi.id}.`,
        };
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          handled: true,
          eventId: event.id,
          eventType: event.type,
          orderReference: session.metadata?.orderReference || session.client_reference_id || undefined,
          providerPaymentId: (session.payment_intent as string) || session.id,
          newStatus: 'PAID',
          message: `Session Checkout ${session.id} complétée.`,
        };
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        return {
          handled: true,
          eventId: event.id,
          eventType: event.type,
          orderReference: charge.metadata?.orderReference,
          providerPaymentId: (charge.payment_intent as string) || charge.id,
          newStatus: 'REFUNDED',
          message: `Remboursement confirmé (${charge.id}).`,
        };
      }

      default:
        return {
          handled: false,
          eventId: event.id,
          eventType: event.type,
          message: `Événement Stripe ignoré: ${event.type}`,
        };
    }
  }

  async refund(input: RefundInput): Promise<RefundOutput> {
    const stripe = getStripeServerClient();
    if (!stripe) {
      return {
        success: false,
        status: 'FAILED',
        message: 'Stripe non configuré pour effectuer le remboursement.',
      };
    }

    if (!input.providerPaymentId) {
      return {
        success: false,
        status: 'FAILED',
        message: 'Identifiant de transaction Stripe (PaymentIntent ID) manquant.',
      };
    }

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: input.providerPaymentId,
        metadata: {
          orderReference: input.orderReference,
          reason: input.reason || 'requested_by_customer',
        },
      };

      if (input.amount && input.currency) {
        refundParams.amount = toStripeSmallestUnit(input.amount, input.currency);
      }

      const refund = await stripe.refunds.create(refundParams, {
        idempotencyKey: `refund_${input.orderReference}`,
      });

      return {
        success: true,
        refundId: refund.id,
        status: 'REFUNDED',
        message: `Remboursement Stripe ${refund.id} effectué avec succès.`,
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'FAILED',
        message: error.message || 'Erreur lors du remboursement Stripe.',
      };
    }
  }
}
