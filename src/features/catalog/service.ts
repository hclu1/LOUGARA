import { prisma } from '../../lib/prisma';
import {
  CreateProductInput,
  SearchCatalogFilters,
  createProductSchema,
  searchCatalogSchema,
} from './validation';
import { VerificationStatus } from '@prisma/client';

export async function createProduct(input: CreateProductInput) {
  const data = createProductSchema.parse(input);

  return await prisma.product.create({
    data: {
      companyId: data.companyId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      category: data.category,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      currency: data.currency,
      moq: data.moq,
      unit: data.unit,
      originCountry: data.originCountry,
      images: data.images,
      isPublished: true,
    },
  });
}

export async function searchCatalog(filters: SearchCatalogFilters = {}) {
  const validated = searchCatalogSchema.parse(filters);
  const where: any = {
    isPublished: true,
    company: {
      isPublished: true,
    },
  };

  if (validated.category) {
    where.category = validated.category;
  }

  if (validated.originCountry) {
    where.originCountry = validated.originCountry;
  }

  if (validated.maxMoq !== undefined) {
    where.moq = { lte: validated.maxMoq };
  }

  if (validated.onlyVerified) {
    where.company = {
      verificationStatus: VerificationStatus.VERIFIED,
    };
  }

  if (validated.query) {
    where.OR = [
      { title: { contains: validated.query, mode: 'insensitive' } },
      { description: { contains: validated.query, mode: 'insensitive' } },
    ];
  }

  return await prisma.product.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          country: true,
          city: true,
          verificationStatus: true,
          logoUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
    include: {
      company: {
        include: {
          documents: true,
        },
      },
    },
  });
}
