import { NextResponse } from 'next/server';
import { MODERATOR_EMAILS } from '@/features/auth/service';
import { buildBankTransferInstructions } from '@/features/payment/config/rib.config';
import { getSentEmailLogs } from '@/features/payment/services/email.service';
import { listPaymentOrders } from '@/features/payment/services/fulfillment.service';
import { PaymentOrderStatusType, PaymentProviderCode } from '@/features/payment/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminEmail = (searchParams.get('adminEmail') || '').trim().toLowerCase();
    const statusFilter = searchParams.get('status') as PaymentOrderStatusType | null;
    const providerFilter = searchParams.get('provider') as PaymentProviderCode | null;

    if (adminEmail && !MODERATOR_EMAILS.includes(adminEmail)) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé.' },
        { status: 403 }
      );
    }

    const orders = await listPaymentOrders({
      status: statusFilter || undefined,
      provider: providerFilter || undefined,
    });

    const enriched = orders.map((o) => ({
      ...o,
      bankTransferDetails:
        o.provider === 'BANK_TRANSFER'
          ? buildBankTransferInstructions(o.reference, o.amount, o.currency)
          : undefined,
    }));

    const waitingTransfersCount = orders.filter((o) => o.status === 'WAITING_TRANSFER').length;
    const paidOrdersCount = orders.filter((o) => o.status === 'PAID').length;

    return NextResponse.json({
      success: true,
      orders: enriched,
      stats: {
        totalOrders: orders.length,
        waitingTransfersCount,
        paidOrdersCount,
      },
      emailLogs: getSentEmailLogs().slice(0, 30),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur chargement paiements admin.' },
      { status: 500 }
    );
  }
}
