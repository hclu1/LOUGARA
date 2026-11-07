import { NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-storage';
import { isRequestAdminAuthorized } from '@/features/auth/service';

export const dynamic = 'force-dynamic';

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
  const domainMatch = text.match(
    /\b([a-z0-9-]+\.(?:fr|com|net|org|io|sn|ci|africa|eu|shop|store)(?:\/[^\s,;)"']*)?)/i
  );
  if (domainMatch) return `https://${domainMatch[1].replace(/[.,;!?]+$/, '')}`;
  return null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const { isLinkApproved, externalLink, adminEmail } = body;

    const authCheck = isRequestAdminAuthorized(req, adminEmail);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Rôle administrateur requis.' },
        { status: 403 }
      );
    }

    await ensureSchemaSynced();
    const { id } = await params;

    if (typeof isLinkApproved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Le champ isLinkApproved (booléen) est requis.' },
        { status: 400 }
      );
    }

    const cleanUrl = normalizeUrl(externalLink);

    let updatedProduct: any;
    try {
      const existing = await prisma.product.findUnique({
        where: { id },
        include: { company: true },
      });
      const resolvedUrl =
        cleanUrl ||
        normalizeUrl(existing?.externalLink) ||
        normalizeUrl(existing?.company?.website) ||
        extractUrlFromText(existing?.description) ||
        null;

      updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          ...(resolvedUrl !== null ? { externalLink: resolvedUrl } : {}),
          isLinkApproved,
        },
      });
      if (existing?.companyId && resolvedUrl) {
        await prisma.companyProfile
          .update({
            where: { id: existing.companyId },
            data: { website: resolvedUrl },
          })
          .catch(() => {});
      }
    } catch {
      const { data: existing } = await supabaseAdmin
        .from('Product')
        .select('*, company:CompanyProfile(*)')
        .eq('id', id)
        .maybeSingle();

      const resolvedUrl =
        cleanUrl ||
        normalizeUrl(existing?.externalLink) ||
        normalizeUrl(existing?.company?.website) ||
        extractUrlFromText(existing?.description) ||
        null;

      const { data } = await supabaseAdmin
        .from('Product')
        .update({
          ...(resolvedUrl !== null ? { externalLink: resolvedUrl } : {}),
          isLinkApproved,
        })
        .eq('id', id)
        .select()
        .single();
      updatedProduct = data;
      if (existing?.companyId && resolvedUrl) {
        await supabaseAdmin
          .from('CompanyProfile')
          .update({ website: resolvedUrl })
          .eq('id', existing.companyId);
      }
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: isLinkApproved
        ? 'Lien externe approuvé avec succès pour la vitrine publique.'
        : 'Lien externe suspendu / retiré de la vitrine publique.',
    });
  } catch (err: any) {
    console.error('Erreur API link-approval:', err);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l’approbation du lien.' },
      { status: 500 }
    );
  }
}
