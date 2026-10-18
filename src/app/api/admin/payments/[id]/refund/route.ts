import { NextResponse } from 'next/server';
import { MODERATOR_EMAILS } from '@/features/auth/service';
import { getPaymentProvider } from '@/features/payment/providers';
import {
  findPaymentOrder,
  markPaymentOrderRefunded,
  updatePaymentOrderProviderInfo,
} from '@/features/payment/services/fulfillment.service';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const adminEmail = (body.adminEmail || '').trim().toLowerCase();
    const action = body.action || 'REFUND'; // 'REFUND' | 'CANCEL'

    if (!adminEmail || !MODERATOR_EMAILS.includes(adminEmail)) {
      return NextResponse.json(
        { success: false, error: 'Action réservée aux administrateurs.' },
        { status: 403 }
      );
    }

    const order = await findPaymentOrder(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Commande introuvable.' },
        { status: 404 }
      );
    }

    if (action === 'CANCEL') {
      const updated = await updatePaymentOrderProviderInfo(order.reference, {
        status: 'CANCELLED',
      });
      return NextResponse.json({
        success: true,
        order: updated,
        message: `La commande ${order.reference} a été annulée.`,
      });
    }

    const provider = getPaymentProvider(order.provider);
    const refundRes = await provider.refund({
      orderId: order.id,
      orderReference: order.reference,
      providerPaymentId: order.providerPaymentId || undefined,
      amount: order.amount,
      currency: order.currency,
      reason: body.reason || 'requested_by_admin',
    });

    if (refundRes.success) {
      const updated = await markPaymentOrderRefunded(order.reference);
      return NextResponse.json({
        success: true,
        order: updated,
        message: refundRes.message,
      });
    }

    return NextResponse.json(
      { success: false, error: refundRes.message || 'Échec du remboursement.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du remboursement.' },
      { status: 400 }
    );
  }
}
