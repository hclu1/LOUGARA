# Guide Pas-à-Pas — Système de Paiement Modulaire, Tests & Mise en Production (Lougara B2B)

Ce guide détaille l'architecture de paiement mise en place sur **Lougara (`https://lougara.com`)**, la procédure de test complète (Stripe Payment Element, Virement RIB Qonto, Mobile Money) et la checklist de mise en production.

---

## 1. Architecture des Fichiers Créés / Modifiés

| Fichier | Rôle |
| :--- | :--- |
| `prisma/schema.prisma` | Modèles `PaymentOrder` (commandes), `WebhookEvent` (idempotence) et `Invoice` (facturation séquentielle `FAC-AAAA-XXXX`). |
| `.env.example` & `src/env.ts` | Validation Zod et déclaration de toutes les variables d'environnement (Stripe, RIB, Mentions Légales, Mobile Money, Emails). |
| `src/features/payment/provider.interface.ts` | Interface commune `PaymentProvider` (`createPayment`, `verifyPayment`, `handleWebhook`, `refund`). |
| `src/features/payment/config/rib.config.ts` | Coordonnées officielles du RIB Qonto de la société **Lougara (`EI - CHAMPAGNE Christelle / Mimonga`)** et mentions légales. |
| `src/features/payment/config/payment-methods.config.ts` | Matrice déclarative **Pays → Devise → Moyens de paiement** (modifiable sans toucher au code métier). |
| `src/features/payment/providers/stripe.provider.ts` | Connecteur Stripe (`PaymentIntent` avec `automatic_payment_methods` pour le Payment Element : Cartes, Apple Pay, Google Pay, Link, SEPA). |
| `src/features/payment/providers/bank-transfer.provider.ts` | Connecteur Virement Bancaire RIB (`LOU-AAAA-XXXX`, statut `WAITING_TRANSFER`). |
| `src/features/payment/providers/cinetpay.provider.ts` | Connecteur Mobile Money CinetPay (Orange Money, MTN, Moov, Wave). |
| `src/features/payment/providers/flutterwave.provider.ts` | Connecteur Mobile Money & Cartes Afrique Flutterwave. |
| `src/features/payment/providers/paydunya.provider.ts` | Connecteur Wave & Orange Money UEMOA PayDunya. |
| `src/features/payment/services/pricing.service.ts` | Validation stricte des montants côté serveur (ne fait jamais confiance au navigateur). |
| `src/features/payment/services/invoice-pdf.service.ts` | Générateur de factures PDF 1.4 séquentielles (`FAC-2026-0001`) avec mentions légales Lougara. |
| `src/features/payment/services/email.service.ts` | Envoi d'emails transactionnels (instructions RIB, paiement reçu + facture PDF, échec). |
| `src/features/payment/services/fulfillment.service.ts` | Activation serveur exclusive des abonnements/crédits, idempotence et émission des factures. |
| `src/app/paiement/page.tsx` | Page de paiement interactive (Choix du pays, Stripe Payment Element intégré, Virement RIB en 1 clic, Mobile Money). |
| `src/app/paiement/succes/page.tsx` | Page de retour et suivi de commande en lecture seule. |
| `src/app/paiement/echec/page.tsx` | Page d'erreur ou d'abandon de paiement avec relance rapide. |
| `src/app/paiement/historique/page.tsx` | Historique client, téléchargement des factures PDF et bouton **Portail Client Stripe**. |
| `src/app/admin/paiements/page.tsx` | Back-office Admin protégé : liste des virements en attente et bouton **« Marquer comme payé »**. |

---

## 2. Où Créer les Clés Stripe & Activer les Moyens de Paiement

1. Connectez-vous sur [https://dashboard.stripe.com](https://dashboard.stripe.com).
2. En haut à droite, activez le **Mode Test** pour votre période de vérification.
3. Allez dans **Développeurs > Clés API** (`https://dashboard.stripe.com/test/apikeys`) :
   - Copiez la **Clé publique** (`pk_test_...`) dans `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
   - Copiez la **Clé secrète** (`sk_test_...`) dans `STRIPE_SECRET_KEY`.
4. Allez dans **Paramètres > Moyens de paiement** (`https://dashboard.stripe.com/test/settings/payment_methods`) :
   - Activez **Cartes**, **Apple Pay**, **Google Pay**, **Link** et **Prélèvement SEPA**.
   - Comme notre intégration utilise `automatic_payment_methods: { enabled: true }`, le **Stripe Payment Element** sur `/paiement` affichera automatiquement tous ces moyens sans aucune modification de code.
5. Allez dans **Paramètres > Facturation > Portail client** (`https://dashboard.stripe.com/test/settings/billing/portal`) :
   - Cliquez sur **Activer le lien** pour permettre aux clients d'ouvrir le portail depuis `/paiement/historique`.

---

## 3. Comment Configurer et Tester le Webhook Stripe

### En local (pendant vos tests)
1. Installez Stripe CLI puis lancez :
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
2. Copiez le secret `whsec_...` affiché dans le terminal et placez-le dans `.env.local` sous `STRIPE_WEBHOOK_SECRET`.

### En production (`https://lougara.com`)
1. Allez dans **Développeurs > Webhooks > Ajouter un endpoint**.
2. URL de l'endpoint : `https://lougara.com/api/webhooks/stripe`
3. Événements à sélectionner :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `charge.refunded`
4. Copiez le secret de signature `whsec_...` dans la variable d'environnement `STRIPE_WEBHOOK_SECRET` de votre hébergeur.

---

## 4. Comment Tester les Paiements (Période de Test)

### A. Tester le Virement Bancaire Manuel (RIB Qonto Lougara) — Fonctionne immédiatement !
1. Rendez-vous sur `/tarifs` et cliquez sur une offre (ou allez directement sur `/paiement`).
2. Renseignez votre email professionnel, choisissez **Virement Bancaire (RIB IBAN / SEPA / SWIFT)** puis cliquez sur **Générer ma référence de virement**.
3. Vérifiez que l'interface affiche :
   - **Titulaire :** `Lougara (EI - CHAMPAGNE Christelle / Mimonga)`
   - **IBAN :** `FR76 1695 8000 0112 9657 5872 333`
   - **BIC :** `QNTOFRP1XXX`
   - **Référence unique :** `LOU-2026-XXXX`
4. Connectez-vous en tant qu'Admin (`champagcrypt@gmail.com`) et ouvrez `/admin/paiements`.
5. Repérez la commande au statut `WAITING_TRANSFER` et cliquez sur **« Marquer comme payé »** :
   - Le statut passe à `PAID`.
   - L'accès du client est activé.
   - La facture séquentielle `FAC-2026-0001` est générée et téléchargeable en PDF depuis `/admin/paiements` et `/paiement/historique`.

### B. Tester par Carte Bancaire avec les Cartes de Test Stripe
Sur `/paiement`, choisissez **Carte Bancaire, Apple Pay, Google Pay, Link & SEPA** :
- **Paiement réussi immédiat :** `4242 4242 4242 4242` (Date future ex: `12/30`, CVC `123`)
- **Authentification 3D Secure (SCA) requise :** `4000 0027 6000 3184`
- **Carte refusée (Fonds insuffisants) :** `4000 0000 0000 9995`
- **Prélèvement SEPA de test :** `FR1420041010050500013M02606`

---

## 5. Comment Ajouter un Nouveau Pays ou Activer le Mobile Money

### Ajouter un pays sans modifier le code métier
Ouvrez `src/features/payment/config/payment-methods.config.ts` et ajoutez une entrée dans `COUNTRY_PAYMENT_CONFIGS` :
```ts
{
  countryCode: 'KE',
  countryNameFr: 'Kenya',
  countryNameEn: 'Kenya',
  flag: '🇰🇪',
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'EUR'],
  availableMethods: [
    PAYMENT_METHOD_CATALOG.STRIPE_AUTOMATIC,
    PAYMENT_METHOD_CATALOG.FLUTTERWAVE_AFRICA,
    PAYMENT_METHOD_CATALOG.BANK_TRANSFER_RIB,
  ],
}
```

### Activer CinetPay, Flutterwave ou PayDunya
Renseignez simplement les clés correspondantes dans votre fichier `.env` (voir `.env.example`). Les webhooks sont déjà prêts sur :
- `https://lougara.com/api/webhooks/cinetpay`
- `https://lougara.com/api/webhooks/flutterwave`
- `https://lougara.com/api/webhooks/paydunya`

---

## 6. Checklist Finale de Mise en Production

- [ ] **Variables Stripe Live :** Remplacer `pk_test_...` et `sk_test_...` par `pk_live_...` et `sk_live_...` dans l'environnement de production.
- [ ] **Webhook Stripe Live :** Créer l'endpoint `https://lougara.com/api/webhooks/stripe` en mode Production et renseigner son `STRIPE_WEBHOOK_SECRET`.
- [ ] **Mentions Légales Factures PDF :** Vérifier `LEGAL_SIRET`, `LEGAL_COMPANY_NAME` (`Lougara`) et `LEGAL_VAT_NOTICE` dans les variables d'environnement de production.
- [ ] **Emails Transactionnels :** Renseigner `RESEND_API_KEY` et vérifier le domaine d'expédition `lougara.com` pour `EMAIL_FROM="Lougara Facturation <facturation@lougara.com>"`.
- [ ] **Test de bout en bout :** Effectuer 1 commande par virement RIB + validation dans `/admin/paiements` et vérifier le téléchargement du PDF de facture séquentielle.
