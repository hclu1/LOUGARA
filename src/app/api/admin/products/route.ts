import { NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { fetchAllAdminProductsViaSupabaseRest } from '@/lib/supabase-db';
import { isRequestAdminAuthorized } from '@/features/auth/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error('Erreur API /api/admin/products :', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de charger la liste des produits pour modération' },
      { status: 500 }
    );
  }
}
