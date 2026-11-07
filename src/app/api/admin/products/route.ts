import { NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { isRequestAdminAuthorized } from '@/features/auth/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const authCheck = isRequestAdminAuthorized(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: 'Accès administrateur requis' },
        { status: 403 }
      );
    }

    await ensureSchemaSynced();
    const products = await prisma.product.findMany({
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            country: true,
            sector: true,
            verificationStatus: true,
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

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
