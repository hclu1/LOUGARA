# Procédure de Finalisation de l'Installation & d'Activation de Stripe — Lougara B2B

> **Statut de l'application :** L'infrastructure d'abonnements, les schémas de base de données, la gestion des quotas, la page des tarifs, le webhook sécurisé et l'interface Super Admin sont **entièrement prêts dans l'application Lougara**.
>
> Pour activer les paiements réels dès que vous serez inscrit sur Stripe, suivez simplement les 5 étapes ci-dessous.

---

## Sommaire
1. [Création du compte Stripe & Récupération des clés API](#1-création-du-compte-stripe--récupération-des-clés-api)
2. [Création des produits et tarifs dans le Dashboard Stripe](#2-création-des-produits-et-tarifs-dans-le-dashboard-stripe)
3. [Configuration du Webhook Stripe](#3-configuration-du-webhook-stripe)
4. [Ajout des variables d'environnement](#4-ajout-des-variables-denvironnement)
5. [Activation dans l'interface Super Admin Lougara](#5-activation-dans-linterface-super-admin-lougara)

---

## 1. Création du compte Stripe & Récupération des clés API

1. Rendez-vous sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register) et créez votre compte professionnel.
2. Une fois connecté, vous pouvez démarrer en **Mode Test** (utilisez l'interrupteur "Mode Test" en haut à droite du tableau de bord Stripe).
3. Accédez à la section **Développeurs > Clés API** ([https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)).
4. Copiez les deux clés suivantes :
   * **Clé publique** : commence par `pk_test_...` (ou `pk_live_...` en production).
   * **Clé secrète** : cliquez sur "Révéler la clé secrète", elle commence par `sk_test_...` (ou `sk_live_...`).

---

## 2. Création des produits et tarifs dans le Dashboard Stripe

Rendez-vous dans la section **Catalogue de produits** de Stripe ([https://dashboard.stripe.com/products](https://dashboard.stripe.com/products)) :

### A. Créer le produit "Formule Standard"
* **Nom du produit :** Formule Standard Lougara
* **Tarif :** `99` EUR
* **Facturation :** Récurrente / Mensuelle
* **Enregistrer** et noter l'identifiant du tarif généré (forme `price_1P...`).

### B. Créer le produit "Formule Premium"
* **Nom du produit :** Formule Premium Lougara
* **Tarif :** `149` EUR
* **Facturation :** Récurrente / Mensuelle
* **Enregistrer** et noter l'identifiant du tarif généré (forme `price_1P...`).

### C. Créer le produit "VIP Enterprise"
* **Nom du produit :** VIP Enterprise Lougara
* **Tarif :** `250` EUR
* **Facturation :** Récurrente / Mensuelle
* **Enregistrer** et noter l'identifiant du tarif généré (forme `price_1P...`).

---

## 3. Configuration du Webhook Stripe

Le Webhook permet à Stripe de notifier automatiquement Lougara lorsqu'un paiement réussit ou qu'un abonnement est renouvelé ou résilié.

1. Allez dans **Développeurs > Webhooks** ([https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)).
2. Cliquez sur **Ajouter un point de terminaison (Endpoint)**.
3. Renseignez l'URL de votre serveur (ex: `https://votre-domaine-lougara.com/api/webhooks/stripe`).
   *(Pour les tests locaux, utilisez Stripe CLI : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)*.
4. Sélectionnez les événements à écouter :
   * `checkout.session.completed`
   * `invoice.payment_succeeded`
   * `invoice.payment_failed`
   * `customer.subscription.deleted`
5. Validez puis cliquez sur **Révéler le secret de signature** (forme `whsec_...`).

---

## 4. Ajout des variables d'environnement

Dans votre fichier `.env.local` (ou dans la configuration de votre hébergeur comme Vercel / Netlify / Render), renseignez les clés obtenues :

```env
# Clés API Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Secret du Webhook Stripe
STRIPE_WEBHOOK_SECRET=whsec_...

# Activer le drapeau Stripe (optionnel, également contrôlable dans le Super Admin)
NEXT_PUBLIC_STRIPE_ENABLED=true
```

---

## 5. Activation dans l'interface Super Admin Lougara

1. Connectez-vous sur l'application Lougara avec votre compte Super Admin (`champagcrypt@gmail.com`).
2. Accédez à la page d'administration des paramètres :
   👉 [http://localhost:3000/admin/settings](http://localhost:3000/admin/settings) (ou `https://votre-domaine.com/admin/settings`)
3. Dans la section **Grille des Forfaits & Identifiants Stripe Price ID** :
   * Collez pour chaque formule (Standard, Premium, VIP) son `Price ID` Stripe respectif (commençant par `price_...`).
4. Dans la section **Activation Globale Stripe** :
   * Basculez l'interrupteur sur **ACTIF** (la case devient verte).
5. Cliquez sur **Enregistrer les modifications**.

🎉 **Félicitations !** Les abonnements Stripe sont maintenant 100% opérationnels sur Lougara. Les clients B2B seront automatiquement redirigés vers la page de paiement sécurisée Stripe Checkout lorsqu'ils souscriront à une formule.
