import { NextResponse } from 'next/server';
import {
  changeAccountPassword,
  createSessionToken,
  getSessionFromRequest,
  SESSION_COOKIE_NAME,
} from '@/features/auth/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, currentPassword, newPassword } = body;

    const targetEmail = (email || session?.email || '').trim().toLowerCase();
    if (!targetEmail) {
      return NextResponse.json(
        { success: false, error: 'Session invalide ou adresse e-mail manquante.' },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' },
        { status: 400 }
      );
    }

    const result = changeAccountPassword({
      email: targetEmail,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword.trim(),
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Impossible de mettre à jour le mot de passe.' },
        { status: 400 }
      );
    }

    const token = createSessionToken(result.user);
    const response = NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès. L’ancien mot de passe fourni a été désactivé.',
      user: result.user,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur interne lors de la mise à jour du mot de passe.' },
      { status: 500 }
    );
  }
}
