import { prisma } from '../../lib/prisma';
import {
  kybReviewSchema,
  KybReviewInput,
  kybDocumentSubmissionSchema,
  KybDocumentSubmissionInput,
} from './validation';
import { VerificationStatus } from '@prisma/client';

export async function submitKybDocument(input: KybDocumentSubmissionInput) {
  const validated = kybDocumentSubmissionSchema.parse(input);

  const document = await prisma.verificationDocument.create({
    data: {
      companyId: validated.companyId,
      documentType: validated.documentType,
      filePath: validated.filePath,
      fileName: validated.fileName,
      fileSize: validated.fileSize,
      mimeType: validated.mimeType,
    },
  });

  // Mettre à jour le statut de l'entreprise à PENDING (en cours de revue)
  await prisma.companyProfile.update({
    where: { id: validated.companyId },
    data: { verificationStatus: VerificationStatus.PENDING },
  });

  return document;
}

export async function reviewCompanyVerification(input: KybReviewInput) {
  const validated = kybReviewSchema.parse(input);

  const status =
    validated.status === 'VERIFIED'
      ? VerificationStatus.VERIFIED
      : VerificationStatus.REJECTED;

  return await prisma.companyProfile.update({
    where: { id: validated.companyId },
    data: {
      verificationStatus: status,
      verificationNotes: validated.notes ?? null,
      verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
    },
  });
}

export async function getPendingVerifications() {
  return await prisma.companyProfile.findMany({
    where: { verificationStatus: VerificationStatus.PENDING },
    include: {
      documents: true,
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { updatedAt: 'asc' },
  });
}
