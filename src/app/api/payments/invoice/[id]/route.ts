import { NextResponse } from 'next/server';
import { findPaymentOrder } from '@/features/payment/services/fulfillment.service';
import { generateInvoicePdfBuffer } from '@/features/payment/services/invoice-pdf.service';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await findPaymentOrder(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Commande ou facture introuvable.' },
        { status: 404 }
      );
    }

    if (order.status !== 'PAID') {
      return NextResponse.json(
        {
          success: false,
          error:
            'La facture PDF officielle est générée uniquement une fois le paiement confirmé ou le virement validé.',
        },
        { status: 400 }
      );
    }

    const invoiceNumber = order.invoiceNumber || `FAC-${new Date().getFullYear()}-0001`;
    const pdfBuffer = generateInvoicePdfBuffer({
      invoiceNumber,
      orderReference: order.reference,
      issuedAt: order.invoiceIssuedAt ? new Date(order.invoiceIssuedAt) : new Date(order.createdAt),
      paidAt: order.paidAt ? new Date(order.paidAt) : new Date(),
      customerName: order.customerName || order.customerEmail,
      customerCompany: order.companyName,
      customerEmail: order.customerEmail,
      customerAddress: order.countryCode,
      planName: order.planName,
      billingCycle: order.billingCycle,
      paymentProvider: order.provider,
      amountHt: order.amount,
      taxRate: 0,
      taxAmount: 0,
      amountTtc: order.amount,
      currency: order.currency,
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Facture-${invoiceNumber}-${order.reference}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur génération facture PDF.' },
      { status: 500 }
    );
  }
}
