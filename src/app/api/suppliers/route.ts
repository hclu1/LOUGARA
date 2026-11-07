import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { getKybDocumentUrl, getCatalogImagePublicPrefix } from '@/lib/supabase-storage';
import { fetchCompaniesViaSupabaseRest } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Valide un chemin de stockage renvoye par /api/suppliers/kyb-documents (pas de chemin arbitraire). */
function safeStoragePath(p: any): string | null {
  return typeof p === 'string' && /^uploads\/[A-Za-z0-9._-]+$/.test(p) ? p : null;
}

function buildKycDocument(
  documentType: 'COMMERCIAL_REGISTER' | 'IDENTITY_DOCUMENT',
  displayName: any,
  storagePath: string | null
) {
  if (!storagePath) return null;
  const fileName =
    typeof displayName === 'string' && displayName.trim()
      ? displayName.trim().slice(0, 200)
      : storagePath.split('/').pop()!;
  const ext = fileName.toLowerCase().split('.').pop();
  const mimeType =
    ext === 'pdf'
      ? 'application/pdf'
      : ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : 'image/jpeg';
  return {
    documentType,
    filePath: getKybDocumentUrl(storagePath, fileName),
    fileName,
    fileSize: 0,
    mimeType,
  };
}

const MAX_PRODUCTS = 10;
const MAX_IMAGES_PER_PRODUCT = 4;

/** Normalise un lien externe renseigné sous le nom de l'article. */
function normalizeExternalLink(raw: any): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().slice(0, 500);
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Nettoie et valide les produits soumis : aucune donnee fictive n'est injectee. */
function sanitizeProducts(raw: any[], sector?: string) {
  const prefix = getCatalogImagePublicPrefix();
  const toNum = (v: any) => {
    const n = Number(v);
    return v !== '' && v !== null && v !== undefined && Number.isFinite(n) && n >= 0 ? n : null;
  };
  return (Array.isArray(raw) ? raw : [])
    .slice(0, MAX_PRODUCTS)
    .map((prod: any) => ({
      title: String(prod?.title ?? '').trim().slice(0, 150),
      externalLink: normalizeExternalLink(prod?.externalLink),
      description: String(prod?.description ?? '').trim().slice(0, 2000),
      category: String(prod?.category || sector || 'Général').slice(0, 100),
      priceMin: toNum(prod?.priceMin),
      priceMax: toNum(prod?.priceMax),
      currency: String(prod?.currency || 'EUR').slice(0, 5),
      moq: Math.max(1, Math.floor(toNum(prod?.moq) ?? 1)),
      unit: String(prod?.unit || 'unité').slice(0, 30),
      // Seules les images televersees via Lougara sont acceptees (pas d'URL externe)
      images: (Array.isArray(prod?.images) ? prod.images : [])
        .filter((u: any) => typeof u === 'string' && u.startsWith(prefix))
        .slice(0, MAX_IMAGES_PER_PRODUCT) as string[],
    }))
    .filter((prod) => prod.title.length > 0 && prod.description.length > 0);
}

export async function GET(req: NextRequest) {
  try {
    await ensureSchemaSynced();
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    let suppliers: any[] = [];
    try {
      suppliers = await prisma.companyProfile.findMany({
        where: includeUnpublished ? {} : { isPublished: true, verificationStatus: 'VERIFIED' },
        include: {
          products: {
            where: { isPublished: true, moderationStatus: 'APPROVED' },
            take: 10,
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      });
    } catch {
      const all = await fetchCompaniesViaSupabaseRest(
        includeUnpublished ? {} : { status: 'VERIFIED', isPublished: true }
      );
      suppliers = all.map((c: any) => ({
        ...c,
        products: (c.products || []).filter(
          (p: any) => p.isPublished === true && p.moderationStatus === 'APPROVED'
        ),
      }));
    }

    if (suppliers.length === 0) {
      try {
        const all = await fetchCompaniesViaSupabaseRest(
          includeUnpublished ? {} : { status: 'VERIFIED', isPublished: true }
        );
        suppliers = all.map((c: any) => ({
          ...c,
          products: (c.products || []).filter(
            (p: any) => p.isPublished === true && p.moderationStatus === 'APPROVED'
          ),
        }));
      } catch {}
    }

    return NextResponse.json(
      { success: true, suppliers },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Erreur API /api/suppliers GET :', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de récupérer les fournisseurs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      country,
      city,
      sector,
      registrationNumber,
      contactName,
      email,
      phone,
      subscriptionPlan = 'PREMIUM',
      hasCatalogAdSpace = true,
      products = [],
      kbisFile,
      kbisStoragePath,
      cniFile,
      cniStoragePath,
    } = body;

    const cleanProducts = sanitizeProducts(products, sector);
    const kycDocuments = [
      buildKycDocument('COMMERCIAL_REGISTER', kbisFile, safeStoragePath(kbisStoragePath)),
      buildKycDocument('IDENTITY_DOCUMENT', cniFile, safeStoragePath(cniStoragePath)),
    ].filter((d): d is NonNullable<typeof d> => d !== null);

    if (!companyName || !email) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants (Nom entreprise ou e-mail).' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const { hashPassword, submitClientPasswordRequest } = await import('@/features/auth/service');
    const hasCustomPassword = typeof body.password === 'string' && body.password.trim().length >= 6;
    const rawPassword = hasCustomPassword
      ? body.password.trim()
      : `Lougara-${cleanEmail.split('@')[0]}-2026`;
    const encodedPasswordHash = hasCustomPassword ? `scrypt:${hashPassword(rawPassword)}` : null;

    // Recherche ou création de l'utilisateur associé
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const nameParts = (contactName || '').trim().split(' ');
      const firstName = nameParts[0] || 'Fournisseur';
      const lastName = nameParts.slice(1).join(' ') || 'Agréé';
      const fakeUid = `sup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          supabaseUid: fakeUid,
          firstName,
          lastName,
          role: 'SUPPLIER',
          ...(encodedPasswordHash ? { avatarUrl: encodedPasswordHash, mustChangePassword: false } : {}),
        },
      });
    } else if (encodedPasswordHash) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: encodedPasswordHash,
          mustChangePassword: false,
        },
      });
    }

    const firstExternalLink = cleanProducts.find((p) => p.externalLink)?.externalLink || null;

    // Création du profil d'entreprise
    const company = await prisma.companyProfile.create({
      data: {
        userId: user.id,
        companyName,
        country: country || 'Sénégal',
        city: city || 'Dakar',
        sector: sector || 'Négoce & Commerce Général',
        registrationNumber: registrationNumber || null,
        website: firstExternalLink,
        phone: phone || null,
        verificationStatus: 'PENDING',
        isPublished: false,
        verifiedAt: null,
        documents: kycDocuments.length > 0 ? { create: kycDocuments } : undefined,
        products: {
          create: cleanProducts.map((prod, idx) => ({
            title: prod.title,
            slug: `${prod.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'produit'}-${Date.now()}-${idx}`,
            description: prod.description,
            category: prod.category,
            priceMin: prod.priceMin,
            priceMax: prod.priceMax,
            currency: prod.currency,
            moq: prod.moq,
            unit: prod.unit,
            originCountry: country || 'Sénégal',
            images: prod.images,
            externalLink: prod.externalLink,
            isLinkApproved: false,
            isPublished: false,
            moderationStatus: 'PENDING' as const,
          })),
        },
      },
      include: {
        products: true,
        documents: true,
      },
    });

    // Enregistrement sécurisé du mot de passe fournisseur et envoi du message de création (Étape 4/5)
    try {
      submitClientPasswordRequest({
        email: cleanEmail,
        password: rawPassword,
        fullName: contactName || companyName,
        companyName,
        country: country || 'Sénégal',
        clientRole: 'supplier',
        requestType: 'CLIENT_REGISTRATION',
        activateImmediately: true,
      });

      const { sendPasswordCreationEmail } = await import('@/features/payment/services/email.service');
      await sendPasswordCreationEmail({
        to: cleanEmail,
        contactName: contactName || companyName,
        companyName,
      });
    } catch {
      // Non bloquant
    }

    return NextResponse.json({
      success: true,
      supplier: company,
      message: 'Fournisseur et catalogue enregistrés avec succès.',
    });
  } catch (error: any) {
    console.error('Erreur API /api/suppliers POST :', error);
    return NextResponse.json(
      { success: false, error: "Impossible d'enregistrer le fournisseur : " + error.message },
      { status: 500 }
    );
  }
}
