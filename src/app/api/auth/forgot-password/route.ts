import { NextResponse } from 'next/server';
import { submitClientPasswordRequest } from '@/features/auth/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, newPassword } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Veuillez saisir une adresse e-mail professionnelle valide.' },
        { status: 400 }
      );
    }

    const passwordCandidate = (newPassword || '').trim() || 'LougaraReset' + Math.floor(1000 + Math.random() * 9000);

    // Enregistrement de la demande de réinitialisation sécurisée
    submitClientPasswordRequest({
      email: cleanEmail,
      password: passwordCandidate,
      requestType: 'PASSWORD_RESET',
    });

    // Réponse uniforme et sécurisée (anti-énumération des comptes)
    return NextResponse.json({
      success: true,
      message:
        'Si cette adresse e-mail correspond à un compte actif sur Lougara, votre demande de réinitialisation a été enregistrée avec succès. Elle a été transmise aux administrateurs pour validation sécurisée.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la prise en compte de votre demande.' },
      { status: 500 }
    );
  }
}
