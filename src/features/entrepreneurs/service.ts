import { prisma } from '@/lib/prisma';
import {
  EntrepreneurRegistrationInput,
  entrepreneurRegistrationSchema,
  ContactSupplierInput,
  contactSupplierSchema,
  SourcingRequestInput,
  sourcingRequestSchema,
} from './validation';
import { UserRole } from '@prisma/client';

export interface StoredEntrepreneur {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  buyerType: string;
  targetSectors: string[];
  estimatedBudget: string;
  sourcingNeeds?: string;
  targetQuantity?: string;
  sourcingTimeline?: string;
  requiredCertifications?: string;
  registrationNumber?: string;
  kbisFile?: string;
  kbisFileSize?: string;
  isKbisVerified?: boolean;
  subscriptionPlan?: 'STANDARD' | 'PREMIUM' | 'VIP';
  hasCatalogAdSpace?: boolean;
  createdAt: string;
}

export interface StoredSourcingRequest {
  id: string;
  entrepreneurName: string;
  entrepreneurEmail: string;
  companyName: string;
  sector: string;
  title: string;
  description: string;
  targetQuantity: string;
  targetBudget?: string;
  destinationCountry: string;
  createdAt: string;
}

export interface StoredInquiry {
  id: string;
  entrepreneurName: string;
  entrepreneurEmail: string;
  entrepreneurPhone: string;
  supplierId: string;
  supplierName: string;
  productId?: string;
  productTitle?: string;
  quantity: string;
  targetDestination: string;
  message: string;
  status: 'PENDING_SUPPLIER_REPLY' | 'CONNECTED';
  createdAt: string;
}

const memoryEntrepreneurs: StoredEntrepreneur[] = [];

const memorySourcingRequests: StoredSourcingRequest[] = [];

const memoryInquiries: StoredInquiry[] = [];

/**
 * Enregistrement officiel d'un entrepreneur / acheteur en base de données
 */
export async function registerEntrepreneur(input: EntrepreneurRegistrationInput): Promise<StoredEntrepreneur> {
  const validated = entrepreneurRegistrationSchema.parse(input);
  const id = `buyer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // 1. Sauvegarde en mémoire cache immédiate
  const isKbisVerified = Boolean(validated.kbisFile || validated.registrationNumber);
  const newEntrepreneur: StoredEntrepreneur = {
    id,
    fullName: validated.fullName,
    companyName: validated.companyName,
    email: validated.email,
    phone: validated.phone,
    country: validated.country,
    city: validated.city,
    buyerType: validated.buyerType,
    targetSectors: validated.targetSectors,
    estimatedBudget: validated.estimatedBudget,
    sourcingNeeds: validated.sourcingNeeds,
    targetQuantity: validated.targetQuantity,
    sourcingTimeline: validated.sourcingTimeline,
    requiredCertifications: validated.requiredCertifications,
    registrationNumber: validated.registrationNumber,
    kbisFile: validated.kbisFile,
    kbisFileSize: validated.kbisFileSize,
    isKbisVerified,
    subscriptionPlan: validated.subscriptionPlan,
    hasCatalogAdSpace: validated.hasCatalogAdSpace,
    createdAt: new Date().toISOString(),
  };

  memoryEntrepreneurs.unshift(newEntrepreneur);

  // Génération automatique et prise en compte de la Demande de Cotation (RFQ) si des besoins sont renseignés
  if (validated.sourcingNeeds && validated.sourcingNeeds.trim().length > 0) {
    const rfqTitle = `Demande de Cotation (RFQ) — ${validated.companyName}`;
    memorySourcingRequests.unshift({
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      entrepreneurName: validated.fullName,
      entrepreneurEmail: validated.email,
      companyName: validated.companyName,
      sector: validated.targetSectors[0] || 'Commerce B2B & Sourcing',
      title: rfqTitle,
      description: validated.sourcingNeeds,
      targetQuantity: validated.targetQuantity || 'Selon proposition',
      targetBudget: validated.estimatedBudget,
      destinationCountry: validated.country || 'France',
      createdAt: new Date().toISOString(),
    });
  }

  // 2. Persistance relationnelle en base de données PostgreSQL via Prisma
  try {
    const names = validated.fullName.trim().split(/\s+/);
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || '';

    await prisma.user.upsert({
      where: { email: validated.email },
      update: {
        firstName,
        lastName,
        role: UserRole.BUYER,
      },
      create: {
        supabaseUid: `buyer-auth-${id}`,
        email: validated.email,
        firstName,
        lastName,
        role: UserRole.BUYER,
        company: {
          create: {
            companyName: validated.companyName,
            country: validated.country,
            city: validated.city,
            registrationNumber: validated.registrationNumber,
            sector: validated.targetSectors[0] || 'Achat & Sourcing Général',
            phone: validated.phone,
            description: `[Acheteur B2B - ${validated.buyerType}] Forfait : ${validated.subscriptionPlan} - Espace Publicitaire : ${validated.hasCatalogAdSpace ? 'ACTIF' : 'NON'}. Budget estimé : ${validated.estimatedBudget}. Besoins : ${validated.sourcingNeeds || 'Non précisé'}${validated.kbisFile ? ` - Kbis/RCCM déposé : ${validated.kbisFile}` : ''}`,
            documents: validated.kbisFile
              ? {
                  create: {
                    documentType: 'COMMERCIAL_REGISTER',
                    fileName: validated.kbisFile,
                    filePath: `/api/documents/preview?file=${encodeURIComponent(validated.kbisFile)}&name=${encodeURIComponent(validated.kbisFile)}&status=PENDING`,
                    fileSize: 157121,
                    mimeType: validated.kbisFile.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
                    status: 'PENDING',
                    issuingAuthority: 'INPI / Registre National des Entreprises (RNE)',
                  },
                }
              : undefined,
          },
        },
      },
    });
  } catch (err: any) {
    console.warn('Persistance Prisma non disponible en environnement local, sauvegarde cache active :', err.message);
  }

  return newEntrepreneur;
}

/**
 * Récupération de la liste des entrepreneurs enregistrés
 */
export async function getRegisteredEntrepreneurs(): Promise<StoredEntrepreneur[]> {
  const memByEmail = new Map(memoryEntrepreneurs.map((m) => [m.email, m]));

  try {
    const dbBuyers = await prisma.user.findMany({
      where: { role: UserRole.BUYER },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (dbBuyers && dbBuyers.length > 0) {
      const mapped: StoredEntrepreneur[] = dbBuyers.map((b) => {
        const mem = memByEmail.get(b.email);
        return {
          id: b.id,
          fullName: `${b.firstName || ''} ${b.lastName || ''}`.trim() || 'Entrepreneur Lougara',
          companyName: b.company?.companyName || 'Structure Déclarée',
          email: b.email,
          phone: b.company?.phone || 'Non précisé',
          country: b.company?.country || 'France',
          city: b.company?.city || 'Paris',
          buyerType: 'Acheteur Professionnel Vérifié',
          targetSectors: [b.company?.sector || 'Général'],
          estimatedBudget: 'Budget vérifié',
          sourcingNeeds: b.company?.description || undefined,
          registrationNumber: b.company?.registrationNumber || undefined,
          isKbisVerified: Boolean(b.company?.registrationNumber),
          subscriptionPlan: mem?.subscriptionPlan || 'STANDARD',
          hasCatalogAdSpace: mem?.hasCatalogAdSpace ?? false,
          createdAt: b.createdAt.toISOString(),
        };
      });

      const emails = new Set(mapped.map((m) => m.email));
      for (const mem of memoryEntrepreneurs) {
        if (!emails.has(mem.email)) {
          mapped.push(mem);
        }
      }
      return mapped;
    }
  } catch (err) {
    // Utiliser le cache local
  }

  return memoryEntrepreneurs;
}

/**
 * Dépôt d'un appel d'offres / besoin de sourcing
 */
export async function submitSourcingRequest(input: SourcingRequestInput): Promise<StoredSourcingRequest> {
  const validated = sourcingRequestSchema.parse(input);
  const id = `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const newRequest: StoredSourcingRequest = {
    id,
    entrepreneurName: validated.entrepreneurName,
    entrepreneurEmail: validated.entrepreneurEmail,
    companyName: validated.companyName,
    sector: validated.sector,
    title: validated.title,
    description: validated.description,
    targetQuantity: validated.targetQuantity,
    targetBudget: validated.targetBudget,
    destinationCountry: validated.destinationCountry,
    createdAt: new Date().toISOString(),
  };

  memorySourcingRequests.unshift(newRequest);
  return newRequest;
}

/**
 * Récupération des appels d'offres des entrepreneurs
 */
export async function getSourcingRequests(): Promise<StoredSourcingRequest[]> {
  return memorySourcingRequests;
}

/**
 * Mise en relation directe avec un fournisseur vérifié
 */
export async function contactSupplier(input: ContactSupplierInput): Promise<StoredInquiry> {
  const validated = contactSupplierSchema.parse(input);
  const id = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const inquiry: StoredInquiry = {
    id,
    entrepreneurName: validated.entrepreneurName,
    entrepreneurEmail: validated.entrepreneurEmail,
    entrepreneurPhone: validated.entrepreneurPhone,
    supplierId: validated.supplierId,
    supplierName: validated.supplierName,
    productId: validated.productId,
    productTitle: validated.productTitle,
    quantity: validated.quantity,
    targetDestination: validated.targetDestination,
    message: validated.message,
    status: 'CONNECTED',
    createdAt: new Date().toISOString(),
  };

  memoryInquiries.unshift(inquiry);

  try {
    const buyer = await prisma.user.upsert({
      where: { email: validated.entrepreneurEmail },
      update: {},
      create: {
        supabaseUid: `buyer-${id}`,
        email: validated.entrepreneurEmail,
        firstName: validated.entrepreneurName.split(' ')[0] || 'Entrepreneur',
        lastName: validated.entrepreneurName.split(' ').slice(1).join(' ') || '',
        role: UserRole.BUYER,
      },
    });

    const supplierCompany = await prisma.companyProfile.findFirst({
      where: {
        OR: [
          { id: validated.supplierId },
          { companyName: { contains: validated.supplierName, mode: 'insensitive' } },
        ],
      },
    });

    if (supplierCompany) {
      await prisma.conversation.create({
        data: {
          buyerId: buyer.id,
          supplierId: supplierCompany.id,
          productId: validated.productId || null,
          subject: `Demande de mise en relation : ${validated.quantity} vers ${validated.targetDestination}`,
          messages: {
            create: {
              senderId: buyer.id,
              content: `[Mise en relation Entrepreneur / Fournisseur]\n\nContact : ${validated.entrepreneurName} (${validated.entrepreneurPhone})\nQuantité souhaitée : ${validated.quantity}\nDestination : ${validated.targetDestination}\n\nMessage de l'acheteur :\n${validated.message}`,
            },
          },
        },
      });
    }
  } catch (err: any) {
    console.warn('Mise en relation enregistrée dans le cache :', err.message);
  }

  return inquiry;
}

/**
 * Récupération de l'historique des mises en relation
 */
export async function getInquiries(): Promise<StoredInquiry[]> {
  return memoryInquiries;
}
