import { NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { fetchPublishedProductsViaSupabaseRest } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await ensureSchemaSynced();
    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: {
          isPublished: true,
          moderationStatus: 'APPROVED',
          company: {
            isPublished: true,
            verificationStatus: 'VERIFIED',
          },
        },
        include: {
          company: {
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 60,
      });
    } catch {
      products = await fetchPublishedProductsViaSupabaseRest();
    }

    if (products.length === 0) {
      try {
        products = await fetchPublishedProductsViaSupabaseRest();
      } catch {}
    }

    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Erreur API /api/products :', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de récupérer les produits' },
      { status: 500 }
    );
  }
}
