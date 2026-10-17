import { NextResponse } from 'next/server';
import { getMaintenanceStatus, setMaintenanceStatus } from '@/features/maintenance/service';
import { SUPER_ADMIN_EMAIL } from '@/context/AuthContext';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const status = await getMaintenanceStatus();
    return NextResponse.json(
      {
        success: true,
        ...status,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la récupération du statut de maintenance',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { isMaintenanceActive, message, requesterEmail } = body;

    const emailFromHeader = req.headers.get('x-user-email');
    const emailCandidate = (requesterEmail || emailFromHeader || '').trim().toLowerCase();

    // Vérification stricte des autorisations Super Admin
    const isAuthorized = emailCandidate === SUPER_ADMIN_EMAIL.toLowerCase();

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accès non autorisé. Seul le Super Admin peut modifier le mode maintenance.',
        },
        { status: 403 }
      );
    }

    if (typeof isMaintenanceActive !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètre isMaintenanceActive manquant ou invalide.',
        },
        { status: 400 }
      );
    }

    const updated = await setMaintenanceStatus({
      isMaintenanceActive,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        notice: isMaintenanceActive
          ? 'Mode maintenance activé. L’accès public est verrouillé.'
          : 'Site redémarré avec succès. L’accès public est rétabli.',
        ...updated,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du mode maintenance',
      },
      { status: 500 }
    );
  }
}
