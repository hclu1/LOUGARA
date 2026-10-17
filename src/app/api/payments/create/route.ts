import { NextResponse } from 'next/server';
import { getPaymentProvider } from '@/features/payment/providers';
import {
  createPaymentOrderRecord,
  notifyBankTransferOrderCreated,
  updatePaymentOrderProviderInfo,
} from '@/features/payment/services/fulfillment.service';
import {
  generateOrderReference,
  resolveServerOrderPricing,
} from '@/features/payment/services/pricing.service';
import {
  PaymentBillingCycleType,
  PaymentChannelType,
  PaymentProviderCode,
} from '@/features/payment/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      planCode,
      billingCycle = 'MONTHLY',
      currency = 'EUR',
      countryCode = 'FR',
      provider = 'STRIPE',
      paymentMethodType,
      customerEmail,
      customerName,
      companyId,
      companyName,
      userId,
    } = body;

    if (!customerEmail || !customerEmail.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Veuillez renseigner une adresse email professionnelle valide.',
        },
        { status: 400 }
      );
    }

    const normalizedCycle: PaymentBillingCycleType =
      billingCycle === 'ANNUAL' || billingCycle === 'annual'
        ? 'ANNUAL'
        : billingCycle === 'ONE_TIME' || billingCycle === 'one_time'
          ? 'ONE_TIME'
          : 'MONTHLY';

    // 1. Validation et calcul strict du montant côté serveur
    const pricing = resolveServerOrderPricing(planCode, normalizedCycle, currency);

    // 2. Génération de la référence unique LOU-AAAA-XXXX
    const reference = generateOrderReference();
    const providerCode = (provider as string).toUpperCase() as PaymentProviderCode;
    const paymentProvider = getPaymentProvider(providerCode);

    // 3. Création de l'enregistrement de commande en base de données
    const orderRecord = await createPaymentOrderRecord({
      reference,
      userId,
      customerEmail,
      customerName: customerName || customerEmail.split('@')[0],
      companyId,
      companyName,
      countryCode: countryCode || 'FR',
      planCode: pricing.planCode,
      planName: pricing.planNameFr,
      billingCycle: pricing.billingCycle,
      amount: pricing.amount,
      currency: pricing.currency,
      provider: providerCode,
      paymentMethodType: paymentMethodType || undefined,
      status: providerCode === 'BANK_TRANSFER' ? 'WAITING_TRANSFER' : 'PENDING',
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 4. Appel du prestataire sélectionné via l'interface commune PaymentProvider
    const providerResult = await paymentProvider.createPayment({
      orderId: orderRecord.id,
      reference: orderRecord.reference,
      planCode: pricing.planCode,
      planName: pricing.planNameFr,
      billingCycle: pricing.billingCycle,
      amount: pricing.amount,
      currency: pricing.currency,
      customerEmail: orderRecord.customerEmail,
      customerName: orderRecord.customerName || undefined,
      companyId: orderRecord.companyId || undefined,
      companyName: orderRecord.companyName || undefined,
      countryCode: orderRecord.countryCode,
      paymentMethodType: paymentMethodType as PaymentChannelType | undefined,
      returnUrl: `${appUrl}/paiement/succes?ref=${encodeURIComponent(orderRecord.reference)}`,
      cancelUrl: `${appUrl}/paiement/echec?ref=${encodeURIComponent(orderRecord.reference)}`,
    });

    // 5. Mise à jour de la commande avec les identifiants du prestataire
    await updatePaymentOrderProviderInfo(orderRecord.reference, {
      status: providerResult.status,
      providerPaymentId: providerResult.providerPaymentId,
      providerClientSecret: providerResult.clientSecret,
    });

    // 6. Si virement bancaire manuel, envoyer l'email d'instructions RIB immédiatement
    if (providerCode === 'BANK_TRANSFER' && providerResult.success) {
      await notifyBankTransferOrderCreated(orderRecord);
    }

    return NextResponse.json({
      success: providerResult.success,
      order: {
        id: orderRecord.id,
        reference: orderRecord.reference,
        planCode: pricing.planCode,
        planName: pricing.planNameFr,
        billingCycle: pricing.billingCycle,
        amount: pricing.amount,
        currency: pricing.currency,
        provider: providerCode,
        status: providerResult.status,
      },
      clientSecret: providerResult.clientSecret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      redirectUrl: providerResult.redirectUrl,
      bankTransferDetails: providerResult.bankTransferDetails,
      isTestSimulation: providerResult.isTestSimulation || false,
      message: providerResult.message,
    });
  } catch (error: any) {
    console.error('Erreur POST /api/payments/create:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l’initialisation du paiement.',
      },
      { status: 400 }
    );
  }
}
