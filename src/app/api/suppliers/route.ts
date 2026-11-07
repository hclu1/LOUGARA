import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKybDocumentUrl, getCatalogImagePublicPrefix } from '@/lib/supabase-storage';

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
  const fileName = typeof displayName === 'string' && displayName.trim() ? displayName.trim().slice(0, 200) : storagePath.split('/').pop()!;
  const ext = fileName.toLowerCase().split('.').pop();
  const mimeType =
    ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
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
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    const suppliers = await prisma.companyProfile.findMany({
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

    return NextResponse.json(
      { success: true, suppliers },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
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

    // Recherche ou création de l'utilisateur associé
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const nameParts = (contactName || '').trim().split(' ');
      const firstName = nameParts[0] || 'Fournisseur';
      const lastName = nameParts.slice(1).join(' ') || 'Agréé';
      const fakeUid = `sup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      user = await prisma.user.create({
        data: {
          email,
          supabaseUid: fakeUid,
          firstName,
          lastName,
          role: 'SUPPLIER',
        },
      });
    }

    // Création du profil d'entreprise
    const company = await prisma.companyProfile.create({
      data: {
        userId: user.id,
        companyName,
        country: country || 'Sénégal',
        city: city || 'Dakar',
        sector: sector || 'Négoce & Commerce Général',
        registrationNumber: registrationNumber || null,
        phone: phone || null,
        verificationStatus: 'PENDING', // Placé en attente de vérification pour la modération
        isPublished: false, // Ne pas publier le site tant que le modérateur ne l'a pas validé/publié
        verifiedAt: null,
        documents: kycDocuments.length > 0 ? { create: kycDocuments } : undefined,
        // Produits crees EN ATTENTE de moderation : texte et images ne sont visibles
        // au catalogue qu'apres validation explicite par Lougara.
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

    // Enregistrement sécurisé du mot de passe fournisseur dans la file de validation Admin
    try {
      const { submitClientPasswordRequest } = await import('@/features/auth/service');
      const rawPassword =
        typeof body.password === 'string' && body.password.trim().length >= 4
          ? body.password.trim()
          : `Lougara-${String(email).split('@')[0]}-2026`;
      submitClientPasswordRequest({
        email,
        password: rawPassword,
        fullName: contactName || companyName,
        companyName,
        country: country || 'Sénégal',
        clientRole: 'supplier',
        requestType: 'CLIENT_REGISTRATION',
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
      { success: false, error: 'Impossible d\'enregistrer le fournisseur : ' + error.message },
      { status: 500 }
    );
  }
}
