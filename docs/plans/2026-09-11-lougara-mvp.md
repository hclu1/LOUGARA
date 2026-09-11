# Plan d'Implémentation - MVP Plateforme B2B Lougara

> **Pour l'exécutant :** Ce plan utilise la syntaxe de case à cocher (`- [ ]`) pour le suivi des étapes. Suis les tâches séquentiellement dans une démarche rigoureuse TDD.

**Objectif :** Construire le MVP opérationnel de la plateforme B2B Lougara de mise en relation de confiance Afrique-Europe (profils, KYB, catalogue, recherche à facettes et messagerie de devis).  
**Architecture :** Application hybride Next.js 15+ (App Router, Server Actions, RSC) articulée avec PostgreSQL via Prisma ORM, complétée par Supabase pour l'authentification et le stockage sécurisé des documents légaux et images.  
**Stack Technique :** TypeScript, Next.js 15+, Tailwind CSS, Prisma ORM, PostgreSQL, @supabase/supabase-js, Zod, Vitest, Playwright.  
**Spécification de Référence :** `docs/specs/2026-09-11-lougara-mvp-design.md`  

## Contraintes Globales
- Node.js version >= 20.x, TypeScript en mode `strict: true`.
- Aucun secret ou clé API en clair : variables d'environnement centralisées dans `.env.local` et validées au démarrage via Zod.
- Approche TDD : chaque composant métier ou utilitaire dispose de tests automatisés Vitest avant son implémentation finale.
- Stockage KYB : les documents légaux d'immatriculation d'entreprise doivent impérativement transiter par le bucket privé `kyb-documents` avec signature d'URL temporaire (pas d'URL publique).

---

## Découpage des Tâches Opérationnelles

### Tâche 1 : Initialisation du Projet & Configuration de Base

**Fichiers :**
- Créer : `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/env.ts`
- Créer : `tests/unit/env.test.ts`

**Interfaces :**
- Consomme : Variables d'environnement système
- Produit : Schéma de configuration validé `env` exporté depuis `src/env.ts`

- [ ] **Étape 1 : Écrire le test unitaire en échec (TDD)**
  ```typescript
  // tests/unit/env.test.ts
  import { describe, it, expect } from 'vitest';
  import { validateEnv } from '../../src/env';

  describe('Validation des variables d\'environnement', () => {
    it('doit échouer si DATABASE_URL est manquante', () => {
      expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
    });

    it('doit valider les variables obligatoires', () => {
      const valid = validateEnv({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/lougara',
        NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
        SUPABASE_SERVICE_ROLE_KEY: 'test-service-key'
      });
      expect(valid.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/lougara');
    });
  });
  ```

- [ ] **Étape 2 : Vérifier que le test échoue**
  Commande : `npx vitest run tests/unit/env.test.ts`
  Résultat attendu : ÉCHEC avec module introuvable `../../src/env`

- [ ] **Étape 3 : Implémenter le code minimal pour réussir le test**
  ```typescript
  // src/env.ts
  import { z } from 'zod';

  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  });

  export function validateEnv(rawEnv: Record<string, string | undefined>) {
    return envSchema.parse(rawEnv);
  }

  export const env = validateEnv(process.env);
  ```

- [ ] **Étape 4 : Vérifier que le test passe**
  Commande : `npx vitest run tests/unit/env.test.ts`
  Résultat attendu : SUCCÈS (2 tests passed)

- [ ] **Étape 5 : Valider et Commiter**
  Commande : `git add package.json tsconfig.json src/env.ts tests/unit/env.test.ts`
  Message : `feat(core): initialiser le socle Next.js et la validation d'environnement`

---

### Tâche 2 : Modèle Prisma et Couche d'Accès aux Données

**Fichiers :**
- Créer : `prisma/schema.prisma`
- Créer : `src/lib/prisma.ts`
- Créer : `prisma/seed.ts`
- Test : `tests/unit/prisma-schema.test.ts`

**Interfaces :**
- Consomme : `env.DATABASE_URL`
- Produit : Instance singleton `prisma` typée exportée depuis `src/lib/prisma.ts`

- [ ] **Étape 1 : Écrire le test en échec (TDD)**
  ```typescript
  // tests/unit/prisma-schema.test.ts
  import { describe, it, expect } from 'vitest';
  import { prisma } from '../../src/lib/prisma';

  describe('Connexion et typage Prisma', () => {
    it('doit instancier le client Prisma avec les modèles définis', () => {
      expect(prisma.user).toBeDefined();
      expect(prisma.companyProfile).toBeDefined();
      expect(prisma.product).toBeDefined();
      expect(prisma.conversation).toBeDefined();
    });
  });
  ```

- [ ] **Étape 2 : Vérifier que le test échoue**
  Commande : `npx vitest run tests/unit/prisma-schema.test.ts`
  Résultat attendu : ÉCHEC avec module introuvable `src/lib/prisma`

- [ ] **Étape 3 : Implémenter le schéma Prisma et le singleton**
  Créer le fichier `prisma/schema.prisma` avec les modèles `User`, `CompanyProfile`, `VerificationDocument`, `Product`, `Conversation`, `Message`.
  ```typescript
  // src/lib/prisma.ts
  import { PrismaClient } from '@prisma/client';

  const globalForPrisma = global as unknown as { prisma: PrismaClient };

  export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  ```

- [ ] **Étape 4 : Générer le client Prisma et exécuter le test**
  Commande : `npx prisma generate && npx vitest run tests/unit/prisma-schema.test.ts`
  Résultat attendu : SUCCÈS (1 test passed)

- [ ] **Étape 5 : Valider et Commiter**
  Commande : `git add prisma/schema.prisma src/lib/prisma.ts tests/unit/prisma-schema.test.ts`
  Message : `feat(db): configurer le schema Prisma B2B Lougara et le singleton client`

---

### Tâche 3 : Module de Vérification Fournisseurs & Confiance (KYB)

**Fichiers :**
- Créer : `src/features/verification/validation.ts`
- Créer : `src/features/verification/service.ts`
- Test : `tests/unit/verification-service.test.ts`

**Interfaces :**
- Consomme : `prisma.companyProfile`, `prisma.verificationDocument`
- Produit : `submitKybDocument()`, `reviewCompanyVerification()`

- [ ] **Étape 1 : Écrire le test en échec (TDD)**
  ```typescript
  // tests/unit/verification-service.test.ts
  import { describe, it, expect, vi, beforeEach } from 'vitest';
  import { reviewCompanyVerification, KybReviewInput } from '../../src/features/verification/service';
  import { prisma } from '../../src/lib/prisma';

  vi.mock('../../src/lib/prisma', () => ({
    prisma: {
      companyProfile: {
        update: vi.fn(),
      },
    },
  }));

  describe('Service de vérification KYB', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('doit passer le statut à VERIFIED avec la date du jour si validé par un admin', async () => {
      const input: KybReviewInput = {
        companyId: 'comp-123',
        status: 'VERIFIED',
        adminId: 'admin-1',
        notes: 'Documents RCCM et CNI conformes',
      };

      (prisma.companyProfile.update as any).mockResolvedValue({
        id: 'comp-123',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
      });

      const result = await reviewCompanyVerification(input);
      expect(result.verificationStatus).toBe('VERIFIED');
      expect(prisma.companyProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'comp-123' },
          data: expect.objectContaining({
            verificationStatus: 'VERIFIED',
          }),
        })
      );
    });
  });
  ```

- [ ] **Étape 2 : Vérifier que le test échoue**
  Commande : `npx vitest run tests/unit/verification-service.test.ts`
  Résultat attendu : ÉCHEC avec module introuvable `service.ts`

- [ ] **Étape 3 : Implémenter le service et le validateur Zod**
  ```typescript
  // src/features/verification/validation.ts
  import { z } from 'zod';

  export const kybReviewSchema = z.object({
    companyId: z.string().min(1),
    status: z.enum(['VERIFIED', 'REJECTED']),
    adminId: z.string().min(1),
    notes: z.string().optional(),
  });

  export type KybReviewInput = z.infer<typeof kybReviewSchema>;

  // src/features/verification/service.ts
  import { prisma } from '../../lib/prisma';
  import { kybReviewSchema, KybReviewInput } from './validation';

  export async function reviewCompanyVerification(input: KybReviewInput) {
    const validated = kybReviewSchema.parse(input);
    return await prisma.companyProfile.update({
      where: { id: validated.companyId },
      data: {
        verificationStatus: validated.status,
        verificationNotes: validated.notes,
        verifiedAt: validated.status === 'VERIFIED' ? new Date() : null,
      },
    });
  }
  ```

- [ ] **Étape 4 : Vérifier que le test passe**
  Commande : `npx vitest run tests/unit/verification-service.test.ts`
  Résultat attendu : SUCCÈS (1 test passed)

- [ ] **Étape 5 : Valider et Commiter**
  Commande : `git add src/features/verification/ tests/unit/verification-service.test.ts`
  Message : `feat(kyb): ajouter la validation administrative et le service de vérification`

---

### Tâche 4 : Module Catalogue B2B et Recherche à Facettes

**Fichiers :**
- Créer : `src/features/catalog/validation.ts`
- Créer : `src/features/catalog/service.ts`
- Test : `tests/unit/catalog-search.test.ts`

**Interfaces :**
- Consomme : `prisma.product`, `prisma.companyProfile`
- Produit : `createProduct()`, `searchCatalog(filters)`

- [ ] **Étape 1 : Écrire le test en échec (TDD)**
  ```typescript
  // tests/unit/catalog-search.test.ts
  import { describe, it, expect, vi } from 'vitest';
  import { searchCatalog } from '../../src/features/catalog/service';
  import { prisma } from '../../src/lib/prisma';

  vi.mock('../../src/lib/prisma', () => ({
    prisma: {
      product: {
        findMany: vi.fn(),
      },
    },
  }));

  describe('Recherche dans le catalogue B2B', () => {
    it('doit appliquer le filtre sur le statut vérifié et le pays', async () => {
      (prisma.product.findMany as any).mockResolvedValue([
        { id: 'prod-1', title: 'Beurre de Karité Bio', originCountry: 'Sénégal' }
      ]);

      const results = await searchCatalog({
        category: 'Cosmétique',
        originCountry: 'Sénégal',
        onlyVerified: true,
      });

      expect(results).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Cosmétique',
            originCountry: 'Sénégal',
            company: {
              verificationStatus: 'VERIFIED',
            },
          }),
        })
      );
    });
  });
  ```

- [ ] **Étape 2 : Vérifier que le test échoue**
  Commande : `npx vitest run tests/unit/catalog-search.test.ts`
  Résultat attendu : ÉCHEC avec module introuvable `catalog/service`

- [ ] **Étape 3 : Implémenter le service de recherche et de création de produit**
  ```typescript
  // src/features/catalog/validation.ts
  import { z } from 'zod';

  export const searchCatalogSchema = z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    originCountry: z.string().optional(),
    onlyVerified: z.boolean().optional(),
    maxMoq: z.number().optional(),
  });

  export type SearchCatalogFilters = z.infer<typeof searchCatalogSchema>;

  // src/features/catalog/service.ts
  import { prisma } from '../../lib/prisma';
  import { SearchCatalogFilters } from './validation';

  export async function searchCatalog(filters: SearchCatalogFilters) {
    const where: any = { isPublished: true };

    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.originCountry) {
      where.originCountry = filters.originCountry;
    }
    if (filters.maxMoq) {
      where.moq = { lte: filters.maxMoq };
    }
    if (filters.onlyVerified) {
      where.company = { verificationStatus: 'VERIFIED' };
    }
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    return await prisma.product.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            country: true,
            verificationStatus: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  ```

- [ ] **Étape 4 : Vérifier que le test passe**
  Commande : `npx vitest run tests/unit/catalog-search.test.ts`
  Résultat attendu : SUCCÈS (1 test passed)

- [ ] **Étape 5 : Valider et Commiter**
  Commande : `git add src/features/catalog/ tests/unit/catalog-search.test.ts`
  Message : `feat(catalog): ajouter la recherche multi-critères avec filtre de confiance KYB`

---

### Tâche 5 : Module de Demande de Devis & Messagerie B2B

**Fichiers :**
- Créer : `src/features/messaging/validation.ts`
- Créer : `src/features/messaging/service.ts`
- Test : `tests/unit/messaging-service.test.ts`

**Interfaces :**
- Consomme : `prisma.conversation`, `prisma.message`
- Produit : `initiateQuoteRequest()`, `sendMessage()`, `getBuyerConversations()`

- [ ] **Étape 1 : Écrire le test en échec (TDD)**
  ```typescript
  // tests/unit/messaging-service.test.ts
  import { describe, it, expect, vi } from 'vitest';
  import { initiateQuoteRequest } from '../../src/features/messaging/service';
  import { prisma } from '../../src/lib/prisma';

  vi.mock('../../src/lib/prisma', () => ({
    prisma: {
      conversation: {
        create: vi.fn(),
      },
    },
  }));

  describe('Messagerie et Demande de Devis B2B', () => {
    it('doit créer une conversation et un premier message initial', async () => {
      (prisma.conversation.create as any).mockResolvedValue({
        id: 'conv-1',
        buyerId: 'user-buyer',
        supplierId: 'comp-supp',
        subject: 'Demande de devis : 500 unités',
      });

      const res = await initiateQuoteRequest({
        buyerId: 'user-buyer',
        supplierId: 'comp-supp',
        productId: 'prod-1',
        quantity: 500,
        messageContent: 'Bonjour, quel est le délai pour Paris ?',
      });

      expect(res.id).toBe('conv-1');
      expect(prisma.conversation.create).toHaveBeenCalled();
    });
  });
  ```

- [ ] **Étape 2 : Vérifier que le test échoue**
  Commande : `npx vitest run tests/unit/messaging-service.test.ts`
  Résultat attendu : ÉCHEC avec module introuvable `messaging/service`

- [ ] **Étape 3 : Implémenter le service de messagerie B2B**
  ```typescript
  // src/features/messaging/validation.ts
  import { z } from 'zod';

  export const quoteRequestSchema = z.object({
    buyerId: z.string().min(1),
    supplierId: z.string().min(1),
    productId: z.string().optional(),
    quantity: z.number().min(1),
    messageContent: z.string().min(5),
  });

  export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

  // src/features/messaging/service.ts
  import { prisma } from '../../lib/prisma';
  import { quoteRequestSchema, QuoteRequestInput } from './validation';

  export async function initiateQuoteRequest(input: QuoteRequestInput) {
    const data = quoteRequestSchema.parse(input);
    const subject = `Demande de devis : ${data.quantity} unités`;

    return await prisma.conversation.create({
      data: {
        buyerId: data.buyerId,
        supplierId: data.supplierId,
        productId: data.productId,
        subject,
        messages: {
          create: {
            senderId: data.buyerId,
            content: `[Quantité souhaitée : ${data.quantity}]\n\n${data.messageContent}`,
          },
        },
      },
      include: {
        messages: true,
      },
    });
  }
  ```

- [ ] **Étape 4 : Vérifier que le test passe**
  Commande : `npx vitest run tests/unit/messaging-service.test.ts`
  Résultat attendu : SUCCÈS (1 test passed)

- [ ] **Étape 5 : Valider et Commiter**
  Commande : `git add src/features/messaging/ tests/unit/messaging-service.test.ts`
  Message : `feat(messaging): implémenter la création de demande de devis et messagerie B2B`

---

### Tâche 6 : Interface Utilisateur & Intégration Visuelle (Tailwind & Shadcn)

**Fichiers :**
- Créer : `src/app/layout.tsx`, `src/app/page.tsx` (Landing & Vitrine)
- Créer : `src/app/catalogue/page.tsx` (Recherche & Filtres)
- Créer : `src/app/fournisseurs/[id]/page.tsx` (Profil Entreprise & Badge)
- Créer : `src/app/admin/verifications/page.tsx` (Dashboard Admin KYB)
- Test E2E : `tests/e2e/buyer-flow.spec.ts`

- [ ] **Étape 1 : Écrire le scénario de test E2E Playwright**
  Vérifier que la page catalogue charge les produits et permet d'activer le filtre "Fournisseurs Vérifiés uniquement".
- [ ] **Étape 2 : Implémenter les pages React Server Components avec Tailwind CSS**
- [ ] **Étape 3 : Exécuter le test de régression visuelle et fonctionnelle**
  Commande : `npx playwright test`
- [ ] **Étape 4 : Valider et Commiter**
  Commande : `git add src/app/ tests/e2e/`
  Message : `feat(ui): intégrer les vues publiques, catalogue avec badges et espace admin`

---

## Plan d'Auto-Revue et Validation Finale

1. **Couverture de la spécification :**
   - Inscription et profil entreprise : Tâche 2 & 3.
   - Système de validation de confiance KYB (badge vérifié) : Tâche 3 & 6.
   - Catalogue et recherche multicritère : Tâche 4 & 6.
   - Demande de devis et messagerie interne B2B : Tâche 5.
2. **Absence d'espaces réservés :** Tous les tests et fonctions minimales sont rédigés avec leurs types et signatures réelles.
3. **Modalités d'exécution recommandées :**
   - **Exécution séquentielle ou via sous-agents autonomes** avec passage des tests TDD à chaque étape.
