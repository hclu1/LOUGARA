import { NextRequest, NextResponse } from 'next/server';
import {
  registerEntrepreneur,
  getRegisteredEntrepreneurs,
} from '@/features/entrepreneurs/service';
import { submitClientPasswordRequest } from '@/features/auth/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entrepreneur = await registerEntrepreneur(body);

    // Enregistrement sécurisé du mot de passe client dans la file de validation Admin
    if (body?.email) {
      const rawPassword =
        typeof body.password === 'string' && body.password.trim().length >= 4
          ? body.password.trim()
          : `Lougara-${String(body.email).split('@')[0]}-2026`;
      submitClientPasswordRequest({
        email: body.email,
        password: rawPassword,
        fullName: `${body.firstName || ''} ${body.lastName || ''}`.trim() || entrepreneur.firstName,
        companyName: body.companyName || entrepreneur.companyName,
        country: body.country || entrepreneur.country,
        clientRole: 'entrepreneur',
        requestType: 'CLIENT_REGISTRATION',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription validée avec succès dans la base de données Lougara.',
      entrepreneur,
    });
  } catch (err: any) {
    console.error('Erreur API inscription entrepreneur :', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Données d\'inscription invalides.',
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const entrepreneurs = await getRegisteredEntrepreneurs();
    return NextResponse.json(
      {
        success: true,
        count: entrepreneurs.length,
        entrepreneurs,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
