import { NextResponse } from 'next/server';
import { MODERATOR_EMAILS } from '@/features/auth/service';
import { fulfillPaymentOrder } from '@/features/payment/services/fulfillment.service';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const adminEmail = (body.adminEmail || '').trim().toLowerCase();

    if (!adminEmail || !MODERATOR_EMAILS.includes(adminEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Action réservée aux administrateurs autorisés de Lougara.',
        },
        { status: 403 }
      );
    }

    const result = await fulfillPaymentOrder({
      orderIdentifier: id,
      validatedByEmail: adminEmail,
    });

    return NextResponse.json({
      success: true,
      alreadyPaid: result.alreadyPaid,
      order: result.order,
      invoiceNumber: result.invoiceNumber,
      message: `Virement validé avec succès. L'accès du client (${result.order.customerEmail}) est activé et la facture ${result.invoiceNumber} a été envoyée par email.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de la validation du paiement.',
      },
      { status: 400 }
    );
  }
}
