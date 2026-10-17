# Spécification Technique — Système de Paiement Modulaire Multi-Prestataires Lougara

**Date :** 2026-10-17
**Application :** Lougara B2B (`https://lougara.com`)
**Statut :** Approuvé par l'utilisateur

---

## 1. Objectifs & Périmètre

Ajouter un système de paiement complet, modulaire, multi-devises et sécurisé à l'application Next.js / Prisma existante sans altérer la stack en place :
1. **Stripe Payment Element intégré** (`/paiement`) avec `automatic_payment_methods` (Cartes, Apple Pay, Google Pay, Link, Prélèvement SEPA), supportant les paiements uniques (Packs de crédits) et les abonnements (Mensuel / Annuel), ainsi que le Portail Client Stripe.
2. **Virement bancaire manuel (RIB Lougara)** avec génération de référence unique `LOU-AAAA-XXXX`, statut `WAITING_TRANSFER`, envoi d'email d'instructions et validation par un administrateur via `/admin/paiements` (« Marquer comme payé »).
3. **Architecture Mobile Money & Paiements Africains** via l'interface `PaymentProvider` (`createPayment`, `verifyPayment`, `handleWebhook`, `refund`) et connecteurs prêts à l'emploi pour **CinetPay**, **Flutterwave** et **PayDunya** (Orange Money, Wave, MTN MoMo, Moov Money), pilotés par un fichier de configuration déclaratif par pays.
4. **Activation serveur exclusive**, idempotence des webhooks (`WebhookEvent`), facturation PDF séquentielle (`FAC-AAAA-XXXX`) et emails transactionnels.

---

## 2. Coordonnées Bancaires (RIB) & Mentions Légales

Extraites du document officiel Qonto et validées avec l'utilisateur :
- **Nom commercial / Raison sociale :** `Lougara` (Titulaire bancaire : `Lougara — EI - CHAMPAGNE Christelle / Mimonga`)
- **Adresse du siège :** `30 BIS RUE du Vieil Abreuvoir, 78100 Saint-Germain-en-Laye, France`
- **IBAN :** `FR76 1695 8000 0112 9657 5872 333`
- **BIC / SWIFT :** `QNTOFRP1XXX`
- **SWIFT Banque Partenaire :** `TRWIBEB3XXX`
- **Domiciliation :** `Qonto SA, 18 rue de Navarin, 75009 Paris, France`
- **Mentions fiscales par défaut (surchargeables via `.env`) :** `TVA non applicable, art. 293 B du CGI` | SIRET configurable via `LEGAL_SIRET`.

---

## 3. Modèle de Données Prisma (`prisma/schema.prisma`)

### 3.1 Enumérations
- `PaymentOrderStatus` : `PENDING`, `WAITING_TRANSFER`, `PAID`, `FAILED`, `REFUNDED`, `CANCELLED`
- `PaymentBillingCycle` : `MONTHLY`, `ANNUAL`, `ONE_TIME`

### 3.2 Modèle `PaymentOrder`
- `id` (`String`, `@id @default(cuid())`)
- `reference` (`String`, `@unique`) — Format `LOU-AAAA-XXXX`
- `userId` (`String?`) — Lien optionnel vers `User`
- `customerEmail` (`String`)
- `customerName` (`String?`)
- `companyId` (`String?`)
- `companyName` (`String?`)
- `countryCode` (`String`, `@default("FR")`)
- `planCode` (`String`) — ex: `SUPPLIER_ESSENTIAL`, `BUYER_PRO`, `CREDIT_PACK_5`
- `planName` (`String`)
- `billingCycle` (`PaymentBillingCycle`, `@default(MONTHLY)`)
- `amount` (`Decimal`) — Montant validé côté serveur
- `currency` (`String`, `@default("EUR")`) — `EUR`, `USD`, `XOF`, `XAF`, `GNF`, `MAD`, `NGN`
- `provider` (`String`) — `STRIPE`, `BANK_TRANSFER`, `CINETPAY`, `FLUTTERWAVE`, `PAYDUNYA`
- `status` (`PaymentOrderStatus`, `@default(PENDING)`)
- `providerPaymentId` (`String?`) — ID PaymentIntent / Subscription / Transaction externe
- `providerClientSecret` (`String?`)
- `metadataJson` (`String?`)
- `paidAt` (`DateTime?`)
- `validatedByEmail` (`String?`) — Email de l'admin en cas de rapprochement bancaire manuel
- `invoice` (`Invoice?`)
- `createdAt` / `updatedAt`

### 3.3 Modèle `WebhookEvent` (Idempotence)
- `id` (`String`, `@id @default(cuid())`)
- `provider` (`String`)
- `eventId` (`String`, `@unique`)
- `eventType` (`String`)
- `status` (`String`, `@default("PROCESSED")`)
- `payload` (`String?`)
- `processedAt` (`DateTime`, `@default(now())`)

### 3.4 Modèle `Invoice` (Facturation séquentielle)
- `id` (`String`, `@id @default(cuid())`)
- `invoiceNumber` (`String`, `@unique`) — Format `FAC-AAAA-0001`
- `sequenceNumber` (`Int`)
- `year` (`Int`)
- `orderId` (`String`, `@unique`)
- `order` (`PaymentOrder`)
- `customerEmail` (`String`)
- `customerName` (`String`)
- `customerAddress` (`String?`)
- `amountHt` (`Decimal`)
- `taxRate` (`Decimal`, `@default(0)`)
- `taxAmount` (`Decimal`, `@default(0)`)
- `amountTtc` (`Decimal`)
- `currency` (`String`)
- `issuedAt` (`DateTime`, `@default(now())`)

---

## 4. Sécurité & Flux Métier

1. **Calcul serveur des montants** : Le navigateur n'envoie que `{ planCode, billingCycle, currency, countryCode, provider }`. Le serveur lit la grille officielle `LOCAL_PRICES` / BDD pour déterminer le montant exact.
2. **Idempotence stricte** : Chaque webhook entrant vérifie d'abord la signature cryptographique, puis vérifie dans `WebhookEvent` si `eventId` a déjà été traité. De plus, `fulfillOrder()` vérifie que `order.status !== 'PAID'` dans une transaction atomique avant d'activer les droits et d'émettre la facture.
3. **Zéro activation côté navigateur** : La page `/paiement/succes` interroge `/api/payments/status?reference=...` en lecture seule. Seul le webhook ou l'action Admin `/api/admin/payments/[id]/mark-paid` active l'abonnement ou les crédits.
