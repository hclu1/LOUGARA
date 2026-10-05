import Stripe from 'stripe';

/**
 * Initialise le SDK serveur Stripe uniquement si la clé secrète est présente.
 * Évite les crashs si l'application s'exécute avant la saisie des identifiants Stripe.
 */
export const getStripeServerClient = (): Stripe | null => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.trim() === '') {
    return null;
  }

  return new Stripe(secretKey, {
    apiVersion: '2024-06-20' as any,
    typescript: true,
  });
};
