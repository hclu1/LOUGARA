import { z } from 'zod';

export const quoteRequestSchema = z.object({
  buyerId: z.string().min(1, 'L\'identifiant acheteur est requis'),
  supplierId: z.string().min(1, 'L\'identifiant de l\'entreprise fournisseur est requis'),
  productId: z.string().optional(),
  quantity: z.number().int().positive('La quantité doit être un entier positif'),
  messageContent: z.string().min(5, 'Le message doit comporter au moins 5 caractères'),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'L\'identifiant de la conversation est requis'),
  senderId: z.string().min(1, 'L\'identifiant de l\'expéditeur est requis'),
  content: z.string().min(1, 'Le message ne peut pas être vide'),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
