import { z } from 'zod';

export const documentTypeSchema = z.enum([
  'COMMERCIAL_REGISTER',
  'TAX_ID_CERTIFICATE',
  'IDENTITY_DOCUMENT',
  'UTILITY_BILL',
]);

export const kybDocumentSubmissionSchema = z.object({
  companyId: z.string().min(1, 'L\'identifiant de l\'entreprise est requis'),
  documentType: documentTypeSchema,
  filePath: z.string().min(1, 'Le chemin du fichier est requis'),
  fileName: z.string().min(1, 'Le nom du fichier est requis'),
  fileSize: z.number().positive('La taille du fichier doit être positive'),
  mimeType: z.string().min(1, 'Le type MIME est requis'),
});

export const kybReviewSchema = z.object({
  companyId: z.string().min(1, 'L\'identifiant de l\'entreprise est requis'),
  status: z.enum(['VERIFIED', 'REJECTED']),
  adminId: z.string().min(1, 'L\'identifiant administrateur est requis'),
  notes: z.string().optional(),
});

export const supplierOnboardingSchema = z.object({
  companyName: z.string().min(2),
  country: z.string().min(2),
  city: z.string().min(2),
  sector: z.string().min(2),
  activitySummary: z.string().optional(),
  regNumber: z.string().min(2),
  kbisFile: z.string().optional(),
  productTitle: z.string().min(2),
  productDescription: z.string().optional(),
  productMoq: z.number().positive(),
  productUnit: z.string().default('kg'),
  productPrice: z.string().min(1),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  subscriptionPlan: z.enum(['STANDARD', 'PREMIUM', 'VIP']).default('STANDARD'),
  hasCatalogAdSpace: z.boolean().default(false),
});

export type SupplierOnboardingInput = z.infer<typeof supplierOnboardingSchema>;
export type KybDocumentSubmissionInput = z.infer<typeof kybDocumentSubmissionSchema>;
export type KybReviewInput = z.infer<typeof kybReviewSchema>;
