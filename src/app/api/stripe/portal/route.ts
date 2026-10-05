import { NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe';
import { getPlatformSettings } from '@/features/subscription/service';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json();

    const settings = await getPlatformSettings();
    if (!settings.isStripeEnabled) {
      return NextResponse.json(
        { success: false, message: 'Le portail de facturation n’est pas actif.' },
        { status: 400 }
      );
    }

    const stripe = getStripeServerClient();
    if (!stripe) {
      return NextResponse.json(
        { success: false, message: 'Identifiants Stripe non configurés.' },
        { status: 400 }
      );
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { companyId },
    });

    if (!subscription || !subscription.stripeCustomerId) {
      return NextResponse.json(
        { success: false, message: 'Aucun identifiant client Stripe n’a été trouvé pour votre entreprise.' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/devenir-fournisseur`,
    });

    return NextResponse.json({ success: true, url: portalSession.url });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
