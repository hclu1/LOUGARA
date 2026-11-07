import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-storage';
import { fetchCompaniesViaSupabaseRest } from '@/lib/supabase-db';
import { VerificationStatus, DocumentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function extractUrlFromText(text?: string | null): string | null {
  if (!text) return null;
  const urlMatch = text.match(/https?:\/\/[^\s,;)"']+/i);
  if (urlMatch) return urlMatch[0].replace(/[.,;!?]+$/, '');
  const domainMatch = text.match(/\b([a-z0-9-]+\.(?:fr|com|net|org|io|sn|ci|africa|eu|shop|store)(?:\/[^\s,;)"']*)?)/i);
  if (domainMatch) return `https://${domainMatch[1].replace(/[.,;!?]+$/, '')}`;
  return null;
}

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

    let companies: any[] = [];
    try {
      companies = await prisma.companyProfile.findMany({
        where: whereClause,
        include: {
          documents: {
            orderBy: {
              uploadedAt: 'desc',
            },
          },
          products: {
            orderBy: { createdAt: 'asc' },
            take: 25,
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
          createdAt: 'desc',
        },
      });
    } catch {
      companies = await fetchCompaniesViaSupabaseRest({
        status: filterStatus,
        isPublished:
          filterPublished !== null && filterPublished !== undefined && filterPublished !== 'ALL'
            ? filterPublished === 'true'
            : undefined,
      });
    }

    if (companies.length === 0) {
      try {
        companies = await fetchCompaniesViaSupabaseRest({
          status: filterStatus,
          isPublished:
            filterPublished !== null && filterPublished !== undefined && filterPublished !== 'ALL'
              ? filterPublished === 'true'
              : undefined,
        });
      } catch {}
    }

    // Enrichir automatiquement le lien externe si mentionné dans la description ou le site de l'entreprise
    const enrichedCompanies = companies.map((comp) => {
      const productsList = Array.isArray(comp.products) ? comp.products : [];
      const documentsList = Array.isArray(comp.documents) ? comp.documents : [];
      const detectedCompanyUrl =
        comp.website ||
        productsList.find((p: any) => p.externalLink)?.externalLink ||
        extractUrlFromText(comp.description) ||
        productsList.map((p: any) => extractUrlFromText(p.description)).find(Boolean) ||
        null;

      return {
        ...comp,
        website: comp.website || detectedCompanyUrl,
        documents: documentsList,
        products: productsList.map((prod: any) => ({
          ...prod,
          externalLink: prod.externalLink || extractUrlFromText(prod.description) || detectedCompanyUrl,
        })),
      };
    });

    return NextResponse.json(
      { success: true, companies: enrichedCompanies },
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
      externalLink,
      isLinkApproved,
      overrideMissing = false,
    } = body;

    // 1. Action sur un document individuel (KBIS, CNI, NINEA)
    if (action === 'UPDATE_DOCUMENT' && documentId) {
      let updatedDoc: any;
      try {
        updatedDoc = await prisma.verificationDocument.update({
          where: { id: documentId },
          data: {
            status: docStatus as DocumentStatus,
            notes: docNotes ?? null,
            issuingAuthority: issuingAuthority ?? undefined,
            signatureVerified: signatureVerified ?? false,
            locationVerified: locationVerified ?? false,
          },
        });
      } catch {
        const { data } = await supabaseAdmin
          .from('VerificationDocument')
          .update({
            status: docStatus,
            notes: docNotes ?? null,
            ...(issuingAuthority !== undefined ? { issuingAuthority } : {}),
            signatureVerified: signatureVerified ?? false,
            locationVerified: locationVerified ?? false,
          })
          .eq('id', documentId)
          .select()
          .single();
        updatedDoc = data;
      }
      return NextResponse.json({ success: true, document: updatedDoc });
    }

    // 1b. Modération d'un produit (texte + images) : seule la validation Lougara le rend visible
    if (action === 'MODERATE_PRODUCT' && productId) {
      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(moderationStatus)) {
        return NextResponse.json({ success: false, error: 'moderationStatus invalide' }, { status: 400 });
      }
      if (moderationStatus === 'REJECTED' && !String(moderationNotes || '').trim()) {
        return NextResponse.json({ success: false, error: 'Un motif de rejet est requis' }, { status: 400 });
      }
      let product: any;
      try {
        product = await prisma.product.update({
          where: { id: productId },
          data: {
            moderationStatus,
            moderationNotes: moderationStatus === 'APPROVED' ? null : (moderationNotes ?? null),
            moderatedAt: moderationStatus === 'PENDING' ? null : new Date(),
            isPublished: moderationStatus === 'APPROVED',
          },
        });
      } catch {
        const { data } = await supabaseAdmin
          .from('Product')
          .update({
            moderationStatus,
            moderationNotes: moderationStatus === 'APPROVED' ? null : (moderationNotes ?? null),
            moderatedAt: moderationStatus === 'PENDING' ? null : new Date().toISOString(),
            isPublished: moderationStatus === 'APPROVED',
          })
          .eq('id', productId)
          .select()
          .single();
        product = data;
      }
      return NextResponse.json({ success: true, product });
    }

    // 1c. Activer ou désactiver une partie du catalogue (un produit spécifique via case à cocher)
    if (action === 'TOGGLE_PRODUCT_ACTIVE' && productId) {
      const willBeActive = Boolean(isPublished);
      let product: any;
      try {
        product = await prisma.product.update({
          where: { id: productId },
          data: {
            isPublished: willBeActive,
            ...(willBeActive ? { moderationStatus: 'APPROVED', moderatedAt: new Date() } : {}),
          },
        });
      } catch {
        const { data } = await supabaseAdmin
          .from('Product')
          .update({
            isPublished: willBeActive,
            ...(willBeActive ? { moderationStatus: 'APPROVED', moderatedAt: new Date().toISOString() } : {}),
          })
          .eq('id', productId)
          .select()
          .single();
        product = data;
      }
      return NextResponse.json({
        success: true,
        product,
        message: willBeActive
          ? `Produit « ${product?.title || 'Catalogue'} » activé et visible dans le catalogue.`
          : `Produit « ${product?.title || 'Catalogue'} » désactivé (masqué du catalogue).`,
      });
    }

    // 1d. Validation / activation par coche du lien de site en ligne (pour un produit ou tout le catalogue)
    if (action === 'UPDATE_ONLINE_LINK') {
      const cleanUrl = normalizeUrl(externalLink);
      const approved = Boolean(isLinkApproved);

      if (productId) {
        let updatedProduct: any;
        try {
          updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
              ...(cleanUrl !== null ? { externalLink: cleanUrl } : {}),
              isLinkApproved: approved,
            },
          });
          if (companyId && cleanUrl) {
            await prisma.companyProfile.update({
              where: { id: companyId },
              data: { website: cleanUrl },
            }).catch(() => {});
          }
        } catch {
          const { data } = await supabaseAdmin
            .from('Product')
            .update({
              ...(cleanUrl !== null ? { externalLink: cleanUrl } : {}),
              isLinkApproved: approved,
            })
            .eq('id', productId)
            .select()
            .single();
          updatedProduct = data;
          if (companyId && cleanUrl) {
            await supabaseAdmin.from('CompanyProfile').update({ website: cleanUrl }).eq('id', companyId);
          }
        }
        return NextResponse.json({
          success: true,
          product: updatedProduct,
          message: approved
            ? 'Lien du site en ligne validé et activé sur le catalogue.'
            : 'Lien du site en ligne désactivé sur le catalogue.',
        });
      }

      if (companyId) {
        try {
          if (cleanUrl !== null) {
            await prisma.companyProfile.update({
              where: { id: companyId },
              data: { website: cleanUrl },
            });
          }
          await prisma.product.updateMany({
            where: { companyId },
            data: {
              ...(cleanUrl !== null ? { externalLink: cleanUrl } : {}),
              isLinkApproved: approved,
            },
          });
        } catch {
          if (cleanUrl !== null) {
            await supabaseAdmin.from('CompanyProfile').update({ website: cleanUrl }).eq('id', companyId);
          }
          await supabaseAdmin
            .from('Product')
            .update({
              ...(cleanUrl !== null ? { externalLink: cleanUrl } : {}),
              isLinkApproved: approved,
            })
            .eq('companyId', companyId);
        }
        return NextResponse.json({
          success: true,
          message: approved
            ? 'Lien du site en ligne validé et activé pour ce catalogue.'
            : 'Lien du site en ligne désactivé pour ce catalogue.',
        });
      }

      return NextResponse.json(
        { success: false, error: 'Identifiant produit ou entreprise requis.' },
        { status: 400 }
      );
    }

    // 2. Toggle direct de l'activation du catalogue fournisseur complet
    if (action === 'TOGGLE_PUBLICATION' && companyId) {
      const willBePublished = Boolean(isPublished);
      let updatedCompany: any;
      try {
        updatedCompany = await prisma.companyProfile.update({
          where: { id: companyId },
          data: {
            isPublished: willBePublished,
          },
        });

        if (willBePublished) {
          const activeCount = await prisma.product.count({
            where: { companyId, isPublished: true },
          });
          if (activeCount === 0) {
            await prisma.product.updateMany({
              where: { companyId, moderationStatus: 'APPROVED' },
              data: { isPublished: true },
            });
          }
        }
      } catch {
        const { data } = await supabaseAdmin
          .from('CompanyProfile')
          .update({ isPublished: willBePublished })
          .eq('id', companyId)
          .select()
          .single();
        updatedCompany = data;
      }

      return NextResponse.json({
        success: true,
        company: updatedCompany,
        message: willBePublished
          ? 'Catalogue complet activé et visible en ligne.'
          : 'Catalogue complet désactivé (masqué du site public).',
      });
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
