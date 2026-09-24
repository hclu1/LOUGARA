import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VerificationStatus, DocumentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get('status');
    const filterPublished = searchParams.get('isPublished');

    const whereClause: any = {};
    if (filterStatus && filterStatus !== 'ALL') {
      whereClause.verificationStatus = filterStatus as VerificationStatus;
    }
    if (filterPublished !== null && filterPublished !== undefined && filterPublished !== 'ALL') {
      whereClause.isPublished = filterPublished === 'true';
    }

    const companies = await prisma.companyProfile.findMany({
      where: whereClause,
      include: {
        documents: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
        products: {
          take: 5,
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Tri par défaut : les plus récents (Nouveaux Inscrits) en premier
      },
    });

    return NextResponse.json({ success: true, companies });
  } catch (error: any) {
    console.error('Erreur GET /api/admin/verifications :', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de récupérer la liste des vérifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      companyId,
      status,
      rejectionReason,
      isPublished,
      action = 'UPDATE_STATUS',
      documentId,
      docStatus,
      docNotes,
      issuingAuthority,
      signatureVerified,
      locationVerified,
    } = body;

    // 1. Action sur un document individuel (KBIS, CNI, NINEA)
    if (action === 'UPDATE_DOCUMENT' && documentId) {
      const updatedDoc = await prisma.verificationDocument.update({
        where: { id: documentId },
        data: {
          status: docStatus as DocumentStatus,
          notes: docNotes ?? null,
          issuingAuthority: issuingAuthority ?? undefined,
          signatureVerified: signatureVerified ?? false,
          locationVerified: locationVerified ?? false,
        },
      });
      return NextResponse.json({ success: true, document: updatedDoc });
    }

    // 2. Toggle direct de la publication du site fournisseur
    if (action === 'TOGGLE_PUBLICATION' && companyId) {
      const updatedCompany = await prisma.companyProfile.update({
        where: { id: companyId },
        data: {
          isPublished: Boolean(isPublished),
        },
      });
      return NextResponse.json({ success: true, company: updatedCompany });
    }

    // 3. Mise à jour globale du statut de vérification (VERIFIED / REJECTED / PENDING)
    if (!companyId || !status) {
      return NextResponse.json(
        { success: false, error: 'companyId et status sont requis' },
        { status: 400 }
      );
    }

    const updateData: any = {
      verificationStatus: status as VerificationStatus,
      verificationNotes: rejectionReason ?? null,
      verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
    };

    // Auto-publication lorsque le dossier passe VERIFIED
    if (status === VerificationStatus.VERIFIED) {
      updateData.isPublished = true;
    } else if (status === VerificationStatus.REJECTED) {
      updateData.isPublished = false;
    }

    const updated = await prisma.companyProfile.update({
      where: { id: companyId },
      data: updateData,
    });

    return NextResponse.json({ success: true, company: updated });
  } catch (error: any) {
    console.error('Erreur PATCH /api/admin/verifications :', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du statut : ' + error.message },
      { status: 500 }
    );
  }
}
