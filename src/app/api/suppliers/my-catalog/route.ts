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
                orderBy: { createdAt: 'asc' },
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
        const sortedProds = Array.isArray(compRow.products)
          ? [...compRow.products].sort(
              (a: any, b: any) =>
                new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            )
          : [];
        return {
          ...compRow,
          products: sortedProds,
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
    const productData = {
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
      isLinkApproved: false, // Nécessite validation finale d'un administrateur Lougara
      isPublished: false, // En attente de validation finale par Admin Lougara
      moderationStatus: 'PENDING' as const,
    };

    let newProduct: any;
    try {
      newProduct = await prisma.product.create({
        data: productData,
      });
    } catch {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabaseAdmin
        .from('Product')
        .insert({
          id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          ...productData,
          createdAt: nowIso,
          updatedAt: nowIso,
        })
        .select('*')
        .single();
      if (error) throw error;
      newProduct = data;
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
      message:
        'Nouvelle page vitrine validée et transmise à l’administration Lougara pour validation finale !',
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

    // CAS 1 : Validation groupée de plusieurs pages du catalogue (jusqu'à 4 pages)
    if (Array.isArray(body.pages)) {
      const maxProducts = company.subscription?.plan?.maxProducts ?? 4;
      const incomingPages = body.pages
        .filter((p: any) => p && String(p.title || '').trim() && String(p.description || '').trim())
        .slice(0, maxProducts === -1 ? 10 : maxProducts);

      if (incomingPages.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Veuillez renseigner au moins le titre et la description d’une page.' },
          { status: 400 }
        );
      }

      const savedProducts: any[] = [];
      let submittedToAdminCount = 0;

      for (let i = 0; i < incomingPages.length; i++) {
        const page = incomingPages[i];
        const pageId = typeof page.id === 'string' && !page.id.startsWith('new-') ? page.id : null;
        const existing = pageId
          ? (company.products || []).find((p: any) => p.id === pageId) || null
          : null;

        const cleanTitle = String(page.title).trim();
        const cleanDesc = String(page.description).trim();
        const cleanCat = String(page.category || company.sector || 'Agroalimentaire & Épices').trim();
        const cleanPriceMin = page.priceMin !== '' && page.priceMin !== null && page.priceMin !== undefined ? parseFloat(String(page.priceMin)) : null;
        const cleanPriceMax = page.priceMax !== '' && page.priceMax !== null && page.priceMax !== undefined ? parseFloat(String(page.priceMax)) : null;
        const cleanCurrency = page.currency || 'EUR';
        const cleanMoq = page.moq ? Math.max(1, parseInt(String(page.moq), 10) || 1) : 1;
        const cleanUnit = page.unit || 'pièce';
        const cleanOrigin = page.originCountry || company.country || 'France';
        const cleanImages = Array.isArray(page.images) ? page.images.slice(0, 4) : [];
        const cleanLink = page.externalLink ? String(page.externalLink).trim() : null;

        if (existing) {
          const contentChanged =
            cleanTitle !== existing.title ||
            cleanDesc !== existing.description ||
            cleanCat !== existing.category ||
            cleanLink !== (existing.externalLink || null) ||
            JSON.stringify(cleanImages) !== JSON.stringify(existing.images || []);
          const linkChanged = cleanLink !== (existing.externalLink || null);
          const needsAdminValidation =
            contentChanged || existing.moderationStatus !== 'APPROVED' || !existing.isPublished;

          if (needsAdminValidation) submittedToAdminCount++;

          const updateData = {
            title: cleanTitle,
            description: cleanDesc,
            category: cleanCat,
            priceMin: Number.isFinite(cleanPriceMin as number) ? cleanPriceMin : null,
            priceMax: Number.isFinite(cleanPriceMax as number) ? cleanPriceMax : null,
            currency: cleanCurrency,
            moq: cleanMoq,
            unit: cleanUnit,
            originCountry: cleanOrigin,
            images: cleanImages,
            externalLink: cleanLink,
            isLinkApproved: linkChanged ? false : Boolean(existing.isLinkApproved),
            moderationStatus: needsAdminValidation ? ('PENDING' as const) : ('APPROVED' as const),
            isPublished: needsAdminValidation ? false : true,
          };

          try {
            const up = await prisma.product.update({
              where: { id: existing.id },
              data: updateData,
            });
            savedProducts.push(up);
          } catch {
            const { data } = await supabaseAdmin
              .from('Product')
              .update({ ...updateData, updatedAt: new Date().toISOString() })
              .eq('id', existing.id)
              .eq('companyId', company.id)
              .select('*')
              .single();
            if (data) savedProducts.push(data);
          }
        } else {
          // Nouvelle page vitrine ajoutée
          submittedToAdminCount++;
          const slug = `${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}-${i}`;
          const createData = {
            companyId: company.id,
            title: cleanTitle,
            slug,
            description: cleanDesc,
            category: cleanCat,
            priceMin: Number.isFinite(cleanPriceMin as number) ? cleanPriceMin : null,
            priceMax: Number.isFinite(cleanPriceMax as number) ? cleanPriceMax : null,
            currency: cleanCurrency,
            moq: cleanMoq,
            unit: cleanUnit,
            originCountry: cleanOrigin,
            images: cleanImages,
            externalLink: cleanLink,
            isLinkApproved: false,
            isPublished: false,
            moderationStatus: 'PENDING' as const,
          };
          try {
            const created = await prisma.product.create({ data: createData });
            savedProducts.push(created);
          } catch {
            const nowIso = new Date().toISOString();
            const { data } = await supabaseAdmin
              .from('Product')
              .insert({
                id: `prod_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
                ...createData,
                createdAt: nowIso,
                updatedAt: nowIso,
              })
              .select('*')
              .single();
            if (data) savedProducts.push(data);
          }
        }
      }

      return NextResponse.json({
        success: true,
        products: savedProducts,
        message:
          submittedToAdminCount > 0
            ? `Vos pages vitrines (${savedProducts.length}/4) ont été enregistrées ! ${submittedToAdminCount} page(s) ont été transmise(s) à l’administration Lougara pour validation finale.`
            : `Vos ${savedProducts.length} page(s) vitrine(s) sont à jour et validées.`,
      });
    }

    // CAS 2 : Validation / modification d'une page individuelle
    const { id, title, description, category, priceMin, priceMax, currency, moq, unit, originCountry, images, externalLink } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du produit manquant.' },
        { status: 400 }
      );
    }

    // Vérifier que le produit appartient bien à la société
    let existing: any = null;
    try {
      existing = await prisma.product.findFirst({
        where: { id, companyId: company.id },
      });
    } catch {
      existing = (company.products || []).find((p: any) => p.id === id) || null;
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable ou non autorisé.' },
        { status: 404 }
      );
    }

    const cleanLink = externalLink ? externalLink.trim() : null;
    const linkChanged = cleanLink !== existing.externalLink;
    const updateData = {
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
      // Toute validation/modification par le client soumet la page à la validation finale de l'Admin Lougara
      moderationStatus: 'PENDING' as const,
      isPublished: false,
    };

    let updated: any;
    try {
      updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });
    } catch {
      const { data, error } = await supabaseAdmin
        .from('Product')
        .update({ ...updateData, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .eq('companyId', company.id)
        .select('*')
        .single();
      if (error) throw error;
      updated = data;
    }

    return NextResponse.json({
      success: true,
      product: updated,
      message:
        'Page vitrine enregistrée et envoyée à l’administration Lougara pour validation finale !',
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

    let existing: any = null;
    try {
      existing = await prisma.product.findFirst({
        where: { id: productId, companyId: company.id },
      });
    } catch {
      existing = (company.products || []).find((p: any) => p.id === productId) || null;
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable ou non autorisé.' },
        { status: 404 }
      );
    }

    try {
      await prisma.product.delete({
        where: { id: productId },
      });
    } catch {
      const { error } = await supabaseAdmin
        .from('Product')
        .delete()
        .eq('id', productId)
        .eq('companyId', company.id);
      if (error) throw error;
    }

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
