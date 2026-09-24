import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKybDocumentUrl } from '@/lib/supabase-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    const suppliers = await prisma.companyProfile.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      include: {
        products: true,
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
    });

    return NextResponse.json({ success: true, suppliers });
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
    } = body;

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
        documents: kbisFile
          ? {
              create: [
                {
                  documentType: 'COMMERCIAL_REGISTER',
                  filePath: getKybDocumentUrl(
                    typeof kbisFile === 'string' ? kbisFile : 'Extrait_Immatriculation.pdf',
                    typeof kbisFile === 'string' ? kbisFile : 'Extrait_Immatriculation.pdf'
                  ),
                  fileName: typeof kbisFile === 'string' ? kbisFile : 'Extrait_Immatriculation.pdf',
                  fileSize: 1048576,
                  mimeType: 'application/pdf',
                },
              ],
            }
          : undefined,
        products: {
          create: (products || []).slice(0, 10).map((prod: any, idx: number) => ({
            title: prod.title || `Produit Catalogue #${idx + 1}`,
            slug: `${(prod.title || 'produit').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}-${idx}`,
            description: prod.description || 'Description du produit catalogue B2B.',
            category: prod.category || sector || 'Général',
            priceMin: prod.priceMin ? Number(prod.priceMin) : 10,
            priceMax: prod.priceMax ? Number(prod.priceMax) : 25,
            currency: prod.currency || 'EUR',
            moq: prod.moq ? Number(prod.moq) : 10,
            unit: prod.unit || 'unité',
            originCountry: country || 'Sénégal',
            images: prod.images && prod.images.length > 0
              ? prod.images
              : ['https://images.unsplash.com/photo-1608248597359-54d922336336?auto=format&fit=crop&q=80&w=800'],
            isPublished: true,
          })),
        },
      },
      include: {
        products: true,
        documents: true,
      },
    });

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
