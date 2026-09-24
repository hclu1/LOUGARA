import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchCatalog } from '../../src/features/catalog/service';
import { prisma } from '../../src/lib/prisma';

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
  },
}));

describe('Recherche dans le catalogue B2B', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doit appliquer le filtre sur le statut vérifié et le pays', async () => {
    (prisma.product.findMany as any).mockResolvedValue([
      { id: 'prod-1', title: 'Beurre de Karité Bio', originCountry: 'Sénégal' },
    ]);

    const results = await searchCatalog({
      category: 'Cosmétique',
      originCountry: 'Sénégal',
      onlyVerified: true,
    });

    expect(results).toHaveLength(1);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'Cosmétique',
          originCountry: 'Sénégal',
          company: {
            verificationStatus: 'VERIFIED',
          },
        }),
      })
    );
  });

  it('doit filtrer par recherche textuelle (query)', async () => {
    (prisma.product.findMany as any).mockResolvedValue([]);

    await searchCatalog({
      query: 'Coton',
    });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'Coton', mode: 'insensitive' } },
            { description: { contains: 'Coton', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });
});
