import { z } from 'zod';

export const entrepreneurRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis'),
  companyName: z.string().min(2, 'Le nom de l\'entreprise ou projet est requis'),
  email: z.string().email('Adresse e-mail invalide'),
  phone: z.string().min(6, 'Numéro de téléphone requis'),
  country: z.string().min(2, 'Pays requis'),
  city: z.string().min(2, 'Ville requise'),
  buyerType: z.enum([
    'E-commerce & Vente en ligne',
    'Boutique physique & Concept store',
    'Grossiste & Demi-grossiste',
    'Importateur & Distributeur',
    'Restaurateur / Hôtellerie',
    'Transformateur & Laboratoire',
    'Porteur de projet en création',
  ]),
  targetSectors: z.array(z.string()).min(1, 'Sélectionnez au moins un secteur'),
  estimatedBudget: z.enum([
    '< 1 000 € / mois',
    '1 000 € à 5 000 € / mois',
    '5 000 € à 20 000 € / mois',
    '> 20 000 € / mois',
  ]),
  sourcingNeeds: z.string().optional(),
  registrationNumber: z.string().optional(),
  kbisFile: z.string().optional(),
  kbisFileSize: z.string().optional(),
  subscriptionPlan: z.enum(['STANDARD', 'PREMIUM', 'VIP']).default('STANDARD'),
  hasCatalogAdSpace: z.boolean().default(false),
});

export type EntrepreneurRegistrationInput = z.infer<typeof entrepreneurRegistrationSchema>;

export const contactSupplierSchema = z.object({
  entrepreneurName: z.string().min(2),
  entrepreneurEmail: z.string().email(),
  entrepreneurPhone: z.string().min(6),
  supplierId: z.string().min(1),
  supplierName: z.string().min(1),
  productId: z.string().optional(),
  productTitle: z.string().optional(),
  quantity: z.string().min(1, 'Veuillez préciser la quantité souhaitée'),
  targetDestination: z.string().min(2, 'Destination de livraison requise'),
  message: z.string().min(10, 'Message de mise en relation d\'au moins 10 caractères'),
});

export type ContactSupplierInput = z.infer<typeof contactSupplierSchema>;

export const sourcingRequestSchema = z.object({
  entrepreneurName: z.string().min(2),
  entrepreneurEmail: z.string().email(),
  companyName: z.string().min(2),
  sector: z.string().min(2),
  title: z.string().min(5, 'Titre du besoin requis'),
  description: z.string().min(15, 'Description détaillée requise'),
  targetQuantity: z.string().min(1, 'Quantité cible requise'),
  targetBudget: z.string().optional(),
  destinationCountry: z.string().min(2),
});

export type SourcingRequestInput = z.infer<typeof sourcingRequestSchema>;
