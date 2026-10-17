# Plan d'Implémentation - Système de Paiement Modulaire Multi-Prestataires

> **Pour l'exécutant :** Ce plan utilise la syntaxe de case à cocher (`- [ ]`) pour le suivi des étapes. Suis les tâches séquentiellement.

**Objectif :** Ajouter un système de paiement complet (Stripe Payment Element, Virement RIB Lougara avec validation Admin, et architecture Mobile Money CinetPay/Flutterwave/PayDunya par pays), avec facturation PDF séquentielle et emails transactionnels.
**Architecture :** Pattern Strategy orienté `PaymentProvider` piloté par une matrice de configuration pays/devises, adossé à Prisma (`PaymentOrder`, `WebhookEvent`, `Invoice`) et à un service central d'activation (`fulfillment.service.ts`).
**Stack Technique :** Next.js 16 (App Router), TypeScript, Prisma (PostgreSQL), Stripe SDK (`stripe` + `@stripe/stripe-js`), Vitest.
**Spécification de Référence :** `docs/specs/2026-10-17-payment-system-design.md`

## Contraintes Globales
- Aucune clé secrète en dur dans le code ; validation via variables d'environnement et `.env.example`.
- Les montants sont systématiquement résolus côté serveur depuis `LOCAL_PRICES` / Prisma.
- L'activation des droits (abonnements ou crédits) ne se produit jamais sur la route de retour navigateur.

---

### Tâche 1 : Mise à jour du schéma Prisma (`PaymentOrder`, `WebhookEvent`, `Invoice`)

**Fichiers :**
- Modifier : `prisma/schema.prisma`
- Modifier : `src/env.ts`
- Créer : `.env.example`

- [x] Confirmation utilisateur obtenue pour la modification de la base de données.
- [ ] Ajouter les modèles `PaymentOrder`, `WebhookEvent`, `Invoice` et les enums `PaymentOrderStatus`, `PaymentBillingCycle`.
- [ ] Générer le client Prisma (`npx prisma generate`) et synchroniser la base si disponible.

---

### Tâche 2 : Configuration Pays / Devises / RIB & Interface `PaymentProvider`

**Fichiers :**
- Créer : `src/features/payment/types.ts`
- Créer : `src/features/payment/provider.interface.ts`
- Créer : `src/features/payment/config/payment-methods.config.ts`
- Créer : `src/features/payment/config/rib.config.ts`

- [ ] Définir l'interface `PaymentProvider` (`createPayment`, `verifyPayment`, `handleWebhook`, `refund`).
- [ ] Configurer les coordonnées RIB officielles Lougara (`FR76 1695 8000 0112 9657 5872 333`, `QNTOFRP1XXX`, `Lougara — EI - CHAMPAGNE Christelle / Mimonga`).
- [ ] Définir la matrice `COUNTRY_PAYMENT_CONFIG` associant chaque pays (France, Belgique, Sénégal, Côte d'Ivoire, Cameroun, Gabon, Guinée, Maroc, Nigéria, RDC, International...) à sa devise et ses moyens de paiement.

---

### Tâche 3 : Connecteurs de Paiement (Stripe, Virement RIB, CinetPay, Flutterwave, PayDunya)

**Fichiers :**
- Créer : `src/features/payment/providers/stripe.provider.ts`
- Créer : `src/features/payment/providers/bank-transfer.provider.ts`
- Créer : `src/features/payment/providers/cinetpay.provider.ts`
- Créer : `src/features/payment/providers/flutterwave.provider.ts`
- Créer : `src/features/payment/providers/paydunya.provider.ts`
- Créer : `src/features/payment/providers/index.ts`

- [ ] Implémenter `StripePaymentProvider` (création de `PaymentIntent` et `Subscription` avec `automatic_payment_methods: { enabled: true }` retournant `clientSecret` pour le `PaymentElement`, vérification, webhook, remboursement, et session Portail Client).
- [ ] Implémenter `BankTransferPaymentProvider` (référence `LOU-AAAA-XXXX`, statut `WAITING_TRANSFER`, détails RIB).
- [ ] Implémenter les connecteurs documentés `CinetPayPaymentProvider`, `FlutterwavePaymentProvider`, `PayDunyaPaymentProvider`.

---

### Tâche 4 : Services Métier (Calcul Serveur, Factures PDF Séquentielles, Emails, Fulfillment)

**Fichiers :**
- Créer : `src/features/payment/services/pricing.service.ts`
- Créer : `src/features/payment/services/invoice-pdf.service.ts`
- Créer : `src/features/payment/services/email.service.ts`
- Créer : `src/features/payment/services/fulfillment.service.ts`

- [ ] Implémenter la résolution serveur des tarifs (`resolveServerOrderPricing`) et la génération de référence `LOU-AAAA-XXXX`.
- [ ] Implémenter le générateur de factures PDF valides (`generateInvoicePdfBuffer`) avec numérotation séquentielle `FAC-AAAA-XXXX` et mentions légales `Lougara`.
- [ ] Implémenter le service d'envoi d'emails transactionnels (`sendTransferInstructionsEmail`, `sendPaymentConfirmedEmail`, `sendPaymentFailedEmail`).
- [ ] Implémenter `fulfillPaymentOrder` (activation atomique de l'abonnement ou ajout de crédits de contact, création de la facture et envoi de l'email).

---

### Tâche 5 : Routes API (Paiements, Webhooks Idempotents, Factures PDF, Admin)

**Fichiers :**
- Créer : `src/app/api/payments/create/route.ts`
- Créer : `src/app/api/payments/status/route.ts`
- Créer : `src/app/api/payments/history/route.ts`
- Créer : `src/app/api/payments/invoice/[id]/route.ts`
- Modifier : `src/app/api/webhooks/stripe/route.ts`
- Créer : `src/app/api/webhooks/[provider]/route.ts`
- Modifier : `src/app/api/stripe/portal/route.ts`
- Créer : `src/app/api/admin/payments/route.ts`
- Créer : `src/app/api/admin/payments/[id]/mark-paid/route.ts`
- Créer : `src/app/api/admin/payments/[id]/refund/route.ts`

---

### Tâche 6 : Pages Client & Back-Office Admin

**Fichiers :**
- Créer : `src/app/paiement/page.tsx`
- Créer : `src/app/paiement/succes/page.tsx`
- Créer : `src/app/paiement/echec/page.tsx`
- Créer : `src/app/paiement/historique/page.tsx`
- Créer : `src/app/admin/paiements/page.tsx`
- Modifier : `src/app/tarifs/page.tsx`
- Modifier : `src/app/admin/settings/page.tsx`
- Modifier : `src/components/Navbar.tsx`

---

### Tâche 7 : Tests Automatisés, Guide de Mise en Production & Versioning

**Fichiers :**
- Créer : `src/features/payment/__tests__/payment-system.test.ts`
- Créer : `docs/GUIDE_PAIEMENTS_ET_MISE_EN_PRODUCTION.md`
- Modifier : `CHANGELOG.md`, `package.json`, `src/version.ts`
