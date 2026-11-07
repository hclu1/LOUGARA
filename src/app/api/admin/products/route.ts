import { NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { fetchAllAdminProductsViaSupabaseRest } from '@/lib/supabase-db';
import { isRequestAdminAuthorized } from '@/features/auth/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminEmail = searchParams.get('adminEmail');
    const authCheck = isRequestAdminAuthorized(req, adminEmail);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: 'Accès administrateur requis' },
        { status: 403 }
      );
    }

    await ensureSchemaSynced();
    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              country: true,
              sector: true,
              verificationStatus: true,
              isPublished: true,
              website: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch {
      products = await fetchAllAdminProductsViaSupabaseRest();
    }

    if (products.length === 0) {
      try {
        products = await fetchAllAdminProductsViaSupabaseRest();
      } catch {}
    }

    const enrichedProducts = products.map((p: any) => ({
      ...p,
      externalLink:
        p.externalLink ||
        p.company?.website ||
        extractUrlFromText(p.description) ||
        null,
      isLinkApproved: Boolean(p.isLinkApproved),
    }));

    return NextResponse.json({
      success: true,
      products: enrichedProducts,
    });
  } catch (error: any) {
    console.error('Erreur API /api/admin/products :', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de charger la liste des produits pour modération' },
      { status: 500 }
    );
  }
}
