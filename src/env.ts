import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_ENABLED: z.string().optional().default('false'),
  NEXT_PUBLIC_APP_URL: z.string().optional().default('https://lougara.com'),

  // Virement Bancaire (RIB Lougara / Qonto)
  BANK_TRANSFER_HOLDER: z.string().optional().default('Lougara (EI - CHAMPAGNE Christelle / Mimonga)'),
  BANK_TRANSFER_IBAN: z.string().optional().default('FR76 1695 8000 0112 9657 5872 333'),
  BANK_TRANSFER_BIC: z.string().optional().default('QNTOFRP1XXX'),
  BANK_TRANSFER_PARTNER_SWIFT: z.string().optional().default('TRWIBEB3XXX'),
  BANK_TRANSFER_BANK_NAME: z.string().optional().default('Qonto SA, 18 rue de Navarin, 75009 Paris, France'),

  // Mentions légales Facturation PDF
  LEGAL_COMPANY_NAME: z.string().optional().default('Lougara'),
  LEGAL_HOLDER_NAME: z.string().optional().default('EI - CHAMPAGNE Christelle / Mimonga'),
  LEGAL_ADDRESS: z.string().optional().default('30 BIS RUE du Vieil Abreuvoir, 78100 Saint-Germain-en-Laye, France'),
  LEGAL_SIRET: z.string().optional().default('En cours d\'immatriculation / Renseigné sur facture'),
  LEGAL_VAT_NOTICE: z.string().optional().default('TVA non applicable, art. 293 B du CGI'),

  // Mobile Money & Paiements Africains (Activation par configuration)
  CINETPAY_API_KEY: z.string().optional(),
  CINETPAY_SITE_ID: z.string().optional(),
  CINETPAY_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_PUBLIC_KEY: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_WEBHOOK_HASH: z.string().optional(),
  PAYDUNYA_MASTER_KEY: z.string().optional(),
  PAYDUNYA_PRIVATE_KEY: z.string().optional(),
  PAYDUNYA_TOKEN: z.string().optional(),

  // Emails transactionnels (Resend / Brevo)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional().default('Lougara Facturation <facturation@lougara.com>'),
});

export function validateEnv(rawEnv: Record<string, string | undefined>) {
  return envSchema.parse(rawEnv);
}

// Ne valide le runtime process.env que si ce n'est pas un environnement de test isolé
export const env =
  process.env.NODE_ENV === 'test' && !process.env.DATABASE_URL
    ? ({} as z.infer<typeof envSchema>)
    : validateEnv(process.env);

