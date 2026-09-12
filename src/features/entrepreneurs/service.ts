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

// Mémoire tampon locale de sécurité si la base de données distante est inaccessible en dev
const memoryEntrepreneurs: StoredEntrepreneur[] = [
  {
    id: 'ent-1',
    fullName: 'Élodie Laurent',
    companyName: 'Boutique Botanica Paris',
    email: 'elodie@botanica-paris.fr',
    phone: '+33 6 12 34 56 78',
    country: 'France',
    city: 'Paris',
    buyerType: 'Boutique physique & Concept store',
    targetSectors: ['Cosmétique & Soins', 'Artisanat & Décoration'],
    estimatedBudget: '1 000 € à 5 000 € / mois',
    sourcingNeeds: 'Recherche de savons noirs traditionnels et beurre de karité brut certifié.',
    registrationNumber: '891 234 567 R.C.S. Paris',
    kbisFile: 'Extrait_Kbis_Botanica_Paris.pdf',
    kbisFileSize: '1.10 Mo',
    isKbisVerified: true,
    subscriptionPlan: 'PREMIUM',
    hasCatalogAdSpace: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'ent-2',
    fullName: 'Marc Van Der Beek',
    companyName: 'Brussels Bio Imports',
    email: 'm.vanderbeek@brussels-imports.be',
    phone: '+32 470 12 34 56',
    country: 'Belgique',
    city: 'Bruxelles',
    buyerType: 'Importateur & Distributeur',
    targetSectors: ['Agroalimentaire & Épices'],
    estimatedBudget: '5 000 € à 20 000 € / mois',
    sourcingNeeds: 'Approvisionnement régulier en fèves de cacao Criollo et vanille de Madagascar.',
    registrationNumber: 'BE 0849.123.456',
    kbisFile: 'BCE_Extrait_Officiel_Bruxelles.pdf',
    kbisFileSize: '950 Ko',
    isKbisVerified: true,
    subscriptionPlan: 'VIP',
    hasCatalogAdSpace: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ent-3',
    fullName: 'Fatou Bamba',
    companyName: 'Wax & Chic Abidjan',
    email: 'contact@waxandchic.ci',
    phone: '+225 07 88 99 00 11',
    country: 'Côte d\'Ivoire',
    city: 'Abidjan',
    buyerType: 'E-commerce & Vente en ligne',
    targetSectors: ['Textile, Coton & Wax'],
    estimatedBudget: '1 000 € à 5 000 € / mois',
    sourcingNeeds: 'Tissus wax hollandais et bogolan traditionnel pour collection de prêt-à-porter.',
    registrationNumber: 'CI-ABJ-2022-B-11409',
    kbisFile: 'RCCM_Wax_Chic_Abidjan.pdf',
    kbisFileSize: '1.45 Mo',
    isKbisVerified: true,
    subscriptionPlan: 'STANDARD',
    hasCatalogAdSpace: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const memorySourcingRequests: StoredSourcingRequest[] = [
  {
    id: 'req-1',
    entrepreneurName: 'Élodie Laurent',
    entrepreneurEmail: 'elodie@botanica-paris.fr',
    companyName: 'Boutique Botanica Paris',
    sector: 'Cosmétique & Soins',
    title: 'Besoin urgent de 25 fûts de Beurre de Karité Bio brut',
    description: 'Pour notre chaîne de boutiques en Île-de-France, nous cherchons un producteur certifié au Sénégal ou Burkina capable de livrer au Havre ou à Gennevilliers.',
    targetQuantity: '25 fûts de 25 kg (625 kg)',
    targetBudget: '2 500 € - 3 500 €',
    destinationCountry: 'France (Le Havre)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'req-2',
    entrepreneurName: 'Marc Van Der Beek',
    entrepreneurEmail: 'm.vanderbeek@brussels-imports.be',
    companyName: 'Brussels Bio Imports',
    sector: 'Agroalimentaire & Épices',
    title: 'Sourcing 2 tonnes de Vanille Bourbon de Madagascar Gourmet',
    description: 'Recherche coopérative de producteurs malgaches avec certificats phytosanitaires en règle pour importation annuelle.',
    targetQuantity: '2 000 kg',
    targetBudget: 'Budget à négocier selon grade',
    destinationCountry: 'Belgique (Anvers)',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

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
    registrationNumber: validated.registrationNumber,
    kbisFile: validated.kbisFile,
    kbisFileSize: validated.kbisFileSize,
    isKbisVerified,
    subscriptionPlan: validated.subscriptionPlan,
    hasCatalogAdSpace: validated.hasCatalogAdSpace,
    createdAt: new Date().toISOString(),
  };

  memoryEntrepreneurs.unshift(newEntrepreneur);

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
          },
        },
      },
    });
  } catch (err: any) {
    // Si la base distante n'est pas joignable en local, la mémoire cache locale prend le relais sans planter
    console.warn('Persistance Prisma non disponible en environnement local, sauvegarde cache active :', err.message);
  }

  return newEntrepreneur;
}

/**
 * Récupération de la liste des entrepreneurs enregistrés
 */
export async function getRegisteredEntrepreneurs(): Promise<StoredEntrepreneur[]> {
  try {
    const dbBuyers = await prisma.user.findMany({
      where: { role: UserRole.BUYER },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (dbBuyers && dbBuyers.length > 0) {
      const mapped: StoredEntrepreneur[] = dbBuyers.map((b) => ({
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
        subscriptionPlan: 'STANDARD',
        hasCatalogAdSpace: false,
        createdAt: b.createdAt.toISOString(),
      }));

      // Fusionner avec la mémoire cache sans doublons d'email
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

  // Création d'une conversation dans Prisma si disponible
  try {
    // Recherche ou création du buyer
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

    // Créer la conversation si le fournisseur existe en base
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
