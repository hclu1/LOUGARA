import { NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripe = getStripeServerClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook non configuré' }, { status: 400 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature Stripe manquante' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Signature Webhook invalide: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId = session.metadata?.companyId || session.client_reference_id;
        const planCode = session.metadata?.planCode;

        if (companyId && planCode) {
          const plan = await prisma.subscriptionPlan.findUnique({
            where: { code: planCode },
          });

          if (plan) {
            await prisma.userSubscription.upsert({
              where: { companyId },
              update: {
                planId: plan.id,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                status: 'ACTIVE',
              },
              create: {
                companyId,
                planId: plan.id,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                status: 'ACTIVE',
              },
            });
            console.log(`✅ Abonnement activé pour la société ${companyId} (${planCode})`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.userSubscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'CANCELED' },
        });
        console.log(`🔴 Abonnement résilié pour ${subscription.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          await prisma.userSubscription.updateMany({
            where: { stripeSubscriptionId: String(invoice.subscription) },
            data: { status: 'PAST_DUE' },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Erreur traitement webhook Stripe (${event.type}):`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
