import { NextResponse } from 'next/server';
import { prisma, ensureSchemaSynced } from '@/lib/prisma';
import { isRequestAdminAuthorized } from '@/features/auth/service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = isRequestAdminAuthorized(req);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé. Rôle administrateur requis.' },
        { status: 403 }
      );
    }

    await ensureSchemaSynced();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { isLinkApproved } = body;

    if (typeof isLinkApproved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Le champ isLinkApproved (booléen) est requis.' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        isLinkApproved,
      },
    });

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
