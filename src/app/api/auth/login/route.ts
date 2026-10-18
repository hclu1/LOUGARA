import { NextResponse } from 'next/server';
import {
  authenticateAccount,
  createSessionToken,
  getSessionFromRequest,
  SESSION_COOKIE_NAME,
} from '@/features/auth/service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ success: true, authenticated: false, user: null });
  }
  return NextResponse.json({
    success: true,
    authenticated: true,
    user: session,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, requireAdmin } = body;

    const result = authenticateAccount({
      email,
      password,
      requireAdmin: Boolean(requireAdmin),
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Authentification refusée.',
        },
        { status: result.statusCode || 401 }
      );
    }

    const token = createSessionToken(result.user);
    const response = NextResponse.json({
      success: true,
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
      {
        success: false,
        error: 'Erreur interne lors de la connexion.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
