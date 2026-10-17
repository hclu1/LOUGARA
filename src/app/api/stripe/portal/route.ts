import { NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { companyId, customerEmail } = await req.json();

    const stripe = getStripeServerClient();
    if (!stripe) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Le portail client Stripe nécessite la configuration de STRIPE_SECRET_KEY dans votre fichier .env.',
        },
        { status: 400 }
      );
    }

    let stripeCustomerId: string | undefined;

    if (companyId) {
      try {
        const sub = await prisma.userSubscription.findUnique({
          where: { companyId },
        });
        if (sub?.stripeCustomerId) {
          stripeCustomerId = sub.stripeCustomerId;
        }
      } catch {}
    }

    if (!stripeCustomerId && customerEmail) {
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
      } else {
        const created = await stripe.customers.create({
          email: customerEmail,
        });
        stripeCustomerId = created.id;
      }
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Aucun profil client Stripe trouvé. Veuillez renseigner votre email client.',
        },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/paiement/historique`,
    });

    return NextResponse.json({ success: true, url: portalSession.url });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Erreur ouverture portail Stripe.' },
      { status: 500 }
    );
  }
}
