import { NextResponse } from 'next/server';
import { buildBankTransferInstructions } from '@/features/payment/config/rib.config';
import { listPaymentOrders } from '@/features/payment/services/fulfillment.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || '';

    const orders = await listPaymentOrders(
      email ? { customerEmail: email } : undefined
    );

    const enriched = orders.map((order) => ({
      ...order,
      bankTransferDetails:
        order.provider === 'BANK_TRANSFER'
          ? buildBankTransferInstructions(order.reference, order.amount, order.currency)
          : undefined,
    }));

    return NextResponse.json({
      success: true,
      orders: enriched,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur chargement historique.' },
      { status: 500 }
    );
  }
}
