import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { VerificationStatus, DocumentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await ensureSchemaSynced();
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
          orderBy: { createdAt: 'asc' },
          take: 10,
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

    return NextResponse.json(
      { success: true, companies },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
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
      productId,
      moderationStatus,
      moderationNotes,
      overrideMissing = false,
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

    // 1b. Moderation d'un produit (texte + images) : seule la validation Lougara le rend visible
    if (action === 'MODERATE_PRODUCT' && productId) {
      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(moderationStatus)) {
        return NextResponse.json({ success: false, error: 'moderationStatus invalide' }, { status: 400 });
      }
      if (moderationStatus === 'REJECTED' && !String(moderationNotes || '').trim()) {
        return NextResponse.json({ success: false, error: 'Un motif de rejet est requis' }, { status: 400 });
      }
      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          moderationStatus,
          moderationNotes: moderationStatus === 'APPROVED' ? null : (moderationNotes ?? null),
          moderatedAt: moderationStatus === 'PENDING' ? null : new Date(),
          isPublished: moderationStatus === 'APPROVED',
        },
      });
      return NextResponse.json({ success: true, product });
    }
    // 2. Toggle direct de la publication du site fournisseur et de son catalogue
    if (action === 'TOGGLE_PUBLICATION' && companyId) {
      const willBePublished = Boolean(isPublished);
      const updatedCompany = await prisma.companyProfile.update({
        where: { id: companyId },
        data: {
          isPublished: willBePublished,
        },
      });

      // Masquer tout si depublication ; sinon ne republier que les produits deja valides par Lougara
      await prisma.product.updateMany({
        where: willBePublished ? { companyId, moderationStatus: 'APPROVED' } : { companyId },
        data: {
          isPublished: willBePublished,
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

    // Publication de la fiche entreprise lorsque le dossier passe VERIFIED.
    // Tous les produits en attente sont validés et publiés au catalogue.
    // Tous les documents existants sont passés en VERIFIED.
    if (status === VerificationStatus.VERIFIED) {
      updateData.isPublished = true;
      await prisma.product.updateMany({
        where: { companyId },
        data: {
          isPublished: true,
          moderationStatus: 'APPROVED',
          moderatedAt: new Date(),
        },
      });

      await prisma.verificationDocument.updateMany({
        where: { companyId },
        data: { status: 'VERIFIED' },
      });

      // Si le modérateur valide avec dérogation sur des pièces manquantes
      if (overrideMissing) {
        const existingDocs = await prisma.verificationDocument.findMany({
          where: { companyId },
          select: { documentType: true },
        });
        const existingTypes = new Set(existingDocs.map((d) => d.documentType));

        if (!existingTypes.has('COMMERCIAL_REGISTER')) {
          await prisma.verificationDocument.create({
            data: {
              companyId,
              documentType: 'COMMERCIAL_REGISTER',
              filePath: 'dispense_kbis.pdf',
              fileName: 'Dérogation_Kbis_Accordée.pdf',
              fileSize: 0,
              mimeType: 'application/pdf',
              status: 'VERIFIED',
              notes: 'Dérogation Kbis / RCCM accordée par le modérateur.',
            },
          });
        }

        if (!existingTypes.has('IDENTITY_DOCUMENT')) {
          await prisma.verificationDocument.create({
            data: {
              companyId,
              documentType: 'IDENTITY_DOCUMENT',
              filePath: 'dispense_identite.pdf',
              fileName: 'Dérogation_Identité_Accordée.pdf',
              fileSize: 0,
              mimeType: 'application/pdf',
              status: 'VERIFIED',
              notes: 'Dérogation pièce d\'identité accordée par le modérateur.',
            },
          });
        }
      }
    } else if (status === VerificationStatus.REJECTED) {
      updateData.isPublished = false;
      await prisma.product.updateMany({
        where: { companyId },
        data: { isPublished: false },
      });
    }

    const updated = await prisma.companyProfile.update({
      where: { id: companyId },
      data: updateData,
      include: {
        documents: true,
        products: true,
      },
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
