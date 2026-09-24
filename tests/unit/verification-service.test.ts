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

  it('doit définir le statut d\'une entreprise à PENDING lors du dépôt de document KYB', async () => {
    const { submitKybDocument } = await import('../../src/features/verification/service');
    (prisma as any).verificationDocument = { create: vi.fn().mockResolvedValue({ id: 'doc-1' }) };

    await submitKybDocument({
      companyId: 'comp-123',
      documentType: 'COMMERCIAL_REGISTER',
      filePath: '/uploads/kbis.pdf',
      fileName: 'kbis.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    });

    expect(prisma.companyProfile.update).toHaveBeenCalledWith({
      where: { id: 'comp-123' },
      data: { verificationStatus: 'PENDING' },
    });
  });
});
