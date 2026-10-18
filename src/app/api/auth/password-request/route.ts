import { NextResponse } from 'next/server';
import { submitClientPasswordRequest } from '@/features/auth/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, fullName, name, companyName, clientRole, role, country, requestType } = body;

    const result = submitClientPasswordRequest({
      email,
      password,
      fullName: fullName || name,
      companyName,
      clientRole: clientRole || role,
      country,
      requestType: requestType === 'INITIAL_CREATION' ? 'INITIAL_PASSWORD' : requestType,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Impossible d’enregistrer la demande de mot de passe.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Votre mot de passe sécurisé a été chiffré et transmis pour validation par l’équipe d’administration Lougara.',
      request: result.request,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la soumission du mot de passe.',
      },
      { status: 500 }
    );
  }
}
