import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
      },
      include: {
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Erreur API /api/products :', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de récupérer les produits' },
      { status: 500 }
    );
  }
}
