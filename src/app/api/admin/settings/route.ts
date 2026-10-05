import { NextResponse } from 'next/server';
import { getPlatformSettings, updatePlatformSettings, getSubscriptionPlans } from '@/features/subscription/service';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await getPlatformSettings();
    const plans = await getSubscriptionPlans();
    const hasStripeSecret = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim().length > 0);
    const hasStripePublic = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim().length > 0);
    const hasStripeWebhook = Boolean(process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET.trim().length > 0);

    return NextResponse.json({
      success: true,
      settings,
      plans,
      stripeKeyStatus: {
        hasStripeSecret,
        hasStripePublic,
        hasStripeWebhook,
        isFullyConfigured: hasStripeSecret && hasStripePublic && hasStripeWebhook,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { isStripeEnabled, allowFreeCatalogLimit, plans } = body;

    const updatedSettings = await updatePlatformSettings({
      isStripeEnabled: typeof isStripeEnabled === 'boolean' ? isStripeEnabled : undefined,
      allowFreeCatalogLimit: typeof allowFreeCatalogLimit === 'number' ? allowFreeCatalogLimit : undefined,
    });

    if (Array.isArray(plans)) {
      for (const p of plans) {
        if (p.id) {
          await prisma.subscriptionPlan.update({
            where: { id: p.id },
            data: {
              priceMonthly: p.priceMonthly,
              maxProducts: p.maxProducts,
              maxContactsPerMonth: p.maxContactsPerMonth,
              stripePriceId: p.stripePriceId || null,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'Paramètres enregistrés avec succès',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
