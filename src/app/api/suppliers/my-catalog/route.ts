import { NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-storage';
import { getSessionFromRequest } from '@/features/auth/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Recherche uniquement une entreprise existante dans Supabase sans JAMAIS créer de client fictif.
 * Gère également la correspondance d'adresse (ex: contact@appalacarte / contact@appalacarte.fr).
 */
async function findExistingCompany(email: string): Promise<any | null> {
  await ensureSchemaSynced();
  const cleanEmail = email.trim().toLowerCase();
  const emailCandidates = [cleanEmail];
  if (cleanEmail.endsWith('.fr')) {
    emailCandidates.push(cleanEmail.slice(0, -3));
  } else if (!cleanEmail.includes('.', cleanEmail.indexOf('@'))) {
    emailCandidates.push(`${cleanEmail}.fr`);
  }

  try {
    for (const candidate of emailCandidates) {
      const user = await prisma.user.findFirst({
        where: {
          email: { equals: candidate, mode: 'insensitive' },
        },
        include: {
          company: {
            include: {
              products: {
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      });

      if (user?.company) {
        return user.company;
      }
    }
  } catch {
    // Fallback REST Supabase
  }

  for (const candidate of emailCandidates) {
    const { data: userRow } = await supabaseAdmin
      .from('User')
      .select('id, email')
      .ilike('email', candidate)
      .maybeSingle();

    if (userRow?.id) {
      const { data: compRow } = await supabaseAdmin
        .from('CompanyProfile')
        .select('*, products:Product(*)')
        .eq('userId', userRow.id)
        .maybeSingle();

      if (compRow) {
        return {
          ...compRow,
          products: Array.isArray(compRow.products) ? compRow.products : [],
        };
      }
    }
  }

  return null;
}

export async function GET(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    const url = new URL(req.url);
    const queryEmail = url.searchParams.get('email');
    const targetEmail = (session?.email || queryEmail || '').trim().toLowerCase();

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Session non authentifiée. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const company = await findExistingCompany(targetEmail);
    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun profil fournisseur ou catalogue enregistré pour ce compte dans la base de données.',
        },
        { status: 404 }
      );
    }

    // Déterminer la limite de produits selon l'abonnement
    const maxProducts = company.subscription?.plan?.maxProducts ?? 4; // 4 par défaut pour le forfait gratuit
    const currentCount = company.products.length;
    const canAdd = maxProducts === -1 || currentCount < maxProducts;

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        companyName: company.companyName,
        country: company.country,
        city: company.city,
        sector: company.sector,
        verificationStatus: company.verificationStatus,
        isPublished: company.isPublished,
      },
      subscription: company.subscription?.plan
        ? {
            name: company.subscription.plan.name,
            code: company.subscription.plan.code,
            maxProducts,
          }
        : {
            name: 'Formule Initiale Gratuite',
            code: 'FREE',
            maxProducts: 4,
          },
      quota: {
        current: currentCount,
        max: maxProducts,
        canAdd,
      },
      products: company.products,
    });
  } catch (error: any) {
    console.error('Erreur API GET /api/suppliers/my-catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de récupérer votre vitrine.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const targetEmail = (session?.email || body.email || '').trim().toLowerCase();

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Session requise pour ajouter un produit.' },
        { status: 401 }
      );
    }

    const company = await findExistingCompany(targetEmail);
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Aucun profil fournisseur enregistré pour ce compte.' },
        { status: 404 }
      );
    }
    const maxProducts = company.subscription?.plan?.maxProducts ?? 4;

    if (maxProducts !== -1 && company.products.length >= maxProducts) {
      return NextResponse.json(
        {
          success: false,
          error: `Votre forfait actuel est limité à ${maxProducts} produit(s). Mettez à niveau votre abonnement pour exposer davantage de références.`,
        },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      category,
      priceMin,
      priceMax,
      currency,
      moq,
      unit,
      originCountry,
      images,
      externalLink,
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Titre, description et catégorie sont obligatoires.' },
        { status: 400 }
      );
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`;

    const newProduct = await prisma.product.create({
      data: {
        companyId: company.id,
        title: title.trim(),
        slug,
        description: description.trim(),
        category: category.trim(),
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        currency: currency || 'EUR',
        moq: moq ? parseInt(moq, 10) : 1,
        unit: unit || 'pièce',
        originCountry: originCountry || company.country || 'France',
        images: Array.isArray(images) ? images : [],
        externalLink: externalLink ? externalLink.trim() : null,
        isLinkApproved: false, // Nécessite validation d'un administrateur
        isPublished: true,
        moderationStatus: 'APPROVED',
      },
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Produit ajouté à votre vitrine avec succès !' + (externalLink ? ' Le lien externe sera vérifié par notre équipe avant d’être affiché.' : ''),
    });
  } catch (error: any) {
    console.error('Erreur API POST /api/suppliers/my-catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du produit.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const targetEmail = (session?.email || body.email || '').trim().toLowerCase();

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Session requise pour modifier un produit.' },
        { status: 401 }
      );
    }

    const company = await findExistingCompany(targetEmail);
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Aucun profil fournisseur enregistré pour ce compte.' },
        { status: 404 }
      );
    }
    const { id, title, description, category, priceMin, priceMax, currency, moq, unit, originCountry, images, externalLink } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du produit manquant.' },
        { status: 400 }
      );
    }

    // Vérifier que le produit appartient bien à la société
    const existing = await prisma.product.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable ou non autorisé.' },
        { status: 404 }
      );
    }

    const cleanLink = externalLink ? externalLink.trim() : null;
    const linkChanged = cleanLink !== existing.externalLink;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: title ? title.trim() : existing.title,
        description: description ? description.trim() : existing.description,
        category: category ? category.trim() : existing.category,
        priceMin: priceMin !== undefined ? (priceMin ? parseFloat(priceMin) : null) : existing.priceMin,
        priceMax: priceMax !== undefined ? (priceMax ? parseFloat(priceMax) : null) : existing.priceMax,
        currency: currency || existing.currency,
        moq: moq !== undefined ? parseInt(moq, 10) : existing.moq,
        unit: unit || existing.unit,
        originCountry: originCountry || existing.originCountry,
        images: Array.isArray(images) ? images : existing.images,
        externalLink: cleanLink,
        // Si le lien a changé, on réinitialise l'approbation pour modération
        isLinkApproved: linkChanged ? false : existing.isLinkApproved,
      },
    });

    return NextResponse.json({
      success: true,
      product: updated,
      message: 'Produit mis à jour avec succès.' + (linkChanged && cleanLink ? ' Le nouveau lien est soumis à modération.' : ''),
    });
  } catch (error: any) {
    console.error('Erreur API PUT /api/suppliers/my-catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification du produit.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    const url = new URL(req.url);
    const productId = url.searchParams.get('id');
    const targetEmail = (session?.email || url.searchParams.get('email') || '').trim().toLowerCase();

    if (!targetEmail || !productId) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants pour la suppression.' },
        { status: 400 }
      );
    }

    const company = await findExistingCompany(targetEmail);
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Aucun profil fournisseur enregistré pour ce compte.' },
        { status: 404 }
      );
    }

    const existing = await prisma.product.findFirst({
      where: { id: productId, companyId: company.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable ou non autorisé.' },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé de votre vitrine.',
    });
  } catch (error: any) {
    console.error('Erreur API DELETE /api/suppliers/my-catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du produit.' },
      { status: 500 }
    );
  }
}
