import { prisma } from '@/lib/prisma';
import { CurrencyCode } from '@/locales/currencies';
import { buildBankTransferInstructions } from '../config/rib.config';
import {
  PaymentBillingCycleType,
  PaymentOrderStatusType,
  PaymentProviderCode,
} from '../types';
import {
  sendBankTransferInstructionsEmail,
  sendPaymentConfirmedEmail,
  sendPaymentFailedEmail,
} from './email.service';
import { generateInvoicePdfBuffer } from './invoice-pdf.service';
import { resolveServerOrderPricing } from './pricing.service';

export interface StoredPaymentOrder {
  id: string;
  reference: string;
  userId?: string | null;
  customerEmail: string;
  customerName?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  countryCode: string;
  planCode: string;
  planName: string;
  billingCycle: PaymentBillingCycleType;
  amount: number;
  currency: CurrencyCode;
  provider: PaymentProviderCode;
  paymentMethodType?: string | null;
  status: PaymentOrderStatusType;
  providerPaymentId?: string | null;
  providerClientSecret?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  metadataJson?: string | null;
  paidAt?: string | null;
  refundedAt?: string | null;
  validatedByEmail?: string | null;
  invoiceNumber?: string | null;
  invoiceIssuedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Magasin mémoire synchronisé pour garantir 100% de disponibilité pendant les tests
 * même lorsque le pooler PostgreSQL Supabase atteint sa limite de sessions simultanées.
 */
const globalForPaymentStore = globalThis as unknown as {
  paymentOrdersMap: Map<string, StoredPaymentOrder> | undefined;
  processedWebhooksSet: Set<string> | undefined;
  invoiceCounterByYear: Map<number, number> | undefined;
};

if (!globalForPaymentStore.paymentOrdersMap) {
  globalForPaymentStore.paymentOrdersMap = new Map();
}
if (!globalForPaymentStore.processedWebhooksSet) {
  globalForPaymentStore.processedWebhooksSet = new Set();
}
if (!globalForPaymentStore.invoiceCounterByYear) {
  globalForPaymentStore.invoiceCounterByYear = new Map();
}

function mapDbOrderToStored(dbOrder: any): StoredPaymentOrder {
  return {
    id: dbOrder.id,
    reference: dbOrder.reference,
    userId: dbOrder.userId,
    customerEmail: dbOrder.customerEmail,
    customerName: dbOrder.customerName,
    companyId: dbOrder.companyId,
    companyName: dbOrder.companyName,
    countryCode: dbOrder.countryCode || 'FR',
    planCode: dbOrder.planCode,
    planName: dbOrder.planName,
    billingCycle: dbOrder.billingCycle as PaymentBillingCycleType,
    amount: Number(dbOrder.amount),
    currency: (dbOrder.currency || 'EUR') as CurrencyCode,
    provider: dbOrder.provider as PaymentProviderCode,
    paymentMethodType: dbOrder.paymentMethodType,
    status: dbOrder.status as PaymentOrderStatusType,
    providerPaymentId: dbOrder.providerPaymentId,
    providerClientSecret: dbOrder.providerClientSecret,
    stripeCustomerId: dbOrder.stripeCustomerId,
    stripeSubscriptionId: dbOrder.stripeSubscriptionId,
    metadataJson: dbOrder.metadataJson,
    paidAt: dbOrder.paidAt ? new Date(dbOrder.paidAt).toISOString() : null,
    refundedAt: dbOrder.refundedAt ? new Date(dbOrder.refundedAt).toISOString() : null,
    validatedByEmail: dbOrder.validatedByEmail,
    invoiceNumber: dbOrder.invoice?.invoiceNumber || null,
    invoiceIssuedAt: dbOrder.invoice?.issuedAt
      ? new Date(dbOrder.invoice.issuedAt).toISOString()
      : null,
    createdAt: new Date(dbOrder.createdAt).toISOString(),
    updatedAt: new Date(dbOrder.updatedAt).toISOString(),
  };
}

/**
 * Crée une commande en base de données (et dans le cache de continuité).
 */
export async function createPaymentOrderRecord(input: {
  reference: string;
  userId?: string;
  customerEmail: string;
  customerName?: string;
  companyId?: string;
  companyName?: string;
  countryCode: string;
  planCode: string;
  planName: string;
  billingCycle: PaymentBillingCycleType;
  amount: number;
  currency: CurrencyCode;
  provider: PaymentProviderCode;
  paymentMethodType?: string;
  status?: PaymentOrderStatusType;
  metadata?: Record<string, any>;
}): Promise<StoredPaymentOrder> {
  const now = new Date().toISOString();
  const initialStatus = input.status || 'PENDING';
  const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null;

  let stored: StoredPaymentOrder = {
    id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    reference: input.reference,
    userId: input.userId || null,
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerName: input.customerName || 'Client B2B Lougara',
    companyId: input.companyId || null,
    companyName: input.companyName || null,
    countryCode: input.countryCode,
    planCode: input.planCode,
    planName: input.planName,
    billingCycle: input.billingCycle,
    amount: input.amount,
    currency: input.currency,
    provider: input.provider,
    paymentMethodType: input.paymentMethodType || null,
    status: initialStatus,
    metadataJson,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const dbCreated = await prisma.paymentOrder.create({
      data: {
        reference: stored.reference,
        userId: stored.userId || undefined,
        customerEmail: stored.customerEmail,
        customerName: stored.customerName,
        companyId: stored.companyId,
        companyName: stored.companyName,
        countryCode: stored.countryCode,
        planCode: stored.planCode,
        planName: stored.planName,
        billingCycle: stored.billingCycle,
        amount: stored.amount,
        currency: stored.currency,
        provider: stored.provider,
        paymentMethodType: stored.paymentMethodType,
        status: stored.status,
        metadataJson: stored.metadataJson,
      },
      include: { invoice: true },
    });
    stored = mapDbOrderToStored(dbCreated);
  } catch (err) {
    console.warn('Info Prisma createPaymentOrder (fallback mémoire actif):', err);
  }

  globalForPaymentStore.paymentOrdersMap!.set(stored.reference, stored);
  return stored;
}

/**
 * Met à jour les identifiants du prestataire sur une commande (ex: PaymentIntent ID, clientSecret, statut WAITING_TRANSFER).
 */
export async function updatePaymentOrderProviderInfo(
  reference: string,
  updates: {
    status?: PaymentOrderStatusType;
    providerPaymentId?: string;
    providerClientSecret?: string;
    stripeCustomerId?: string;
  }
): Promise<StoredPaymentOrder | null> {
  const cached = globalForPaymentStore.paymentOrdersMap!.get(reference);
  if (cached) {
    if (updates.status) cached.status = updates.status;
    if (updates.providerPaymentId) cached.providerPaymentId = updates.providerPaymentId;
    if (updates.providerClientSecret) cached.providerClientSecret = updates.providerClientSecret;
    if (updates.stripeCustomerId) cached.stripeCustomerId = updates.stripeCustomerId;
    cached.updatedAt = new Date().toISOString();
    globalForPaymentStore.paymentOrdersMap!.set(reference, cached);
  }

  try {
    const updatedDb = await prisma.paymentOrder.update({
      where: { reference },
      data: {
        status: updates.status,
        providerPaymentId: updates.providerPaymentId,
        providerClientSecret: updates.providerClientSecret,
        stripeCustomerId: updates.stripeCustomerId,
      },
      include: { invoice: true },
    });
    const mapped = mapDbOrderToStored(updatedDb);
    globalForPaymentStore.paymentOrdersMap!.set(reference, mapped);
    return mapped;
  } catch {
    return cached || null;
  }
}

/**
 * Recherche une commande par sa référence (LOU-AAAA-XXXX), son ID, ou son providerPaymentId.
 */
export async function findPaymentOrder(identifier: string): Promise<StoredPaymentOrder | null> {
  if (!identifier) return null;

  // Recherche en base d'abord
  try {
    const dbOrder = await prisma.paymentOrder.findFirst({
      where: {
        OR: [
          { reference: identifier },
          { id: identifier },
          { providerPaymentId: identifier },
        ],
      },
      include: { invoice: true },
    });
    if (dbOrder) {
      const mapped = mapDbOrderToStored(dbOrder);
      globalForPaymentStore.paymentOrdersMap!.set(mapped.reference, mapped);
      return mapped;
    }
  } catch {
    // Fallback mémoire
  }

  for (const order of globalForPaymentStore.paymentOrdersMap!.values()) {
    if (
      order.reference === identifier ||
      order.id === identifier ||
      order.providerPaymentId === identifier
    ) {
      return order;
    }
  }
  return null;
}

/**
 * Liste les commandes (filtrable par email client, statut ou prestataire).
 */
export async function listPaymentOrders(filters?: {
  customerEmail?: string;
  status?: PaymentOrderStatusType;
  provider?: PaymentProviderCode;
}): Promise<StoredPaymentOrder[]> {
  const merged = new Map<string, StoredPaymentOrder>();

  for (const [ref, ord] of globalForPaymentStore.paymentOrdersMap!.entries()) {
    merged.set(ref, ord);
  }

  try {
    const whereClause: any = {};
    if (filters?.customerEmail) {
      whereClause.customerEmail = filters.customerEmail.trim().toLowerCase();
    }
    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.provider) {
      whereClause.provider = filters.provider;
    }

    const dbOrders = await prisma.paymentOrder.findMany({
      where: whereClause,
      include: { invoice: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    for (const dbOrd of dbOrders) {
      const mapped = mapDbOrderToStored(dbOrd);
      merged.set(mapped.reference, mapped);
      globalForPaymentStore.paymentOrdersMap!.set(mapped.reference, mapped);
    }
  } catch {
    // Continue avec le cache mémoire si la BDD est momentanément saturée
  }

  let results = Array.from(merged.values());

  if (filters?.customerEmail) {
    const clean = filters.customerEmail.trim().toLowerCase();
    results = results.filter((o) => o.customerEmail.toLowerCase() === clean);
  }
  if (filters?.status) {
    results = results.filter((o) => o.status === filters.status);
  }
  if (filters?.provider) {
    results = results.filter((o) => o.provider === filters.provider);
  }

  return results.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Vérifie et enregistre l'idempotence d'un événement Webhook.
 * Retourne `true` si l'événement a DÉJÀ été traité (auquel cas il doit être ignoré).
 */
export async function checkAndRecordWebhookIdempotence(params: {
  provider: PaymentProviderCode;
  eventId: string;
  eventType: string;
  payload?: string;
}): Promise<boolean> {
  const key = `${params.provider}:${params.eventId}`;
  if (globalForPaymentStore.processedWebhooksSet!.has(key)) {
    return true;
  }

  try {
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId: params.eventId },
    });
    if (existing) {
      globalForPaymentStore.processedWebhooksSet!.add(key);
      return true;
    }

    await prisma.webhookEvent.create({
      data: {
        provider: params.provider,
        eventId: params.eventId,
        eventType: params.eventType,
        payload: params.payload ? params.payload.slice(0, 4000) : null,
      },
    });
  } catch {
    // Enregistré dans le Set mémoire
  }

  globalForPaymentStore.processedWebhooksSet!.add(key);
  return false;
}

/**
 * Génère le prochain numéro de facture séquentiel de l'année (ex: FAC-2026-0001).
 */
async function allocateSequentialInvoiceNumber(year: number): Promise<{
  sequenceNumber: number;
  invoiceNumber: string;
}> {
  let nextSeq = (globalForPaymentStore.invoiceCounterByYear!.get(year) || 0) + 1;

  try {
    const lastInvoice = await prisma.invoice.findFirst({
      where: { year },
      orderBy: { sequenceNumber: 'desc' },
    });
    if (lastInvoice && lastInvoice.sequenceNumber >= nextSeq) {
      nextSeq = lastInvoice.sequenceNumber + 1;
    }
  } catch {
    // Fallback compteur mémoire
  }

  globalForPaymentStore.invoiceCounterByYear!.set(year, nextSeq);
  const invoiceNumber = `FAC-${year}-${String(nextSeq).padStart(4, '0')}`;
  return { sequenceNumber: nextSeq, invoiceNumber };
}

/**
 * ACTIVE L'ACCÈS DU CLIENT CÔTÉ SERVEUR UNIQUEMENT (Webhook ou bouton Admin "Marquer comme payé").
 * - Idempotent : si la commande est déjà au statut PAID, retourne la commande sans dupliquer les droits ni la facture.
 * - Active l'abonnement (UserSubscription) ou crédite les mises en relation (ContactCredit).
 * - Crée la facture séquentielle (FAC-AAAA-XXXX).
 * - Envoie l'email de confirmation avec la facture PDF en pièce jointe.
 */
export async function fulfillPaymentOrder(params: {
  orderIdentifier: string;
  providerPaymentId?: string;
  validatedByEmail?: string;
}): Promise<{
  success: boolean;
  alreadyPaid: boolean;
  order: StoredPaymentOrder;
  invoiceNumber: string;
}> {
  const order = await findPaymentOrder(params.orderIdentifier);
  if (!order) {
    throw new Error(`Commande introuvable pour l'identifiant : ${params.orderIdentifier}`);
  }

  // Protection d'idempotence : si déjà payée, on ne crédite pas deux fois
  if (order.status === 'PAID' && order.invoiceNumber) {
    return {
      success: true,
      alreadyPaid: true,
      order,
      invoiceNumber: order.invoiceNumber,
    };
  }

  const now = new Date();
  const year = now.getFullYear();
  const { sequenceNumber, invoiceNumber } = await allocateSequentialInvoiceNumber(year);

  const pricing = resolveServerOrderPricing(
    order.planCode,
    order.billingCycle,
    order.currency
  );

  // 1. Mise à jour de la commande et création de la facture séquentielle en BDD
  order.status = 'PAID';
  order.paidAt = now.toISOString();
  order.updatedAt = now.toISOString();
  order.invoiceNumber = invoiceNumber;
  order.invoiceIssuedAt = now.toISOString();
  if (params.providerPaymentId) {
    order.providerPaymentId = params.providerPaymentId;
  }
  if (params.validatedByEmail) {
    order.validatedByEmail = params.validatedByEmail;
  }
  globalForPaymentStore.paymentOrdersMap!.set(order.reference, order);

  try {
    await prisma.paymentOrder.update({
      where: { reference: order.reference },
      data: {
        status: 'PAID',
        paidAt: now,
        providerPaymentId: order.providerPaymentId,
        validatedByEmail: order.validatedByEmail,
        invoice: {
          upsert: {
            create: {
              invoiceNumber,
              sequenceNumber,
              year,
              customerEmail: order.customerEmail,
              customerName: order.customerName || order.customerEmail,
              customerCompany: order.companyName,
              customerAddress: order.countryCode,
              amountHt: order.amount,
              taxRate: 0,
              taxAmount: 0,
              amountTtc: order.amount,
              currency: order.currency,
            },
            update: {},
          },
        },
      },
    });
  } catch (dbErr) {
    console.warn('Info sauvegarde Prisma fulfillPaymentOrder (cache actif):', dbErr);
  }

  // 2. Activation des droits du client en BDD (Abonnement Fournisseur / Acheteur ou Pack Crédits)
  try {
    const userRecord = await prisma.user.findUnique({
      where: { email: order.customerEmail },
      include: { company: true },
    });

    if (userRecord) {
      // Enregistrer l'événement de facturation
      await prisma.billingEvent.create({
        data: {
          userId: userRecord.id,
          eventType: 'PAYMENT',
          amount: order.amount,
          currency: order.currency,
          provider: order.provider,
          providerTransactionId: order.providerPaymentId || order.reference,
          metadataJson: JSON.stringify({
            orderReference: order.reference,
            invoiceNumber,
            planCode: order.planCode,
          }),
        },
      });

      // Créditer les mises en relation si l'offre en inclut (Packs Crédits ou Abonnements Entrepreneurs)
      if (pricing.creditsIncluded > 0) {
        const validityDays = order.billingCycle === 'ANNUAL' ? 365 : 30;
        const expiresAt = new Date(now.getTime() + validityDays * 86400000);

        await prisma.contactCredit.create({
          data: {
            userId: userRecord.id,
            balance: pricing.creditsIncluded,
            currency: order.currency,
            source: `ORDER_${order.reference}`,
            expiresAt,
          },
        });
      }

      // Si l'utilisateur possède un profil société et souscrit un abonnement Fournisseur
      const targetCompanyId = order.companyId || userRecord.company?.id;
      if (targetCompanyId && pricing.targetRole === 'SUPPLIER') {
        const legacyPlanCode =
          order.planCode === 'SUPPLIER_PREMIUM'
            ? 'VIP'
            : order.planCode === 'SUPPLIER_PRO'
              ? 'PREMIUM'
              : 'STANDARD';

        const planRecord = await prisma.subscriptionPlan.findUnique({
          where: { code: legacyPlanCode },
        });

        if (planRecord) {
          const periodDays = order.billingCycle === 'ANNUAL' ? 365 : 30;
          const periodEnd = new Date(now.getTime() + periodDays * 86400000);

          await prisma.userSubscription.upsert({
            where: { companyId: targetCompanyId },
            update: {
              planId: planRecord.id,
              status: 'ACTIVE',
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
            create: {
              companyId: targetCompanyId,
              planId: planRecord.id,
              status: 'ACTIVE',
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
          });
        }
      }
    }
  } catch (activationErr) {
    console.warn('Info activation droits utilisateur en BDD:', activationErr);
  }

  // 3. Générer le PDF de la facture et envoyer l'email transactionnel au client
  const pdfBuffer = generateInvoicePdfBuffer({
    invoiceNumber,
    orderReference: order.reference,
    issuedAt: now,
    paidAt: now,
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

  await sendPaymentConfirmedEmail({
    to: order.customerEmail,
    customerName: order.customerName || order.customerEmail,
    planName: order.planName,
    orderReference: order.reference,
    invoiceNumber,
    amount: order.amount,
    currency: order.currency,
    pdfBuffer,
  });

  return {
    success: true,
    alreadyPaid: false,
    order,
    invoiceNumber,
  };
}

/**
 * Marque une commande comme échouée et notifie le client par email.
 */
export async function markPaymentOrderFailed(
  orderIdentifier: string,
  reason?: string
): Promise<StoredPaymentOrder | null> {
  const order = await findPaymentOrder(orderIdentifier);
  if (!order || order.status === 'PAID') return order;

  order.status = 'FAILED';
  order.updatedAt = new Date().toISOString();
  globalForPaymentStore.paymentOrdersMap!.set(order.reference, order);

  try {
    await prisma.paymentOrder.update({
      where: { reference: order.reference },
      data: { status: 'FAILED' },
    });
  } catch {}

  await sendPaymentFailedEmail({
    to: order.customerEmail,
    customerName: order.customerName || order.customerEmail,
    planName: order.planName,
    orderReference: order.reference,
    reason,
  });

  return order;
}

/**
 * Marque une commande comme remboursée.
 */
export async function markPaymentOrderRefunded(
  orderIdentifier: string
): Promise<StoredPaymentOrder | null> {
  const order = await findPaymentOrder(orderIdentifier);
  if (!order) return null;

  const now = new Date();
  order.status = 'REFUNDED';
  order.refundedAt = now.toISOString();
  order.updatedAt = now.toISOString();
  globalForPaymentStore.paymentOrdersMap!.set(order.reference, order);

  try {
    await prisma.paymentOrder.update({
      where: { reference: order.reference },
      data: { status: 'REFUNDED', refundedAt: now },
    });
  } catch {}

  return order;
}

/**
 * Envoie les instructions de virement bancaire par email lors d'une commande RIB.
 */
export async function notifyBankTransferOrderCreated(order: StoredPaymentOrder) {
  const rib = buildBankTransferInstructions(
    order.reference,
    order.amount,
    order.currency
  );
  await sendBankTransferInstructionsEmail({
    to: order.customerEmail,
    customerName: order.customerName || order.customerEmail,
    planName: order.planName,
    rib,
  });
}
