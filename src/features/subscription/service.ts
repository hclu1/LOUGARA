import { prisma } from '@/lib/prisma';

export interface PlatformSettingsDTO {
  isStripeEnabled: boolean;
  allowFreeCatalogLimit: number;
  currency: string;
  contactEmail: string;
}

export const DEFAULT_PLANS = [
  {
    code: 'STANDARD',
    name: 'Formule Standard',
    description: 'Pour démarrer vos échanges B2B contrôlés.',
    priceMonthly: 99,
    currency: 'EUR',
    maxProducts: 15,
    maxContactsPerMonth: 15,
    hasBadge: false,
    hasPriorityMatching: false,
    hasAnalytics: false,
    isPublicCatalogInverted: false,
    isPublished: true,
  },
  {
    code: 'PREMIUM',
    name: 'Formule Premium',
    description: 'Développez un flux régulier de transactions directes.',
    priceMonthly: 149,
    currency: 'EUR',
    maxProducts: 50,
    maxContactsPerMonth: -1, // Illimité
    hasBadge: true,
    hasPriorityMatching: true,
    hasAnalytics: true,
    isPublicCatalogInverted: false,
    isPublished: true,
  },
  {
    code: 'VIP',
    name: 'VIP Enterprise',
    description: 'Maximisez votre visibilité commerciale avec catalogue inclus.',
    priceMonthly: 250,
    currency: 'EUR',
    maxProducts: -1, // Illimité
    maxContactsPerMonth: -1, // Illimité
    hasBadge: true,
    hasPriorityMatching: true,
    hasAnalytics: true,
    isPublicCatalogInverted: true,
    isPublished: true,
  },
];

/**
 * Récupère ou initialise la configuration globale de la plateforme (Super Admin).
 */
export async function getPlatformSettings(): Promise<PlatformSettingsDTO> {
  try {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          id: 'default',
          isStripeEnabled: process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true',
          allowFreeCatalogLimit: 5,
          currency: 'EUR',
          contactEmail: 'contact@lougara.com',
        },
      });
    }

    return {
      isStripeEnabled: settings.isStripeEnabled,
      allowFreeCatalogLimit: settings.allowFreeCatalogLimit,
      currency: settings.currency,
      contactEmail: settings.contactEmail,
    };
  } catch (error) {
    console.warn('Erreur lecture PlatformSettings (fallback par défaut):', error);
    return {
      isStripeEnabled: false,
      allowFreeCatalogLimit: 5,
      currency: 'EUR',
      contactEmail: 'contact@lougara.com',
    };
  }
}

/**
 * Met à jour les paramètres de la plateforme (Interrupteur Stripe, Quota gratuit).
 */
export async function updatePlatformSettings(data: Partial<PlatformSettingsDTO>) {
  return await prisma.platformSettings.upsert({
    where: { id: 'default' },
    update: {
      isStripeEnabled: data.isStripeEnabled,
      allowFreeCatalogLimit: data.allowFreeCatalogLimit,
      currency: data.currency,
      contactEmail: data.contactEmail,
    },
    create: {
      id: 'default',
      isStripeEnabled: data.isStripeEnabled ?? false,
      allowFreeCatalogLimit: data.allowFreeCatalogLimit ?? 5,
      currency: data.currency ?? 'EUR',
      contactEmail: data.contactEmail ?? 'contact@lougara.com',
    },
  });
}

/**
 * Garantit la présence des forfaits en base de données.
 */
export async function ensureDefaultPlansExist() {
  try {
    for (const plan of DEFAULT_PLANS) {
      const existing = await prisma.subscriptionPlan.findUnique({
        where: { code: plan.code },
      });
      if (!existing) {
        await prisma.subscriptionPlan.create({
          data: plan,
        });
      }
    }
  } catch (err) {
    console.warn('Erreur initialisation forfaits par défaut:', err);
  }
}

/**
 * Récupère tous les forfaits disponibles.
 */
export async function getSubscriptionPlans() {
  await ensureDefaultPlansExist();
  try {
    return await prisma.subscriptionPlan.findMany({
      where: { isPublished: true },
      orderBy: { priceMonthly: 'asc' },
    });
  } catch (err) {
    return DEFAULT_PLANS.map((p, idx) => ({ id: `plan_${idx}`, ...p }));
  }
}

/**
 * Vérifie si une entreprise a atteint sa limite de publication de produits.
 */
export async function canPublishProduct(companyId: string): Promise<{ allowed: boolean; currentCount: number; maxAllowed: number; reason?: string }> {
  try {
    const settings = await getPlatformSettings();

    // Compter le nombre de produits actuels de la société
    const currentCount = await prisma.product.count({
      where: { companyId },
    });

    // Si Stripe est désactivé, on autorise jusqu'au quota gratuit défini
    if (!settings.isStripeEnabled) {
      const maxAllowed = settings.allowFreeCatalogLimit;
      return {
        allowed: currentCount < maxAllowed,
        currentCount,
        maxAllowed,
        reason: currentCount >= maxAllowed ? `Le mode de lancement gratuit limite le catalogue à ${maxAllowed} produits.` : undefined,
      };
    }

    // Si Stripe est activé, lire l'abonnement de la société
    const sub = await prisma.userSubscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });

    if (!sub || sub.status !== 'ACTIVE') {
      const maxAllowed = settings.allowFreeCatalogLimit;
      return {
        allowed: currentCount < maxAllowed,
        currentCount,
        maxAllowed,
        reason: currentCount >= maxAllowed ? `Votre forfait gratuit limite votre catalogue à ${maxAllowed} produits. Souscrivez un abonnement pour étendre votre capacité.` : undefined,
      };
    }

    const maxAllowed = sub.plan.maxProducts;
    if (maxAllowed === -1) {
      return { allowed: true, currentCount, maxAllowed: Infinity };
    }

    return {
      allowed: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      reason: currentCount >= maxAllowed ? `Votre formule ${sub.plan.name} est limitée à ${maxAllowed} produits.` : undefined,
    };
  } catch (error) {
    console.error('Erreur canPublishProduct:', error);
    return { allowed: true, currentCount: 0, maxAllowed: 5 };
  }
}
