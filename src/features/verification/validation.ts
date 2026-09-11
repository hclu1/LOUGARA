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

export type KybDocumentSubmissionInput = z.infer<typeof kybDocumentSubmissionSchema>;
export type KybReviewInput = z.infer<typeof kybReviewSchema>;
