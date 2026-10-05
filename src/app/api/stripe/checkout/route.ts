import { NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe';
import { getPlatformSettings } from '@/features/subscription/service';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { planCode, companyId, customerEmail } = await req.json();

    const settings = await getPlatformSettings();
    if (!settings.isStripeEnabled) {
      return NextResponse.json(
        {
          success: false,
          pendingActivation: true,
          message: 'Les abonnements payants Stripe sont actuellement en cours de configuration sur Lougara.',
        },
        { status: 400 }
      );
    }

    const stripe = getStripeServerClient();
    if (!stripe) {
      return NextResponse.json(
        {
          success: false,
          pendingActivation: true,
          message: 'La clé secrète Stripe n’est pas configurée dans l’environnement. Veuillez consulter la procédure dans les Docs.',
        },
        { status: 400 }
      );
    }

    // Récupérer le forfait ciblé
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode },
    });

    if (!plan || !plan.stripePriceId) {
      return NextResponse.json(
        {
          success: false,
          message: `Le tarif Stripe (Price ID) pour la formule ${planCode} n’est pas encore renseigné dans la base ou le tableau de bord Stripe.`,
        },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: customerEmail,
      client_reference_id: companyId,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        companyId: companyId || '',
        planCode: planCode || '',
      },
      success_url: `${appUrl}/tarifs?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${appUrl}/tarifs?canceled=true`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error('Erreur Stripe Checkout:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
