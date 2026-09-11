import { z } from 'zod';

export const createProductSchema = z.object({
  companyId: z.string().min(1, 'L\'entreprise est requise'),
  title: z.string().min(3, 'Le titre doit comporter au moins 3 caractères'),
  slug: z.string().min(3),
  description: z.string().min(10, 'La description doit comporter au moins 10 caractères'),
  category: z.string().min(1, 'La catégorie est requise'),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  currency: z.string().default('EUR'),
  moq: z.number().int().positive('Le MOQ doit être au moins de 1').default(1),
  unit: z.string().default('pièce'),
  originCountry: z.string().min(2, 'Le pays d\'origine est requis'),
  images: z.array(z.string().url()).default([]),
});

export const searchCatalogSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  originCountry: z.string().optional(),
  onlyVerified: z.boolean().optional(),
  maxMoq: z.number().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type SearchCatalogFilters = z.infer<typeof searchCatalogSchema>;
