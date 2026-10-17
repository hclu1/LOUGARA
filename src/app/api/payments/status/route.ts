import { NextResponse } from 'next/server';
import { buildBankTransferInstructions } from '@/features/payment/config/rib.config';
import { findPaymentOrder } from '@/features/payment/services/fulfillment.service';

/**
 * Route en LECTURE SEULE interrogée par la page de retour (/paiement/succes ou /paiement/echec).
 * Conformément aux règles de sécurité, cette route n'active JAMAIS l'accès du client :
 * seuls les webhooks signés ou le bouton Admin "Marquer comme payé" activent l'accès.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref =
      searchParams.get('ref') ||
      searchParams.get('reference') ||
      searchParams.get('payment_intent') ||
      '';

    if (!ref) {
      return NextResponse.json(
        { success: false, error: 'Référence de commande manquante.' },
        { status: 400 }
      );
    }

    const order = await findPaymentOrder(ref);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Commande introuvable.' },
        { status: 404 }
      );
    }

    const bankTransferDetails =
      order.provider === 'BANK_TRANSFER'
        ? buildBankTransferInstructions(order.reference, order.amount, order.currency)
        : undefined;

    return NextResponse.json({
      success: true,
      order,
      bankTransferDetails,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lecture statut commande.' },
      { status: 500 }
    );
  }
}
