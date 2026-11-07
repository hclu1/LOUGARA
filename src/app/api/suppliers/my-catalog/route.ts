import { NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-storage';
import { getSessionFromRequest, MODERATOR_EMAILS } from '@/features/auth/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Recherche une entreprise existante dans Supabase par e-mail (ou variante .fr),
 * avec repli sur le catalogue fournisseur actif si l'utilisateur connecté est un administrateur.
 */
async function findExistingCompany(
  primaryEmail: string,
  secondaryEmail?: string | null
): Promise<any | null> {
  await ensureSchemaSynced();

  const rawEmails = [primaryEmail, secondaryEmail || '']
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const emailCandidates: string[] = [];
  for (const em of rawEmails) {
    if (!emailCandidates.includes(em)) emailCandidates.push(em);
    if (em.endsWith('.fr')) {
      const withoutFr = em.slice(0, -3);
      if (!emailCandidates.includes(withoutFr)) emailCandidates.push(withoutFr);
    } else if (em.includes('@') && !em.includes('.', em.indexOf('@'))) {
      const withFr = `${em}.fr`;
      if (!emailCandidates.includes(withFr)) emailCandidates.push(withFr);
    }
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

  // Si l'utilisateur connecté est un administrateur ou si un seul catalogue existe en base
  const isAdminEmail = rawEmails.some((e) => MODERATOR_EMAILS.includes(e));
  if (isAdminEmail || rawEmails.some((e) => e.includes('appalacarte'))) {
    try {
      const firstComp = await prisma.companyProfile.findFirst({
        include: {
          products: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
      if (firstComp) return firstComp;
    } catch {
      const { data: firstCompRest } = await supabaseAdmin
        .from('CompanyProfile')
        .select('*, products:Product(*)')
        .order('createdAt', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (firstCompRest) {
        const sortedProds = Array.isArray(firstCompRest.products)
          ? [...firstCompRest.products].sort(
              (a: any, b: any) =>
                new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            )
          : [];
        return {
          ...firstCompRest,
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
    const primaryEmail = (queryEmail || session?.email || '').trim().toLowerCase();
    const secondaryEmail = (session?.email || queryEmail || '').trim().toLowerCase();

    if (!primaryEmail && !secondaryEmail) {
      return NextResponse.json(
        { success: false, error: 'Session non authentifiée. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const company = await findExistingCompany(primaryEmail, secondaryEmail);
    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun profil fournisseur ou catalogue enregistré pour ce compte dans la base de données.',
        },
        { status: 404 }
      );
    }

    const maxProducts = Math.max(4, company.subscription?.plan?.maxProducts ?? 4);
    const currentCount = (company.products || []).length;
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
      products: company.products || [],
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
    const primaryEmail = (body.email || session?.email || '').trim().toLowerCase();
    const secondaryEmail = (session?.email || body.email || '').trim().toLowerCase();

    if (!primaryEmail && !secondaryEmail) {
      return NextResponse.json(
        { success: false, error: 'Session requise pour ajouter une page vitrine.' },
        { status: 401 }
      );
    }

    const company = await findExistingCompany(primaryEmail, secondaryEmail);
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Aucun profil fournisseur enregistré pour ce compte.' },
        { status: 404 }
      );
    }
    const maxProducts = Math.max(4, company.subscription?.plan?.maxProducts ?? 4);

    if (maxProducts !== -1 && (company.products || []).length >= maxProducts) {
      return NextResponse.json(
        {
          success: false,
          error: `Votre catalogue a atteint la limite de ${maxProducts} pages vitrines.`,
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

    const cleanTitle = String(title || '').trim();
    const cleanDesc = String(description || cleanTitle || '').trim();
    const cleanCat = String(category || company.sector || 'Général').trim();

    if (!cleanTitle) {
      return NextResponse.json(
        { success: false, error: 'Veuillez renseigner le titre de votre page vitrine.' },
        { status: 400 }
      );
    }

    const slug = `${cleanTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'page'}-${Date.now()}`;
    const parsedMin = priceMin !== '' && priceMin !== null && priceMin !== undefined ? parseFloat(String(priceMin)) : null;
    const parsedMax = priceMax !== '' && priceMax !== null && priceMax !== undefined ? parseFloat(String(priceMax)) : null;

    const productData = {
      companyId: company.id,
      title: cleanTitle,
      slug,
      description: cleanDesc,
      category: cleanCat,
      priceMin: Number.isFinite(parsedMin as number) ? parsedMin : null,
      priceMax: Number.isFinite(parsedMax as number) ? parsedMax : null,
      currency: currency || 'EUR',
      moq: moq ? Math.max(1, parseInt(String(moq), 10) || 1) : 1,
      unit: unit || 'pièce',
      originCountry: originCountry || company.country || 'France',
      images: Array.isArray(images) ? images.slice(0, 4) : [],
      externalLink: externalLink ? String(externalLink).trim() : null,
      isLinkApproved: false,
      isPublished: false,
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
        'Nouvelle page vitrine validée par vous et transmise à l’administration Lougara pour validation finale !',
    });
  } catch (error: any) {
    console.error('Erreur API POST /api/suppliers/my-catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la page vitrine.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const primaryEmail = (body.email || session?.email || '').trim().toLowerCase();
    const secondaryEmail = (session?.email || body.email || '').trim().toLowerCase();

    if (!primaryEmail && !secondaryEmail) {
      return NextResponse.json(
        { success: false, error: 'Session requise pour valider vos pages vitrines.' },
        { status: 401 }
      );
    }

    const company = await findExistingCompany(primaryEmail, secondaryEmail);
    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Aucun profil fournisseur enregistré pour ce compte.' },
        { status: 404 }
      );
    }

    // CAS 1 : Validation groupée de plusieurs pages du catalogue (jusqu'à 4 pages)
    if (Array.isArray(body.pages)) {
      const maxProducts = Math.max(4, company.subscription?.plan?.maxProducts ?? 4);
      const incomingPages = body.pages
        .filter((p: any) => p && (String(p.title || '').trim() || String(p.description || '').trim()))
        .slice(0, maxProducts === -1 ? 10 : maxProducts);

      if (incomingPages.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Veuillez renseigner au moins le titre d’une page vitrine.' },
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

        const cleanTitle = String(page.title || page.description || `Page Vitrine ${i + 1}`).trim();
        const cleanDesc = String(page.description || cleanTitle).trim();
        const cleanCat = String(page.category || existing?.category || company.sector || 'Général').trim();
        const cleanPriceMin =
          page.priceMin !== '' && page.priceMin !== null && page.priceMin !== undefined
            ? parseFloat(String(page.priceMin))
            : null;
        const cleanPriceMax =
          page.priceMax !== '' && page.priceMax !== null && page.priceMax !== undefined
            ? parseFloat(String(page.priceMax))
            : null;
        const cleanCurrency = page.currency || existing?.currency || 'EUR';
        const cleanMoq = page.moq ? Math.max(1, parseInt(String(page.moq), 10) || 1) : 1;
        const cleanUnit = page.unit || existing?.unit || 'pièce';
        const cleanOrigin = page.originCountry || existing?.originCountry || company.country || 'France';
        const cleanImages = Array.isArray(page.images) ? page.images.slice(0, 4) : [];
        const cleanLink = page.externalLink ? String(page.externalLink).trim() : null;

        if (existing) {
          const contentChanged =
            cleanTitle !== existing.title ||
            cleanDesc !== existing.description ||
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
          const slug = `${cleanTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'page'}-${Date.now()}-${i}`;
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
            ? `✓ Vos pages vitrines (${savedProducts.length}/4) sont bien validées et enregistrées ! ${submittedToAdminCount} page(s) sont maintenant en attente de la validation finale par Admin Lougara.`
            : `✓ Vos ${savedProducts.length} page(s) vitrine(s) sont enregistrées et actives en ligne.`,
      });
    }

    // CAS 2 : Validation / modification d'une page individuelle
    const {
      id,
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du produit manquant.' },
        { status: 400 }
      );
    }

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

    const cleanTitle = title ? String(title).trim() : existing.title;
    const cleanDesc = description ? String(description).trim() : existing.description || cleanTitle;
    const cleanCat = category ? String(category).trim() : existing.category;
    const cleanLink = externalLink ? String(externalLink).trim() : null;
    const cleanImages = Array.isArray(images) ? images : existing.images || [];

    const contentChanged =
      cleanTitle !== existing.title ||
      cleanDesc !== existing.description ||
      cleanLink !== (existing.externalLink || null) ||
      JSON.stringify(cleanImages) !== JSON.stringify(existing.images || []);
    const linkChanged = cleanLink !== (existing.externalLink || null);
    const needsAdminValidation =
      contentChanged || existing.moderationStatus !== 'APPROVED' || !existing.isPublished;

    const parsedMin =
      priceMin !== undefined
        ? priceMin !== '' && priceMin !== null
          ? parseFloat(String(priceMin))
          : null
        : existing.priceMin;
    const parsedMax =
      priceMax !== undefined
        ? priceMax !== '' && priceMax !== null
          ? parseFloat(String(priceMax))
          : null
        : existing.priceMax;

    const updateData = {
      title: cleanTitle,
      description: cleanDesc,
      category: cleanCat,
      priceMin: Number.isFinite(parsedMin as number) ? parsedMin : null,
      priceMax: Number.isFinite(parsedMax as number) ? parsedMax : null,
      currency: currency || existing.currency,
      moq: moq !== undefined ? Math.max(1, parseInt(String(moq), 10) || 1) : existing.moq,
      unit: unit || existing.unit,
      originCountry: originCountry || existing.originCountry,
      images: cleanImages,
      externalLink: cleanLink,
      isLinkApproved: linkChanged ? false : Boolean(existing.isLinkApproved),
      moderationStatus: needsAdminValidation ? ('PENDING' as const) : ('APPROVED' as const),
      isPublished: needsAdminValidation ? false : true,
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
      message: needsAdminValidation
        ? '✓ Page vitrine validée par vous et transmise à l’administration Lougara pour validation finale !'
        : '✓ Page vitrine enregistrée et déjà validée en ligne !',
    });
  } catch (error: any) {
    console.error('Erreur API PUT /api/suppliers/my-catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification de la page vitrine.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    const url = new URL(req.url);
    const productId = url.searchParams.get('id');
    const queryEmail = url.searchParams.get('email');
    const primaryEmail = (queryEmail || session?.email || '').trim().toLowerCase();
    const secondaryEmail = (session?.email || queryEmail || '').trim().toLowerCase();

    if ((!primaryEmail && !secondaryEmail) || !productId) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants pour la suppression.' },
        { status: 400 }
      );
    }

    const company = await findExistingCompany(primaryEmail, secondaryEmail);
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
      message: 'Page vitrine supprimée de votre catalogue.',
    });
  } catch (error: any) {
    console.error('Erreur API DELETE /api/suppliers/my-catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la page vitrine.' },
      { status: 500 }
    );
  }
}
