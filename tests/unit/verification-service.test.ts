import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewCompanyVerification, KybReviewInput } from '../../src/features/verification/service';
import { prisma } from '../../src/lib/prisma';

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    companyProfile: {
      update: vi.fn(),
    },
  },
}));

describe('Service de vérification KYB', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doit passer le statut à VERIFIED avec la date du jour si validé par un admin', async () => {
    const input: KybReviewInput = {
      companyId: 'comp-123',
      status: 'VERIFIED',
      adminId: 'admin-1',
      notes: 'Documents RCCM et CNI conformes',
    };

    (prisma.companyProfile.update as any).mockResolvedValue({
      id: 'comp-123',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
    });

    const result = await reviewCompanyVerification(input);
    expect(result.verificationStatus).toBe('VERIFIED');
    expect(prisma.companyProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'comp-123' },
        data: expect.objectContaining({
          verificationStatus: 'VERIFIED',
        }),
      })
    );
  });

  it('doit rejeter si les champs obligatoires sont absents', async () => {
    await expect(
      reviewCompanyVerification({
        companyId: '',
        status: 'VERIFIED',
        adminId: 'admin-1',
      })
    ).rejects.toThrow();
  });
});
