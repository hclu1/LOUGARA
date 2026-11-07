import { NextResponse } from 'next/server';
import { sendPasswordCreationEmail } from '@/features/payment/services/email.service';
import {
  submitClientPasswordRequest,
  syncClientsFromDatabase,
  MODERATOR_EMAILS,
} from '@/features/auth/service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const cleanEmail = String(body?.email || '')
      .trim()
      .toLowerCase();
    const contactName = String(body?.contactName || body?.name || '').trim();
    const companyName = String(body?.companyName || '').trim();
    const country = String(body?.country || 'Sénégal').trim();
    const rawPassword = typeof body?.password === 'string' ? body.password.trim() : '';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Veuillez renseigner une adresse e-mail professionnelle valide.',
        },
        { status: 400 }
      );
    }

    if (MODERATOR_EMAILS.includes(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Opération non autorisée sur ce compte.',
        },
        { status: 400 }
      );
    }

    await syncClientsFromDatabase();

    // Si le client renseigne simultanément son mot de passe à l'étape Contact 4/5
    if (rawPassword) {
      if (rawPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error: 'Le mot de passe doit contenir au moins 6 caractères.',
          },
          { status: 400 }
        );
      }

      const pwdResult = submitClientPasswordRequest({
        email: cleanEmail,
        password: rawPassword,
        fullName: contactName || companyName || 'Client B2B Lougara',
        companyName: companyName || 'Catalogue Professionnel',
        country,
        clientRole: 'supplier',
        requestType: 'CLIENT_REGISTRATION',
        activateImmediately: true,
      });

      if (!pwdResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: pwdResult.error || 'Impossible d’enregistrer le mot de passe.',
          },
          { status: 400 }
        );
      }
    }

    // Envoi du message au client pour créer / confirmer son mot de passe (Étape Contact 4/5)
    const emailResult = await sendPasswordCreationEmail({
      to: cleanEmail,
      contactName: contactName || companyName || 'Client Lougara',
      companyName: companyName || 'Votre Catalogue Lougara',
    });

    return NextResponse.json({
      success: true,
      sentViaApi: emailResult.sentViaApi,
      message: rawPassword
        ? `Un message de confirmation a été envoyé à ${cleanEmail} et votre mot de passe client est désormais enregistré pour vous connecter depuis votre catalogue.`
        : `Un message vous a été envoyé à ${cleanEmail} pour créer votre mot de passe client.`,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l’envoi du message de création de mot de passe.',
      },
      { status: 500 }
    );
  }
}
