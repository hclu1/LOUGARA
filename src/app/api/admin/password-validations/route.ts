import { NextResponse } from 'next/server';
import {
  isRequestAdminAuthorized,
  listPasswordValidationRequests,
  reviewPasswordValidationRequest,
} from '@/features/auth/service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const adminEmail = searchParams.get('adminEmail');

    const auth = isRequestAdminAuthorized(req, adminEmail, false);
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accès refusé. Rôle moderator ou super_admin requis.',
        },
        { status: 403 }
      );
    }

    const data = listPasswordValidationRequests(status);

    return NextResponse.json(
      {
        success: true,
        ...data,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de charger les demandes de validation des mots de passe.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { requestId, action, rejectionReason, reviewerEmail } = body;

    const auth = isRequestAdminAuthorized(req, reviewerEmail, false);
    if (!auth.authorized || !auth.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accès refusé. Rôle moderator ou super_admin requis.',
        },
        { status: 403 }
      );
    }

    if (!requestId || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres requestId et action (APPROVE | REJECT) obligatoires.',
        },
        { status: 400 }
      );
    }

    const result = reviewPasswordValidationRequest({
      requestId,
      action,
      reviewerEmail: auth.email,
      rejectionReason,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Opération impossible.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      request: result.request,
      message:
        action === 'APPROVE'
          ? `Mot de passe validé avec succès pour ${result.request?.email}. Le compte client est désormais actif.`
          : `Demande de mot de passe refusée pour ${result.request?.email}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors du traitement de la demande.',
      },
      { status: 500 }
    );
  }
}
