# Journal des Modifications (Changelog)

Toutes les modifications notables apportées à ce projet sont consignées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [0.18.0] - 2026-10-18
### Ajouté & Sécurisé — Séparation Stricte Site Public (`lougara.com`) / Espace Admin (`lougara.com/admin`), Validation des Mots de Passe Clients & Mode Maintenance Isolé
- **Séparation Site Public & Espace Admin (`/admin`)** :
  - Création de la console d'administration unifiée sur `/admin` (`src/app/admin/page.tsx`) et du portail de connexion sécurisé `/admin/login` (`src/app/admin/login/page.tsx`), strictement réservés aux rôles existants `moderator` (`asherilla4@gmail.com`) et `super_admin` (`champagcrypt@gmail.com`).
  - Masquage total des onglets d'administration sur le site public : dans `src/components/Navbar.tsx`, les onglets d'administration (`Console Admin`, `Validation Mots de Passe`, `Audits KYB`, `Paiements RIB`, `Paramètres & Maintenance`) ne s'affichent que lorsque l'administrateur navigue en mode `/admin`.
  - Ajout du pictogramme `&` sur l'onglet public `Catalogue & Sourcing` dans `src/components/Navbar.tsx` pour harmoniser son affichage avec les 4 autres onglets publics.
  - Suppression de tous les boutons de connexion rapide en 1 clic et de toute divulgation d'adresses e-mail administrateurs sur `/connexion`, `/moderation/login`, les écrans 403 et l'écran de maintenance.
- **Authentification par Mot de Passe & Sécurité des Clients Inscrits (`src/features/auth/service.ts`)** :
  - Hachage cryptographique `scrypt` avec sel unique et comparaison en temps constant (`timingSafeEqual`), accompagné d'un cookie de session `HttpOnly` signé HMAC-SHA256 (`lougara_session`).
  - Configuration des mots de passe temporaires demandés : `"sherilla"` pour `moderator` et `"herve"` pour `super_admin`.
  - Mise en place du système de création/réinitialisation et de validation des mots de passe pour les clients inscrits (Entrepreneurs & Fournisseurs) via `/connexion` (`POST /api/auth/password-request`) et lors de l'inscription (`/api/entrepreneurs/register`, `/api/suppliers`).
- **Page de Validation des Mots de Passe (`/admin/mots-de-passe` & onglet dédié dans `/admin`)** :
  - Interface complète de contrôle et de validation des mots de passe clients (`AdminPasswordValidationPanel` dans `src/app/admin/mots-de-passe/page.tsx`) accessible uniquement aux rôles `moderator` et `super_admin` (`GET/PATCH /api/admin/password-validations`).
  - Gestion des états de chargement, d'erreur, de liste vide, de filtrage par statut (`PENDING`, `APPROVED`, `REJECTED`), de recherche et des actions de validation ou de refus motivé.
- **Mode Maintenance Isolé & Remise en Service Immédiate (`src/components/MaintenanceGuard.tsx`, `src/app/layout.tsx`, `src/proxy.ts`)** :
  - Enveloppement complet du DOM public dans `MaintenanceGuard` : lorsque la maintenance est active, aucune route publique n'expose la `Navbar`, les produits, les données utilisateurs ou les fonctionnalités admin (y compris pour les clients connectés).
  - Maintien de l'accès à `/admin` pendant la maintenance pour `moderator` et `super_admin` avec bandeau de remise en service immédiate sans blocage de cache (`Cache-Control: no-store`).

## [0.17.1] - 2026-10-17
### Corrigé — Compatibilité TypeScript `BodyInit` pour le téléchargement des factures PDF sur Vercel
- **Route API Facturation PDF (`src/app/api/payments/invoice/[id]/route.ts`)** :
  - Encapsulation du `Buffer` PDF dans `new Uint8Array(pdfBuffer)` lors de l'instanciation de `NextResponse` afin de résoudre l'erreur TypeScript `TS2345` (`Buffer<ArrayBufferLike>` non assignable à `BodyInit`) lors du build de production Next.js 16 sur Vercel.
- **Gestion des Versions (SemVer v0.17.1)** :
  - Synchronisation de `0.17.1` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.17.0] - 2026-10-17
### Ajouté — Système de Paiement Complet, Modulaire & Sécurisé (Stripe Payment Element, Virement RIB Lougara, Mobile Money, Factures PDF & Emails)
- **Architecture Modulaire Multi-Prestataires (`src/features/payment/`)** :
  - Interface commune `PaymentProvider` (`createPayment`, `verifyPayment`, `handleWebhook`, `refund`).
  - Matrice déclarative par pays (`payment-methods.config.ts`) associant chaque pays (France, Belgique, Sénégal, Côte d'Ivoire, Cameroun, Gabon, Guinée, Maroc, Nigéria, RDC, International) à ses devises (`EUR`, `XOF`, `XAF`, `USD`, `GNF`, `MAD`, `NGN`) et moyens de paiement sans modification du code métier.
  - Validation stricte des montants côté serveur (`pricing.service.ts`) : le navigateur ne dicte jamais le montant facturé.
- **Moyens de Paiement Implémentés** :
  - **Stripe Payment Element intégré (`/paiement`)** : Support des paiements uniques (Packs Crédits) et abonnements (Mensuel/Annuel) avec `automatic_payment_methods` (Cartes, Apple Pay, Google Pay, Link, Prélèvement SEPA) et gestion des devises zéro-décimale (`XOF`, `XAF`, `GNF`).
  - **Portail Client Stripe (`/api/stripe/portal`)** : Accessible depuis `/paiement/historique` pour gérer l'abonnement et les cartes enregistrées.
  - **Virement Bancaire Manuel (RIB Officiel Lougara / Qonto)** : Affichage du titulaire (`Lougara (EI - CHAMPAGNE Christelle / Mimonga)`), IBAN (`FR76 1695 8000 0112 9657 5872 333`), BIC (`QNTOFRP1XXX` / SWIFT partenaire `TRWIBEB3XXX`), montant exact et référence unique `LOU-AAAA-XXXX`, passage au statut `WAITING_TRANSFER` et envoi d'email d'instructions.
  - **Connecteurs Mobile Money Africains** : Connecteurs documentés prêts à l'activation par variables `.env` pour **CinetPay**, **Flutterwave** et **PayDunya** (Wave, Orange Money, MTN MoMo, Moov Money).
- **Base de Données, Webhooks Idempotents & Activation Serveur Exclusive** :
  - Ajout des modèles Prisma `PaymentOrder`, `WebhookEvent` et `Invoice`.
  - Vérification cryptographique des signatures et idempotence stricte des webhooks (`/api/webhooks/stripe` et `/api/webhooks/[provider]`).
  - Activation de l'accès client (`fulfillPaymentOrder`) exécutée exclusivement après confirmation serveur (webhook ou validation Admin), jamais via l'URL de retour navigateur.
- **Factures PDF Séquentielles & Emails Transactionnels** :
  - Génération automatique de factures PDF 1.4 (`invoice-pdf.service.ts`) avec numérotation séquentielle `FAC-AAAA-XXXX` et mentions légales `Lougara`.
  - Service d'emails transactionnels (`email.service.ts`) pour les instructions de virement RIB, la confirmation de paiement avec facture PDF jointe et les alertes d'échec.
- **Interfaces Client & Back-Office Admin** :
  - Nouvelles pages `/paiement`, `/paiement/succes`, `/paiement/echec`, `/paiement/historique` et `/admin/paiements` (avec bouton **« Marquer comme payé »**).
  - Fichier `.env.example`, suite de tests unitaires et d'intégration (`payment-system.test.ts`) et guide complet (`docs/GUIDE_PAIEMENTS_ET_MISE_EN_PRODUCTION.md`).


## [0.16.1] - 2026-10-17
### Ajouté & Amélioré — Affichage Direct du Contrôle « Site en maintenance » dans l'Espace Modérateur & Administration (Mode Super Admin)
- **Intégration Directe dans le Hub Modérateur (`/moderation`)** :
  - Ajout du commutateur interactif « Site en maintenance » avec voyant d'état en direct directement dans le bandeau d'accueil de l'Espace Modérateur (Mode Super Admin).
  - Ajout d'une carte de contrôle dédiée Super Admin placée juste sous le bandeau d'accueil avec la case à cocher « Site en maintenance », les badges d'état (`🔴 Maintenance Active (Accès Public Bloqué)` / `🟢 Site en ligne`), et le bouton direct « Redémarrer le site & Ouvrir au public ».
  - Détection et badge d'alerte de bascule automatique lors d'une mise à jour applicative (`⚡ Bascule auto suite à MàJ v0.16.1`).
- **Accès Rapide Système (`/admin/verifications`)** :
  - Mise à jour du bouton de navigation du sous-en-tête vers « Paramètres, Stripe & Maintenance ».
- **Gestion des Versions (SemVer v0.16.1)** :
  - Synchronisation de `0.16.1` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.16.0] - 2026-10-17
### Ajouté — Mode « Site en maintenance » Super Admin & Bascule Automatique sur Changement de Version
- **Panneau de Contrôle Super Admin (`/admin/settings`)** :
  - Ajout d'une carte dédiée en tête des paramètres d'administration avec case à cocher interactive pour activer ou désactiver le mode maintenance.
  - Badge de statut en direct (`🔴 Maintenance Active` / `🟢 Site en ligne`), affichage de la version applicative actuelle vs version active en base, et bouton de redémarrage direct (« Redémarrer le site & Ouvrir au public »).
- **Écran de Blocage Global Protecteur (`MaintenanceGuard`)** :
  - Intégration globale dans `layout.tsx` d'un encart plein écran (`z-[999999]`) bloquant l'accès au catalogue, aux espaces et aux formulaires pour tous les visiteurs et utilisateurs standards.
  - Accès et navigation réservés exclusivement au Super Admin (`champagcrypt@gmail.com`).
  - Modal d'authentification Super Admin discret intégré à l'écran de blocage pour permettre au Super Admin de se connecter et d'accéder au site sans friction.
  - Bannière flottante d'administration avec voyant d'alerte et bouton de réouverture en un clic affichée pour le Super Admin connecté.
- **Bascule Automatique en Maintenance lors d'une Mise à Jour de Version** :
  - Détection automatique à l'exécution de toute différence entre la version de code (`APP_VERSION`) et la version active enregistrée (`lastActiveVersion`).
  - Si un déploiement ou une mise à jour est effectué sans activation préalable par l'administrateur, le système verrouille automatiquement la plateforme en mode maintenance et coche l'option dans l'espace Super Admin.
  - Seul le Super Admin peut réouvrir l'accès public (« Redémarrer le site »), ce qui met à jour la version enregistrée et restaure la disponibilité générale.
- **Persistance PostgreSQL & API Dédiée (`/api/system/maintenance`)** :
  - Modèle de données `SystemMaintenance` dans Prisma avec initialisation et persistance directe en base PostgreSQL.
  - API `GET` avec en-têtes anti-cache stricts (`Cache-Control: no-store`) et API `POST` strictement réservée au Super Admin vérifié.
  - Fallback en mémoire résilient assurant la protection du site même en cas d'indisponibilité momentanée du serveur PostgreSQL.
- **Gestion des Versions (SemVer v0.16.0)** :
  - Synchronisation de `0.16.0` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.15.3] - 2026-10-17
### Corrigé — Masquage Immédiat des Publications & Publicités du Catalogue lors de la Modération
- **Synchronisation BDD Complète de l'Option Masquée (`/api/admin/verifications`)** :
  - Mise à jour atomique de l'entreprise (`CompanyProfile.isPublished`) et de l'ensemble de ses produits (`Product.isPublished`) lors du basculement de visibilité.
  - Synchronisation automatique sur les rejets et validations de dossiers fournisseurs.
- **Suppression du Cache Navigateur sur les Catalogues & Produits** :
  - Remplacement des en-têtes `s-maxage` par `Cache-Control: no-store, no-cache, must-revalidate` sur `/api/suppliers` et `/api/products` afin de refléter immédiatement les décisions de modération.
  - Ajout d'un horodatage anti-cache `?_t=${Date.now()}` et de l'option `{ cache: 'no-store' }` sur les appels du catalogue.
- **Filtrage Instantané Côté Client & Synchronisation Multi-Onglets (`/catalogue`)** :
  - Intégration de `localStorage('lougara_hidden_companies')` et du contrôle strict `cat.isPublished === false` et `prod.company.isPublished === false` dans les mémos React pour faire disparaître immédiatement les fiches masquées.
  - Remplacement complet de la liste des catalogues même lorsqu'elle devient vide après masquage.
- **Gestion des Versions (SemVer v0.15.3)** :
  - Synchronisation de `0.15.3` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.15.2] - 2026-10-17
### Corrigé
- Suppression de l'icône de loupe à gauche du lien Catalogue & Sourcing dans la barre de navigation

## [0.15.1] - 2026-10-17
### Corrigé & Déployé — Résolution des Erreurs TypeScript OCR sur Vercel et Finalisation des Fonctionnalités Modérateur & Catalogue
- **Correctif TypeScript API OCR KBIS (`/api/ocr/kbis`)** :
  - Sécurisation du `Buffer` et élimination des erreurs `TS2345` et `TS18047` bloquant le build de production sur Vercel.
  - Détection fiable du type PDF avec garde de nullité `Boolean((file && file.type === 'application/pdf') || fileName.endsWith('.pdf'))`.
- **Intégration Complète de la Coche de Masquage de Publication (`/admin/verifications`)** :
  - Ajout sous chaque dossier fournisseur (sous les boutons *« Rejeter »* et *« Valider & Publier »*) de la coche permettant de rendre la publication invisible du catalogue public.
  - Badge visuel `Masqué du catalogue` avec icône `EyeOff` et mise à jour en temps réel via l'action `TOGGLE_PUBLICATION`.
- **Accélération du Catalogue (`/catalogue`)** :
  - Pré-chargement des vitrines par défaut pour un affichage instantané à 0ms.
  - Parallélisation non bloquante `Promise.allSettled`, en-têtes HTTP de mise en cache (`Cache-Control: public, s-maxage=60, stale-while-revalidate=300`) et `useMemo` sur les filtres.
- **Gestion des Versions (SemVer v0.15.1)** :
  - Synchronisation de `0.15.1` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.15.0] - 2026-10-17
### Ajouté & Optimisé — Accélération Majeure du Catalogue & Masquage de Publication dans la Console Modérateur
- **Console Modérateur / Espace Vérification (`/admin/verifications`)** :
  - **Coche de publication invisible** : Ajout sous chaque dossier fournisseur (directement sous les boutons *« Rejeter »* et *« Valider & Publier »*) d'une case à cocher permettant de rendre la publication invisible du catalogue public (`isPublished = false` lorsque cochée).
  - **Mise à jour en temps réel et notification** : Déclenchement instantané via `PATCH /api/admin/verifications` avec l'action `TOGGLE_PUBLICATION`, mise à jour optimiste du state React et bandeau de notification visuel.
  - **Badge de statut visuel** : Ajout d'une puce `Masqué du catalogue` avec icône `EyeOff` à côté de l'intitulé de l'entreprise quand la fiche est masquée.
- **Accélération et Optimisation des Performances du Catalogue (`/catalogue`)** :
  - **Rendu instantané à 0ms** : Pré-remplissage des vitrines catalogues par défaut (`SAMPLE_SUPPLIER_CATALOGS`) éliminant l'écran blanc et l'attente au premier chargement.
  - **Parallélisation non bloquante** : Remplacement des requêtes séquentielles par `Promise.allSettled([fetch('/api/products'), fetch('/api/suppliers'), fetch('/api/entrepreneurs/register')])` avec synchronisation discrète en arrière-plan.
  - **Mise en cache HTTP** : Ajout de l'en-tête `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` sur `/api/products`, `/api/suppliers` et `/api/entrepreneurs/register`.
  - **Allègement des requêtes SQL Prisma** :
    - Limitation des produits rattachés aux vitrines fournisseurs à `take: 10` et `take: 50` entreprises max.
    - Filtrage des produits uniquement issus d'entreprises publiées (`company: { isPublished: true }`) et limite à `take: 60`.
  - **Chargement différé des médias** : Ajout systématique de `loading="lazy"` et `decoding="async"` avec images de couverture optimisées pour le web.
- **Gestion des Versions (SemVer v0.15.0)** :
  - Synchronisation de `0.15.0` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.14.0] - 2026-10-17
### Ajouté — Support du Clic, Glisser-Déposer (Drag & Drop) et Saisie Manuelle de Chemin pour les Documents
- **Nouveau Composant Universel `DocumentDropzone` (`src/components/DocumentDropzone.tsx`)** :
  - **Triple mode d'importation** : clic pour parcourir les fichiers locaux, glisser-déposer (Drag & Drop) direct avec retour visuel animé et détection instantanée, ou saisie / collage direct d'un chemin d'accès local ou URL distante.
  - **États interactifs et prévisualisation** : carte de statut document avec score OCR, taille du fichier, chemin d'accès complet, étape de scan et bouton de remplacement / suppression.
  - **Support multilingue** : interface bilingue français / anglais (`fr` / `en`).
- **Espace Entrepreneurs (`/entrepreneurs`)** :
  - Intégration du composant `DocumentDropzone` pour le dépôt de l'extrait Kbis / RCCM acheteur.
  - Support complet du glisser-déposer et de la saisie manuelle de chemin avec extraction OCR automatique des métadonnées légales.
- **Devenir Fournisseur (`/devenir-fournisseur`)** :
  - Intégration du composant `DocumentDropzone` en Étape 1 pour le dépôt Kbis / RCCM fournisseur avec remplissage automatique.
  - Ajout d'une zone `DocumentDropzone` en Étape 4 pour la pièce d'identité (CNI / Passeport) ou document complémentaire du dirigeant.
- **API Reconnaissance OCR (`/api/ocr/kbis`)** :
  - Prise en charge transparente des champs `file` (Buffer direct) et `filePath` (chemin local sur serveur ou URL distante).
- **Gestion des Versions (SemVer v0.14.0)** :
  - Synchronisation de `0.14.0` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.13.3] - 2026-10-17
### Corrigé & Nettoyé — Suppression de l'encart jaune Sourcing B2B et épuration de l'en-tête
- **Barre de Navigation (`Navbar`)** :
  - Suppression de l'encart jaune d'angle (« Sourcing B2B ») tronqué et inesthétique à côté du logo Lougara sur grand écran.
  - Suppression du sous-titre de corridor compressé verticalement pour un rendu visuel net, épuré et fidèle à la charte officielle de marque.
  - Le logo officiel Lougara bénéficie désormais d'un espacement optimal et équilibré, identique sur toutes les résolutions d'écran.
- **Gestion des Versions (SemVer v0.13.3)** :
  - Synchronisation de `0.13.3` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.13.2] - 2026-10-15
### Corrigé & Enrichi — Traduction Bilingue Intégrale des Catalogues, Vitrines, Filtres & Modales
- **Internationalisation Complète de la Vue Catalogue (`/catalogue`)** :
  - **Filtres & Corridors** : Libellé du corridor (« Sélection du Corridor : » / « Trade Corridor: »), option pays (« Tous pays » / « All countries »), liste déroulante des pays traduits dynamiquement (Sénégal/Senegal, Côte d'Ivoire/Ivory Coast, Cameroun/Cameroon, Maroc/Morocco, RDC/DRC, etc.), et case à cocher (« Vérifiés seuls » / « Verified only »).
  - **Vitrines Fournisseurs (Showcase Cards)** : Badge (« Vitrine Catalogue » / « Company Showcase »), disponibilité (« X / 10 produits dispo » / « X / 10 products avail. »), statut d'audit (« Vérification en cours » / « Verification in progress »), libellé de gamme (« Gamme : » / « Range: »), secteurs traduits (Industrie, Agroalimentaire, Cosmétique, etc.) et bouton (« Voir le catalogue complet » / « View full catalog »).
  - **Offres Produits B2B** : Prix indicatif, unités (« drum », « liter », « bag », « piece », « kg »), quantité minimale MOQ, pays d'origine et bouton (« Demander un devis au grossiste » / « Request wholesale quote »).
  - **Appels d'Offres Acheteurs (RFQs)** : Badge sponsorisé (« Espace Publicitaire Acheteur » / « Sponsored Buyer Space »), libellé du besoin (« Besoin de sourcing / Appel d'offres » / « Sourcing Request / RFQ »), budget et bouton de proposition.
  - **Modales d'Interaction** :
    - Modale Vitrine Catalogue complète : badge officiel, localisation, titre et description des produits, prix et bouton de devis bilingues.
    - Modale Demande de Devis (RFQ) : formulaires, quantités, labels et confirmation de soumission traduits.
    - Modale Proposition Fournisseur vers Acheteur : interface complète de contact commercial avec notifications d'envoi.
  - **Résilience Graphique** : Gestionnaire `onError` sur toutes les images de couvertures et produits pour éviter l'affichage de textes alternatifs dégradés sur les images distantes.
- **Espace Acheteurs & Entrepreneurs (`/entrepreneurs`)** :
  - Traduction intégrale du formulaire d'inscription acheteur (Kbis/RCCM dropzone, champs de formulaire, générateur de demande RFQ).
  - Boutons de redirection vers le catalogue traduits (« Voir catalogue → » / « View catalog → »).
- **Gestion des Versions (SemVer v0.13.2)** :
  - Synchronisation de `0.13.2` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.13.1] - 2026-10-15
### Ajouté — Internationalisation Intégrale FR / EN sur l'Ensemble de l'Application
- **Généralisation du Support Bilingue Multi-Pages** :
  - **Accueil (`/`)** : Hero section, badges de confiance, 4 secteurs pilotes, garantie d'audit KYB et bannières d'inscription traduits en français et anglais.
  - **Catalogue & Sourcing (`/catalogue`)** : En-têtes, sélecteur de corridors commerciaux, filtres de catégories, onglets vitrines/produits/acheteurs, boutons de devis et libellés de recherche traduits.
  - **Espace Entrepreneurs (`/entrepreneurs`)** : Feuille de route en 4 étapes de l'acheteur B2B, onglets d'inscription et annuaire des fournisseurs vérifiés traduits.
  - **Devenir Fournisseur (`/devenir-fournisseur`)** : Assistant d'inscription par étapes, messages de confirmation et instructions d'audit documentaire traduits.
  - **Garantie Vérification (`/verification`)** : Les 4 piliers d'audit légal et physique, pièces acceptées et garanties anti-fraude traduits.
  - **Connexion (`/connexion`)** : Formulaire, messages de session, boutons et indications de rôles bilingues.
  - **Pied de page (`Footer`)** : Description de marque, charte KYB, secteurs, corridors et mentions légales traduits.
  - **Badge de Confiance (`BadgeVerified`)** : Infobulles et libellés bilingues (« Vérifié Lougara » / « Lougara Verified »).
- **Gestion des Versions (SemVer v0.13.1)** :
  - Synchronisation de `0.13.1` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.13.0] - 2026-10-15
### Ajouté — Support Bilingue (FR/EN), Sélecteur Multidevises Dynamique & Refonte Tarifs B2B
- **Architecture d'Internationalisation (i18n)** :
  - Création du système de dictionnaire bilingue (`src/locales/fr.ts`, `src/locales/en.ts`).
  - Provider React `LanguageContext` avec persistance multi-supports (`localStorage` et cookies `NEXT_LOCALE`, `NEXT_CURRENCY`).
  - Sélecteur de langue interactif permanent (FR / EN) dans l'en-tête de navigation (`Navbar`).
- **Moteur Multidevises avec Prix Locaux Fixes & PPP** :
  - Support natif des devises : Euro (EUR), Dollar US (USD), Franc CFA BCEAO (XOF), Franc CFA BEAC (XAF), Franc Guinéen (GNF), Dirham Marocain (MAD), Naira Nigérian (NGN).
  - Définition d'une table de prix locaux fixes arrondis par devise évitant les frais de conversion bancaires prohibitifs.
  - Sélecteur déroulant de devise en direct dans la barre de navigation avec drapeaux et symboles monétaires.
- **Refonte Complète de la Page Tarifs ([`/tarifs`](file:///d:/Aplli/LOUGARA/src/app/tarifs/page.tsx))** :
  - 3 onglets dédiés : **Fournisseurs** (4 forfaits : Gratuit, Essentiel 20 prod, Pro 50 prod certifié, Premium 100+ prod), **Entrepreneurs** (4 forfaits : Consultation gratuite, Essentiel 3 contacts/m, Pro 15 contacts/m, VIP 50 contacts/m), et **Packs de Crédits** (Flash 1 contact, Croissance 5 contacts, Volume 15 contacts).
  - Commutateur de cycle de facturation Mensuel / Annuel avec réduction automatique de 20% (2 mois offerts).
  - Affichage instantané des prix dans la devise sélectionnée avec formatage monétaire adapté.
- **Extension Schéma Base de Données (Prisma)** :
  - Ajout des modèles non régressifs `SubscriptionPlanV2`, `PlanPrice`, `ContactCredit`, `ContactRequest`, et `BillingEvent`.
  - Relations bidirectionnelles avec `User`, `CompanyProfile` et `Product`.
- **Suite de Tests Élargie** :
  - Ajout de `tests/unit/i18n-currencies.test.ts` (37 tests unitaires passés avec succès).
- **Gestion des Versions (SemVer v0.13.0)** :
  - Synchronisation de `0.13.0` dans `package.json`, `package-lock.json`, `src/version.ts`, `VERSION` et `CHANGELOG.md`.

## [0.12.1] - 2026-10-05
### Corrigé — Compatibilité de Compilation Vercel & Correction des Types Stripe SDK
- **Correctifs de Typage Stripe (SDK v16+)** :
  - Suppression de la propriété obsolète `payment_method_types` sur la création de session Checkout ([`checkout/route.ts`](file:///d:/Aplli/LOUGARA/src/app/api/stripe/checkout/route.ts#L50-L55)).
  - Ajustement du type de la propriété `subscription` dans l'écouteur de webhooks ([`webhooks/stripe/route.ts`](file:///d:/Aplli/LOUGARA/src/app/api/webhooks/stripe/route.ts#L75-L82)).
  - Ajout de la balise `<head>` dans [`global-error.tsx`](file:///d:/Aplli/LOUGARA/src/app/global-error.tsx) pour prévenir l'erreur de prerendering Turbopack Next.js 16.
- **Gestion des Versions (SemVer v0.12.1)** :
  - Synchronisation de `v0.12.1` dans `package.json`, `src/version.ts` et `CHANGELOG.md`.

## [0.12.0] - 2026-10-05
### Ajouté — Infrastructure d'Abonnements Stripe, Interrupteur Super Admin & Procedure d'Activation dans Docs
- **Pré-installation des SDKs Stripe** :
  - Ajout des dépendances `stripe` et `@stripe/stripe-js` dans `package.json`.
  - Support optionnel et conditionnel des variables `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et `STRIPE_WEBHOOK_SECRET` dans `src/env.ts`.
- **Évolution Base de Données (Prisma Schema)** :
  - Nouveaux modèles `SubscriptionPlan`, `UserSubscription`, `SubscriptionStatus` et `PlatformSettings`.
- **Espace de Gestion Super Admin ([`/admin/settings`](file:///d:/Aplli/LOUGARA/src/app/admin/settings/page.tsx))** :
  - Création de la console Super Admin avec interrupteur à bascule pour l'activation globale de Stripe.
  - Détection en temps réel de la présence des clés API Stripe dans l'environnement.
  - Éditeur interactif pour associer les `stripePriceId` et ajuster les quotas par forfait.
- **Service de Quotas & Endpoints API avec Fallback Lancement Gratuit** :
  - API Routes `/api/admin/settings`, `/api/stripe/checkout`, `/api/stripe/portal` et `/api/webhooks/stripe`.
  - Gestion du mode dégradé : tant que Stripe est inactif, le site reste en mode gratuit avec quota de lancement.
- **Documentation d'Activation Pas-à-Pas ([`docs/PROCEDURE_ACTIVATION_STRIPE.md`](file:///d:/Aplli/LOUGARA/docs/PROCEDURE_ACTIVATION_STRIPE.md))** :
  - Guide complet pour créer le compte Stripe, configurer les produits/tarifs, installer le Webhook et activer la bascule Super Admin.
- **Gestion des Versions (SemVer v0.12.0)** :
  - Synchronisation de `v0.12.0` dans `package.json`, `src/version.ts` et `CHANGELOG.md`.

## [0.11.5] - 2026-09-28
### Ajouté — Configuration des Icônes de Marque & Favicon Google (`favicon.ico`, `icon.png`, `apple-icon.png`)
- **Intégration du Favicon Officiel pour Google & les Navigateurs** :
  - Génération et placement des fichiers d'icônes de marque (`favicon.ico`, `icon.png`, `apple-touch-icon.png`) dans `public/` et `src/app/`.
  - Déclaration de l'objet `icons` dans la fonction `metadata` de [`layout.tsx`](file:///d:/Aplli/LOUGARA/src/app/layout.tsx#L45-L56) pour que le robot Google (`Googlebot-Image`) remplace l'icône de mappemonde bleue générique par le logo officiel **LOUGARA**.
- **Gestion des Versions (SemVer v0.11.5)** :
  - Synchronisation de `v0.11.5` dans `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.11.4] - 2026-09-28
### Corrigé — Dimensionnement & Affichage du Logo Officiel Lougara (`Capture.PNG`)
- **Restructuration de l'Affichage de l'Image de Marque** :
  - Suppression du texte dupliqué et augmentation de la hauteur du logo (`h-12 sm:h-14`) pour afficher l'image du logo officiel (`Capture.PNG`) dans toute sa hauteur et largeur originale sans déformation ni effet de capsule étroite.
  - Intégration dans la barre de navigation ([`Navbar.tsx`](file:///d:/Aplli/LOUGARA/src/components/Navbar.tsx)) et le pied de page ([`Footer.tsx`](file:///d:/Aplli/LOUGARA/src/components/Footer.tsx)).
- **Gestion des Versions (SemVer v0.11.4)** :
  - Synchronisation de `v0.11.4` dans `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.11.3] - 2026-09-28
### Corrigé — Définition de l'Orientation Horizontale du Logo Officiel Lougara (`Capture.PNG`)
- **Remplacement de l'Image du Logo par la Version Horizontale Orientée (`Capture.PNG`)** :
  - Détection et remplacement de la version verticale/pivotée par la version horizontale officielle `Capture.PNG` d'origine (`D:\Aplli\Lougara\docs\Logo\Capture.PNG`).
  - Intégration de l'image de marque dans un conteneur stylisé arrondi blanc avec liseré doré pour une visibilité haute définition sur fond sombre Midnight Navy ([`Navbar.tsx`](file:///d:/Aplli/LOUGARA/src/components/Navbar.tsx) et [`Footer.tsx`](file:///d:/Aplli/LOUGARA/src/components/Footer.tsx)).
- **Gestion des Versions (SemVer v0.11.3)** :
  - Synchronisation de `v0.11.3` dans `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.11.2] - 2026-09-28
### Modifié — Remplacement du Logo Emblématique par l'Image du Logo Officiel Lougara
- **Intégration du Logo Officiel (`/logo.png`)** :
  - Copie de l'image de marque `D:\Aplli\Lougara\docs\Logo\logo lougara.png` dans le répertoire public de l'application (`d:\Aplli\LOUGARA\public\logo.png`).
  - Remplacement de l'ancien pictogramme textuel « L » dans la barre de navigation ([`Navbar.tsx`](file:///d:/Aplli/LOUGARA/src/components/Navbar.tsx)) et le pied de page ([`Footer.tsx`](file:///d:/Aplli/LOUGARA/src/components/Footer.tsx)) par la balise image du logo officiel.
- **Gestion des Versions (SemVer v0.11.2)** :
  - Synchronisation de `v0.11.2` dans `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.11.1] - 2026-09-28
### Ajouté — Documentation & Fichier de Présentation Globale (`PRESENTATION.md`)
- **Création du Fichier de Présentation ([`PRESENTATION.md`](file:///d:/Aplli/LOUGARA/PRESENTATION.md))** :
  - Rédaction d'un document complet structuré présentant la vision, le modèle d'affaires, l'audit KYB (OCR Kbis/RCCM), le catalogue B2B, les rôles utilisateurs, la stack technique (Next.js 16, TypeScript, Prisma, Vitest) et l'architecture SEO de la plateforme.
- **Gestion des Versions (SemVer v0.11.1)** :
  - Synchronisation de `v0.11.1` dans `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.11.0] - 2026-09-28
### Ajouté & Modifié — Architecture SEO Modulaire & Optimisation Longue Traîne par Intention
- **Refonte des Métadonnées & Nettoyage SEO (Règle « 1 Page = 1 Intention »)** :
  - Nettoyage des balises meta : suppression intégrale des fautes volontaires et des mots-clés trop génériques pour prévenir tout risque de pénalité algorithmique (*keyword stuffing*).
  - Création de fichiers de sous-layout dédiés avec métadonnées uniques pour chaque route :
    - [`catalogue/layout.tsx`](file:///d:/Aplli/LOUGARA/src/app/catalogue/layout.tsx) : Mots-clés de longue traîne sectoriels (beurre de karité Sénégal, tissu wax export, cosmétiques bio, agroalimentaire).
    - [`entrepreneurs/layout.tsx`](file:///d:/Aplli/LOUGARA/src/app/entrepreneurs/layout.tsx) : Mots-clés ciblés sur le sourcing sécurisé et la mise en relation direct grossiste-acheteur.
    - [`devenir-fournisseur/layout.tsx`](file:///d:/Aplli/LOUGARA/src/app/devenir-fournisseur/layout.tsx) : Acquisition de grossistes certifiés et valorisation du badge KYB.
    - [`verification/layout.tsx`](file:///d:/Aplli/LOUGARA/src/app/verification/layout.tsx) : Réassurance légale, audit RCCM / Kbis et lutte contre la fraude B2B.
    - [`tarifs/layout.tsx`](file:///d:/Aplli/LOUGARA/src/app/tarifs/layout.tsx) : Référencement des offres et abonnements.
- **Gestion des Versions (SemVer v0.11.0)** :
  - Synchronisation de `v0.11.0` dans `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.10.1] - 2026-09-25
### Corrigé — Restauration du Thème Sombre Obsidian D'origine & Suppression du Sélecteur Clair/Sombre
- **Restauration de la Charte Graphique D'origine** :
  - Annulation intégrale du composant de basculement de thème (`ThemeToggle.tsx`) et du contexte (`ThemeContext.tsx`).
  - Restauration des styles CSS et des couleurs originales Midnight Obsidian Navy & Gold Métallique dans [`Navbar.tsx`](file:///d:/Aplli/LOUGARA/src/components/Navbar.tsx) et [`globals.css`](file:///d:/Aplli/LOUGARA/src/app/globals.css).
- **Gestion des Versions (SemVer v0.10.1)** :
  - Synchronisation de la version `v0.10.1` dans `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.10.0] - 2026-09-25
### Ajouté — Infrastructure d'Indexation & Référencement Naturel Google / Bing (SEO B2B)
- **Génération Dynamique de `sitemap.xml` ([`sitemap.ts`](file:///d:/Aplli/LOUGARA/src/app/sitemap.ts))** :
  - Indexation automatique des routes publiques stratégiques (`/`, `/catalogue`, `/entrepreneurs`, `/devenir-fournisseur`, `/verification`, `/tarifs`).
- **Configuration des Robots de Recherche ([`robots.ts`](file:///d:/Aplli/LOUGARA/src/app/robots.ts))** :
  - Autorisation explicite de l'indexation par GoogleBot et BingBot sur les pages publiques et masquage des routes privées de modération (`/admin/*`, `/moderation/*`).
- **Métadonnées Next.js 16 (Metadata API) ([`layout.tsx`](file:///d:/Aplli/LOUGARA/src/app/layout.tsx))** :
  - Intégration de balises enrichies OpenGraph, de mots-clés cibles du sourcing B2B transfrontalier, de balises canoniques et de directives de prévisualisation d'images haute définition.
- **Gestion des Versions (SemVer v0.10.0)** :
  - Synchronisation de `v0.10.0` sur `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.9.1] - 2026-09-25
### Corrigé — Transformation des Cartes de Métriques en Boutons de Filtrage Interactifs
- **Interactivité des 4 Cartes de Métriques dans l'Espace Modérateur ([`page.tsx`](file:///d:/Aplli/LOUGARA/src/app/admin/verifications/page.tsx))** :
  - Conversion des 4 conteneurs statiques en boutons cliquables avec retours visuels et surbrillance active (`ring-2`, ombre colorée, badge "Filtre Actif").
  - Clic sur **« Total Inscrits »** -> filtre tous les dossiers (`ALL`).
  - Clic sur **« À Vérifier »** -> filtre uniquement les dossiers en attente (`PENDING`).
  - Clic sur **« Vérifiés Lougara »** -> filtre uniquement les dossiers validés (`VERIFIED`).
  - Clic sur **« Non Conformes »** -> filtre uniquement les dossiers rejetés (`REJECTED`).
- **Gestion des Versions (SemVer v0.9.1)** :
  - Synchronisation de `v0.9.1` sur `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.9.0] - 2026-09-25
### Ajouté & Modifié — Contrôle d'Accès Strict & Restriction de l'Espace Modérateur
- **Attribution des Droits & Restriction aux 2 Adresses Modérateurs** :
  - Octroi exclusif des droits d'accès à l'Espace Modérateur pour `asherilla4@gmail.com` (Modérateur) et `champagcrypt@gmail.com` (Super Administrateur).
  - Masquage intégral et automatique de l'onglet **« Espace Modérateur »** dans la barre de navigation ([`Navbar.tsx`](file:///d:/Aplli/LOUGARA/src/components/Navbar.tsx)) pour tous les autres utilisateurs (visiteurs, entrepreneurs, fournisseurs, et autres adresses e-mail).
- **Protection Côté Serveur & Composants Protégés** :
  - Création du contexte global d'authentification ([`AuthContext.tsx`](file:///d:/Aplli/LOUGARA/src/context/AuthContext.tsx)) pour gérer les rôles (`visitor`, `entrepreneur`, `supplier`, `moderator`, `super_admin`).
  - Protection des routes `/admin/verifications` et `/moderation` avec affichage d'un écran d'accès refusé si la session active ne correspond pas aux deux adresses autorisées.
- **Formulaires & Portail de Connexion Modérateur** :
  - Création de la page de connexion globale ([`/connexion`](file:///d:/Aplli/LOUGARA/src/app/connexion/page.tsx)) et du portail dédié modérateur ([`/moderation/login`](file:///d:/Aplli/LOUGARA/src/app/moderation/login/page.tsx)).
  - Intégration du tableau de bord complet de modération ([`/moderation`](file:///d:/Aplli/LOUGARA/src/app/moderation/page.tsx)) avec 5 volets : Audits KYB, Gestion des Utilisateurs, Modération des Catalogues & Anonymat, Configuration des Tarifs & Limites, et Journal des Actions.
- **Gestion des Versions (SemVer v0.9.0)** :
  - Synchronisation de la version `v0.9.0` sur `package.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.8.0] - 2026-09-23
### Modifié — Refonte Visuelle & UX Ultra-Premium Corporate Tech (Landing V1)
- **Système de Design & Thème Sombre Obsidian** :
  - Fond Midnight Obsidian Navy (`#0B132B`, `#0F172A`), Or Cuivré Métallique (`#D4AF37`, `#E5A93C`), et Vert Émeraude (`#10B981`) pour le statut vérifié.
  - Typographies géométriques modernes (*Plus Jakarta Sans* & *DM Sans* via Google Fonts).
  - Effets de cartes en verre dépoli (Frosted Glass) avec bordures or métalliques et lueurs aura.
- **Refonte Complète des 7 Pages** :
  - Page 1 (Accueil) : Hero obsidian, carte preview "Dernière Entreprise Auditée", Bento Grid 4 secteurs, barre de confiance.
  - Page 2 (Catalogue & Sourcing) : Filtres de corridors commerciaux, cartes produits avec badges Or/Émeraude et modale RFQ.
  - Page 3 (Espace Entrepreneurs) : Feuille de route acheteur en 4 étapes avec numéros circulaires or et générateur RFQ.
  - Page 4 (Devenir Fournisseur) : Wizard pas-à-pas onboarding et créateur de catalogue multi-produits.
  - Page 5 (Garantie Vérification) : Nouvelle page dédiée `/verification` avec protocoles d'audit en 4 piliers.
  - Page 6 (Tarifs & Abonnements) : Grille tarifaire 3 niveaux avec formule Premium 149€ bordée de feuille d'or.
  - Page 7 (Espace Modérateur Interne) : Workspace d'audit avec **Loupe grossissante 2.5x** pour signatures et sceaux officiels.

## [0.7.9] - 2026-09-23
### Ajouté — Persistance de la Validation et Édition de Champs OCR Côte à Côte
- **Persistance Inter-Fermetures ([`page.tsx`](file:///d:/Aplli/LOUGARA/src/app/admin/verifications/page.tsx))** :
  - Conservation en mémoire React et `localStorage` de l'état de validation individuel des 8 champs OCR ainsi que de toutes les valeurs éditées par le modérateur pour chaque document (`doc.id`).
  - Fermer le panneau "Inspecter Côte à Côte" avant la fin de l'évaluation ne fait plus perdre la progression : à la réouverture du document, tous les champs validés et les corrections apportées sont immédiatement restitués.
  - Ajout du badge "Progression enregistrée" et d'un bouton dédié "Relancer OCR" pour réinitialiser ou rafraîchir l'analyse optique brute si souhaité.
- **Gestion des Versions (SemVer v0.7.9)** :
  - Synchronisation stricte de la version `v0.7.9` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.7.8] - 2026-09-22
### Ajouté — Édition et Coche de Validation Individuelle par Champ OCR
- **Validation & Édition Champ par Champ ([`page.tsx`](file:///d:/Aplli/LOUGARA/src/app/admin/verifications/page.tsx))** :
  - Ajout d'une coche de validation individuelle (Bouton "Validé ✓" / "Valider") sur chaque champ d'information extrait par l'OCR.
  - Transformation de chaque champ en zone de saisie modifiable (`<input>`), permettant au modérateur de corriger instantanément les erreurs de lecture optique.
  - Ajout du bandeau de suivi global de validation ("Validation des Champs : X/8 validés") avec option "Tout valider".
- **Gestion des Versions (SemVer v0.7.8)** :
  - Synchronisation complète de la version `v0.7.8` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.7.7] - 2026-09-22
### Ajouté — Interface Modérateur "Côte à Côte" (50/50 Split View) & Inspection OCR Complète
- **Vue Duale Numérisation Scannée vs Analyse OCR ([`page.tsx`](file:///d:/Aplli/LOUGARA/src/app/admin/verifications/page.tsx))** :
  - Mise en place du mode côte à côte (50/50 split modal) permettant de visualiser simultanément l'image scannée binaire originale (gauche) et l’analyse OCR avec contrôle de validité de signature/sceau greffe & localisation d'adresse (droite).
  - Intégration d'un panneau déroulant de lecture intégrale du texte brut extrait (Raw Text Extracted) avec détection d'erreurs et filtres de recherche.
- **Gestion des Versions (SemVer v0.7.7)** :
  - Synchronisation stricte de la version `v0.7.7` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.7.6] - 2026-09-22
### Corrigé — Distribution de la Véritable Image Binaire Brut du KBIS (Sans Fiche ni Conteneur HTML)
- **Diffusion Binaire Directe des Fichiers ([`route.ts (Preview)`](file:///d:/Aplli/LOUGARA/src/app/api/documents/preview/route.ts))** :
  - Modification de la route d'accès aux pièces justificatives pour qu'elle renvoie **exclusivement le flux binaire direct du fichier image original** (`image/jpeg`, `image/png`, `application/pdf`).
  - Suppression intégrale de tout gabarit ou conteneur HTML d'encadrement : le clic sur *« Ouvrir pièce »* ouvre désormais immédiatement l’image originale numérisée scannée (ex: le scan officiel 997 Ko du KBIS Maroc — Tribunal de Commerce de Casablanca).
- **Gestion des Versions (SemVer v0.7.6)** :
  - Synchronisation complète de `v0.7.6` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.7.5] - 2026-09-22
### Corrigé — Affichage de l'Image Originale du KBIS Spécimen (`docs/kyb-specimens/`) & Streaming Binaire Direct
- **Service de Distribution des Pièces Originales ([`route.ts (Preview)`](file:///d:/Aplli/LOUGARA/src/app/api/documents/preview/route.ts))** :
  - Extension de la recherche de fichiers sur le disque local pour inclure le dossier des spécimens officiels `docs/kyb-specimens/`.
  - Transmission directe du flux binaire image (`Content-Type: image/jpeg`) lors de la consultation d'extraits comme `rc_maroc_atlas_commercial_1789907835086.jpg`. Le modérateur accède ainsi directement à l'image numérisée scannée du document officiel (Royaume du Maroc - Tribunal de Commerce de Casablanca).
- **Gestion des Versions (SemVer v0.7.5)** :
  - Synchronisation complète de `v0.7.5` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.7.4] - 2026-09-22
### Corrigé — Téléchargement des Pièces Originales Supabase Storage & Affichage de l'État de Revue Modérateur
- **Consultation des Pièces Originales ([`route.ts (Preview)`](file:///d:/Aplli/LOUGARA/src/app/api/documents/preview/route.ts))** :
  - Téléchargement et streaming binaire de l'**image ou PDF original déposé** directement depuis le bucket Supabase Storage `kyb-documents`.
  - Suppression des mentions prématurées de validation ("Certifié" / "Validé") sur les documents en attente d'audit : affichage dynamique de l'état réel de revue (`EN ATTENTE DE VÉRIFICATION MODÉRATEUR` vs `DOCUMENT VALIDÉ`).
- **Gestion des Versions (SemVer v0.7.4)** :
  - Synchronisation de `v0.7.4` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.7.3] - 2026-09-22
### Nouveautés & Corrigé — Intégration Stockage Supabase Storage (`kyb-documents`) & Résolution Définitive des Erreurs 404
- **Intégration du Stockage des Documents sur Supabase Storage ([`supabase-storage.ts`](file:///d:/Aplli/LOUGARA/src/lib/supabase-storage.ts))** :
  - Création du module utilitaire d'administration Supabase Storage pour le stockage persistant et sécurisé des pièces justificatives (KBIS, CNI, NINEA) dans le bucket `kyb-documents`.
  - Intégration des fonctions `uploadKybDocumentToSupabase` et `getKybDocumentUrl` permettant la génération automatique d'URLs d'accès Supabase Storage publiques/signées pour éviter toute erreur de chargement.
- **Mise à jour des Routes API ([`route.ts (Suppliers)`](file:///d:/Aplli/LOUGARA/src/app/api/suppliers/route.ts))** :
  - Sauvegarde automatique des URLs Supabase Storage absolues dans le champ `filePath` lors de l'enregistrement d'un profil fournisseur.
- **Gestion des Versions (SemVer v0.7.3)** :
  - Synchronisation complète de `v0.7.3` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.7.2] - 2026-09-21
### Corrigé — Route de Prévisualisation des Pièces Jointes (`/api/documents/preview`) & Élimination Erreurs 404
- **Route de Prévisualisation des Documents ([`route.ts`](file:///d:/Aplli/LOUGARA/src/app/api/documents/preview/route.ts))** :
  - Création de la route dédiée `/api/documents/preview` pour la consultation sécurisée des pièces justificatives.
  - Résolution des erreurs `404 Not Found` lors du clic sur *« Ouvrir pièce »* : recherche automatique du fichier physique sur le disque local ou le stockage Supabase.
  - Si le fichier est un fichier de test/démo ou temporaire, génération dynamique d'une visualisation officielle certifiée (HTML/PDF) affichant le statut du document, les tampons du greffe et le filigrane de sécurité.
- **Gestion des Versions (SemVer v0.7.2)** :
  - Synchronisation complète de `v0.7.2` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.7.1] - 2026-09-21
### Corrigé & Amélioré — Stabilité Espace Modérateur, Défaut de Publication & Consultation des Pièces
- **Correction Boucle Infinie de Rechargement Espace Modérateur** :
  - Ajustement des fonctions `fetchSuppliers` et `fetchStats` dans [`page.tsx`](file:///d:/Aplli/LOUGARA/src/app/admin/verifications/page.tsx) pour désactiver la bascule d'état de chargement (`isLoading = true`) lors des rafraîchissements périodiques en arrière-plan.
- **Politique de Publication Non Publiée par Défaut** :
  - Bascule du paramètre par défaut `isPublished` de `true` à `false` sur le modèle `CompanyProfile` ([`schema.prisma`](file:///d:/Aplli/LOUGARA/prisma/schema.prisma)) et dans la route API d'inscription ([`route.ts`](file:///d:/Aplli/LOUGARA/src/app/api/suppliers/route.ts)).
  - Mise à jour du service catalogue ([`service.ts`](file:///d:/Aplli/LOUGARA/src/features/catalog/service.ts)) pour ne filtrer que les produits des entreprises ayant `isPublished: true`.
- **Accès Direct aux Pièces Jointes & Module OCR Intégral** :
  - Ajout d'un bouton direct **« Ouvrir pièce »** sur chaque document permettant au modérateur de consulter ou télécharger le fichier original dans un nouvel onglet.
  - Enrichissement de la modal d'inspection OCR avec affichage de toutes les métadonnées extraites (Forme juridique, Capital, Dirigeant, Adresse du Siège, NINEA/NIF, Impôts, Autorité d'émission, Sceau) ainsi qu'un visualiseur du **texte brut extrait par l'OCR**.
- **Gestion des Versions (SemVer v0.7.1)** :
  - Synchronisation complète de `v0.7.1` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.7.0] - 2026-09-21
### Nouveautés — Console de Contrôle des Sites Fournisseurs, Audit Signature/Localisation Légale & Gestion de la Publication
- **Console d'Audit & Contrôle des Sites Fournisseurs Modérateur (`/admin/verifications`)** :
  - **Tri & Mise en Avant des Nouveaux Inscrits** : Filtrage dédié des inscriptions de moins de 7 jours, classées en tête de file pour un traitement rapide par l'équipe de modération.
  - **Audit de la Signature Légale & Sceau du Greffe KBIS / RCCM** :
    - Intégration d'un module d'inspection OCR des documents (KBIS, CNI/Passeport du gérant, NINEA, Justificatifs).
    - Contrôle automatique de la présence de la signature officielle du greffier et du sceau du tribunal de commerce.
    - Vérification de la concordance de l'adresse du siège social.
  - **Gestion en Direct de la Publication (Publié / Masqué-Suspendu)** :
    - Interrupteur de publication (*Switch Toggle*) sur chaque fiche fournisseur pour autoriser ou suspendre la visibilité publique du site et du catalogue en 1 clic.
  - **Badge « Vérifié Lougara »** : Octroi et révocation immédiate du badge certifié de confiance avec mise à jour du statut dans Prisma / Supabase.
- **Base de Données (Prisma Schema)** :
  - Extension du modèle `CompanyProfile` avec le champ `isPublished` (Boolean).
  - Extension du modèle `VerificationDocument` avec `DocumentStatus` (PENDING, VERIFIED, REJECTED), `issuingAuthority`, `signatureVerified` et `locationVerified`.
- **Gestion des Versions (SemVer v0.7.0)** :
  - Synchronisation de `v0.7.0` sur `package.json`, `VERSION`, `CHANGELOG.md`.

## [0.6.9] - 2026-09-21
### Corrigé — Extraction & Nettoyage OCR KBIS / RCCM (Préfixe "/ NOM :", Dirigeants & Parenthèses Orphelines)
- **Nettoyage de la Dénomination Sociale sur Extraits Kbis & RCCM** :
  - Élimination des résidus et symboles en début de ligne (`/`, `-`, `•`) ainsi que les préfixes officiels comme ` / NOM :`, `NOM :`, `NOM / RAISON SOCIALE :`, `NOM DE L'ENTREPRISE :`.
  - Exemple : extrait désormais `IVOIRE TRADING & SOURCING SA` au lieu de `     / NOM : IVOIRE TRADING & SOURCING SA`.
- **Nettoyage du Nom du Dirigeant / Représentant Légal (Étape 4)** :
  - Suppression automatique des parenthèses ouvrantes orphelines et espaces résiduels tronqués lors de la lecture OCR de l'état civil (ex: `Gérant : BENJELLOUN KARIM ( né le 15/03/1975 ...` extrait proprement sous la forme **`BENJELLOUN KARIM`** au lieu de `BENJELLOUN KARIM (`).
  - Correction de l'expression régulière du préfixe des rôles (`Gérant`, `Président`, `Représentant Légal`) avec support de la normalisation Unicode NFC pour la compatibilité avec tous les encodages OCR.
- **Gestion des Versions (SemVer v0.6.9)** :
  - Synchronisation de `v0.6.9` sur `package.json`, `package-lock.json`, `VERSION`, `src/version.ts` et `CHANGELOG.md`.

## [0.6.8] - 2026-09-21
### Ajouté — Champ Descriptif & Présentation de la Société à l'Étape 1 Fournisseur
- **Nouveau Champ Texte Multi-lignes à l'Étape 1 sur 5** :
  - Ajout du champ obligatoires **Descriptif & Présentation de la société** (`<textarea>`) directement sous la sélection du *Secteur d'activité principal* dans le formulaire [`devenir-fournisseur/page.tsx`](file:///d:/Aplli/LOUGARA/src/app/devenir-fournisseur/page.tsx).
  - Pré-remplissage automatique depuis l'objet social Kbis/RCCM extrait par l'OCR.
  - Transmission du descriptif dans le payload d'inscription et enregistrement en base Supabase/Prisma.
- **Gestion des Versions (SemVer v0.6.8)** :
  - Synchronisation de `v0.6.8` sur l'ensemble des fichiers source.

## [0.6.7] - 2026-09-21
### Nouveautés — Calculateur de Prix Total Commande Mini (MOQ) & Grille Dégressive (Vistaprint Style)
- **Calculateur & Tarification par Volume Vistaprint-Style à l'Étape 2 sur 5** :
  - Intégration d'un module interactif de calcul de **Prix Total Commande Minimale** (`Prix Unitaire Min × MOQ`) en temps réel dans le formulaire d'inscription fournisseur ([`devenir-fournisseur/page.tsx`](file:///d:/Aplli/LOUGARA/src/app/devenir-fournisseur/page.tsx)).
  - Affichage automatique d'une **Grille Tarifaire Dégressive par tranches de volume** (MOQ Standard, 5x MOQ [-5%], 10x MOQ [-10%], 50x+ MOQ Grossiste [-15%]), inspirée du modèle e-commerce Vistaprint.
  - Ajout d'une note explicative rappelant que la grille initiale est enregistrée ici lors de l'onboarding et sera pleinement personnalisable depuis l'**Espace Personnel Fournisseur** une fois le compte validé.
- **Gestion des Versions (SemVer v0.6.7)** :
  - Synchronisation complète sur `package.json`, `VERSION`, `package-lock.json`, `src/version.ts` et le footer.

## [0.6.6] - 2026-09-21
### Corrigé — Auto-remplissage Étape 4 (Représentant Officiel) & Synchronisation Versioning
- **Reconnaissance optique accrue pour l'Étape 4 (Nom, Email, Téléphone du Dirigeant)** :
  - Support multi-format étendu pour l'extraction du représentant officiel sur Kbis (France) et RCCM (Afrique OHADA, Maghreb) : `Nom et prénoms du gérant`, `Administrateur Général`, `Gérance`, `Représentant légal`, `Titulaire`, `Promoteur`, et expressions multi-lignes (`NOM : ...` / `PRÉNOMS : ...`).
  - Nettoyage des parasites OCR (dates de naissance, lieux, mentions de CNI/passeport, nationalité).
  - Suppression du risque d'altération de noms propres avec la fonction `cleanContactName`.
  - Mise en évidence visuelle (fond vert émeraude doux, bordure émeraude et badges `Extrait par OCR`) sur l'Étape 4/5 dans le formulaire [`devenir-fournisseur`](file:///d:/Aplli/LOUGARA/src/app/devenir-fournisseur/page.tsx).
- **Gestion Stricte des Versions (SemVer)** :
  - Synchronisation complète de la version de l'application (`v0.6.6`) sur l'ensemble des fichiers source : [`package.json`](file:///d:/Aplli/LOUGARA/package.json), [`VERSION`](file:///d:/Aplli/LOUGARA/VERSION), [`package-lock.json`](file:///d:/Aplli/LOUGARA/package-lock.json), [`src/version.ts`](file:///d:/Aplli/LOUGARA/src/version.ts) et le footer ([`Footer.tsx`](file:///d:/Aplli/LOUGARA/src/components/Footer.tsx)).

## [0.6.5] - 2026-09-21
### Corrigé — Statut de Vérification Initial Fournisseur & File de Modération
- **Correction du statut de vérification par défaut** :
  - Modification de la route API [`POST /api/suppliers`](file:///d:/Aplli/LOUGARA/src/app/api/suppliers/route.ts#L86-L95) pour enregistrer les nouveaux fournisseurs avec le statut `PENDING` (En attente de revue) au lieu de `VERIFIED`.
  - Réinitialisation de `verifiedAt` à `null` lors de l'enregistrement initial.
- **Rattachement automatique du document légal** :
  - Enregistrement automatique de la pièce justificative (KBIS / RCCM) soumise dans la table `VerificationDocument` pour affichage direct dans la console modérateur (`/admin/verifications`).

## [0.6.4] - 2026-09-20
### Ajouté & Corrigé — Liaison UI des Pays Francophones d'Afrique
- **Complétion des listes déroulantes de pays (`<select>`)** :
  - Ajout explicite de l'ensemble des pays d'Afrique Francophone (RDC, Maroc, Cameroun, Sénégal, Côte d'Ivoire, Bénin, Togo, Gabon, Tunisie, Algérie, Burkina Faso, Guinée, Congo-Brazzaville, Mali, Niger, Tchad, Madagascar) dans les formulaires [`devenir-fournisseur`](file:///d:/Aplli/LOUGARA/src/app/devenir-fournisseur/page.tsx), [`entrepreneurs`](file:///d:/Aplli/LOUGARA/src/app/entrepreneurs/page.tsx) et le filtre du [`catalogue`](file:///d:/Aplli/LOUGARA/src/app/catalogue/page.tsx).
- **Option de Secours Dynamique pour Pays** :
  - Intégration d'un menu déroulant dynamique `{country && !list.includes(country) && <option value={country}>{country}</option>}` garantissant que tout pays détecté par le moteur OCR s'affiche immédiatement dans l'interface sans réinitialisation visuelle.

## [0.6.3] - 2026-09-20
### Corrigé & Architecture OCR Hybride WebAssembly Vercel
- **Architecture OCR Hybride Instantanée (< 2 secondes)** :
  - Mise en place d'un basculement automatique sur `tesseract.js` WebAssembly directement dans le navigateur du client si l'API Vercel met plus de 4s ou échoue.
  - Configuration de `outputFileTracingIncludes` dans [`next.config.ts`](file:///d:/Aplli/LOUGARA/next.config.ts) pour embarquer le dictionnaire `fra.traineddata` dans les bundles Vercel Serverless.
  - Suppression intégrale du fallback local avec nom de fichier et valeurs par défaut (*Paris/France*).
- **Prise en charge ID. NAT. RDC (Congo)** :
  - Support natif des attestations d'Identification Nationale de la République Démocratique du Congo (ID. NAT. ex: `01-93-N48152B`).
  - Extraction exacte de la dénomination (`CONGO MINING & LOGISTICS SARL`), ville (`Kinshasa`) et pays (`RDC`).

## [0.6.2] - 2026-09-20
### Corrigé & Optimisation OCR & Guide Équivalents Kbis Afrique
- **Accélération du traitement OCR** :
  - Parsing instantané natif des flux textuels PDF (< 50ms) évitant les blocages Tesseract.
  - Tesseract.js optimisé en local avec `fra.traineddata` (process.cwd) pour la reconnaissance rapide des images scannées.
- **Support complet de l'Afrique Francophone (KYB)** :
  - Extraction universelle des numéros d'immatriculation d'Afrique : **RCCM OHADA** (Sénégal, Côte d'Ivoire, Cameroun, RDC, Bénin, Togo, Gabon...), **RC Maroc** et **RCS France**.
  - Extraction des identifiants fiscaux : **NINEA**, **NCC**, **NIU**, **ID. NAT.**, **IFU**, **ICE**, **NIF**.
  - Reconnaissance automatique multi-ligne du dirigeant, raison sociale, ville, pays, capital et secteur.
- **Documentation & Spécimens** :
  - Ajout du guide officiel [`docs/GUIDE_EQUIVALENTS_KBIS_AFRIQUE.md`](file:///d:/Aplli/LOUGARA/docs/GUIDE_EQUIVALENTS_KBIS_AFRIQUE.md) et des 12 pièces justificatives spécimens dans `docs/kyb-specimens/`.

## [0.6.1] - 2026-09-20
### Corrigé & Améliorations OCR & Catalogue Multi-Images
- **Correctif OCR & Remplissage Automatique Kbis/RCCM** :
  - Intégration de la librairie native `pdf-parse` et de `tesseract.js` `recognize` pour extraire automatiquement et sans échec les données des Kbis PDF (vectoriels et scannés) et images (PNG, JPG, WEBP).
  - Ajout d'une bannière de confirmation d'auto-remplissage vert émeraude lors du dépôt de document avec résumé des champs extraits (Raison Sociale, Numéro Légal, Ville, Pays, Dirigeant).
- **Catalogue Multi-Produits & Multi-Images** :
  - Mise à niveau du formulaire d'inscription fournisseur ([`devenir-fournisseur/page.tsx`](file:///d:/Aplli/LOUGARA/src/app/devenir-fournisseur/page.tsx)) avec un **Constructeur de Catalogue Multi-Articles & Multi-Images**.
  - Possibilité d'ajouter autant d'images et d'articles que nécessaire (jusqu'à 10 produits par catalogue) avec gestion des galeries d'images par produit.
  - Connexion de l'API `/api/suppliers` (méthode `POST`) pour enregistrer la fiche fournisseur et tous ses produits directement en base Supabase/Prisma.

## [0.6.0] - 2026-09-20
### Nouveautés & Refonte du Catalogue par Vitrines Fournisseurs
- Redesign complet de la page [Catalogue](file:///d:/Aplli/LOUGARA/src/app/catalogue/page.tsx) :
  - **Vitrines Catalogues Fournisseurs** : affichage de chaque fournisseur sous forme de carte vitrine dont la couverture est la première image de son catalogue.
  - **Accès direct** : clic sur la première image d'un fournisseur pour ouvrir la modale affichant l'intégralité de son catalogue publicitaire.
  - **Limite à 10 produits** : restriction stricte à maximum 10 articles disponibles par catalogue fournisseur lors de leur inscription/exposition sur le site.
  - Badges dynamiques `📦 X sur 10 produits disponibles`, statut de vérification KYB/Kbis et filtres par secteur/pays.

## [0.5.9] - 2026-09-20
### Corrigé & Nettoyage Espace Modérateur
- Suppression intégrale des fausses données de démonstration dans l'[Espace Modérateur / Admin](file:///d:/Aplli/LOUGARA/src/app/admin/verifications/page.tsx) (`INITIAL_QUEUE`, faux compteurs de visite et faux documents de secours).
- Initialisation de la file à `[]` et chargement 100% réel depuis l'API Supabase `/api/admin/verifications`.

## [0.5.8] - 2026-09-20
### Nouveautés & Supabase Dynamic Linking
- Connexion dynamique de l'application à Supabase :
  - Ajout des routes API `/api/products`, `/api/suppliers` et `/api/admin/verifications` pour interroger les tables PostgreSQL Prisma.
  - Mise à jour du [Catalogue](file:///d:/Aplli/LOUGARA/src/app/catalogue/page.tsx) et de l'[Espace Entrepreneurs](file:///d:/Aplli/LOUGARA/src/app/entrepreneurs/page.tsx) pour charger les 5 nouveaux fournisseurs et 25 articles depuis Supabase en temps réel.
  - Connexion de l'[Espace Modérateur](file:///d:/Aplli/LOUGARA/src/app/admin/verifications/page.tsx) pour charger et valider/rejeter les dossiers fournisseurs directement en base Supabase.
- Insertion de 5 nouveaux fournisseurs stratégiques (Mali, Maroc, Côte d'Ivoire, Bénin, Tanzanie) et 25 produits B2B dans Supabase via le script de seed.

## [0.5.7] - 2026-09-17
### Sécurité & Build
- Correction complète des vulnérabilités Next.js avec mise à jour vers Next.js `16.3.5` et verrouillage de Node.js vers `22.x` (`engines`).
- Compilation locale et génération des pages statiques 100% validées.

## [0.5.6] - 2026-09-17
### Sécurité & Build
- Mise à niveau de Next.js vers `15.1.7` dans [`package.json`](file:///d:/Aplli/LOUGARA/package.json) pour corriger la vulnérabilité CVE-2025-66478 exigée par Vercel.

## [0.5.5] - 2026-09-17
### Corrigé
- Suppression du fichier de configuration `.babelrc` obsolète pour rétablir la compilation native Next.js SWC et corriger l'erreur de build Vercel `@babel/runtime/regenerator`.

## [0.4.4] - 2026-09-15
### Corrigé
- Synchronisation de [`package-lock.json`](file:///d:/Aplli/LOUGARA/package-lock.json) avec Next.js `15.1.7` pour forcer Vercel à utiliser la version sécurisée sans se baser sur l'ancien lockfile.

## [0.4.3] - 2026-09-15
### Sécurité
- Mise à niveau de Next.js vers `^15.1.7` dans [`package.json`](file:///d:/Aplli/LOUGARA/package.json) pour éliminer l'avertissement de vulnérabilité de sécurité CVE-2025-66478 lors du déploiement Vercel.

## [0.4.2] - 2026-09-15
### Corrigé
- Prise en charge de la génération automatique du client Prisma sur Vercel lors du build :
  - Mise à jour du script `build` dans [`package.json`](file:///d:/Aplli/LOUGARA/package.json) vers `"prisma generate && next build"`.
  - Ajout du script `"postinstall": "prisma generate"`.

## [0.4.1] - 2026-09-15
### Amélioré
- Refonte complète de l'**Étape 2 sur 4** (*Besoins de Sourcing & Cahier des Charges*) du formulaire d'inscription Entrepreneurs ([`page.tsx`](file:///d:/Aplli/LOUGARA/src/app/entrepreneurs/page.tsx)) :
  - Remplacement du champ texte simple par un **Descriptif détaillé des besoins & Cahier des charges** (`<textarea>` multi-lignes obligatoires) pour décrire les produits cibles, qualités, emballages et contraintes.
  - Ajout du sélecteur d'**Échéance d'approvisionnement souhaitée** (Immédiat <30j, Court terme 1-3 mois, Moyen terme, Projet annuel).
  - Ajout des champs optionnels **Quantités & Volumes cibles** et **Normes & Certifications requises** (Bio, Ecocert, ISO, CE...).
- Mise à jour des schémas de validation Zod ([`validation.ts`](file:///d:/Aplli/LOUGARA/src/features/entrepreneurs/validation.ts)) et du service d'enregistrement ([`service.ts`](file:///d:/Aplli/LOUGARA/src/features/entrepreneurs/service.ts)) pour intégrer et persister les nouveaux champs de sourcing.

## [0.4.0] - 2026-09-12
### Ajouté
- Module d'analyse d'audience et de comptage des visites segmenté par profil métier : **Entrepreneurs**, **Fournisseurs** et **Curieux**.
- Intégration dans la **Console d'Audit & Espace Modérateur** (`/admin/verifications`) d'un tableau de bord de fréquentation en temps réel :
  - 4 indicateurs clés (KPI) : Visites Entrepreneurs (avec % d'audience), Visites Fournisseurs, Visites Curieux et Total Visiteurs avec taux de qualification B2B.
  - Jauge visuelle de répartition proportionnelle des 3 audiences (couleurs distinctives émeraude, bleue et ambre).
  - Journal horodaté des dernières visites avec indication de la page consultée, du segment et du référent.
  - Outil de simulation interactif pour tester l'incrémentation en direct de chaque catégorie de visiteur.
- Composant global [`VisitorTracker`](file:///D:/Aplli/LOUGARA/src/components/VisitorTracker.tsx) monté dans le `RootLayout` pour qualifier automatiquement les visites (`ENTREPRENEUR` sur `/entrepreneurs*`, `FOURNISSEUR` sur `/devenir-fournisseur*`, et `CURIEUX` sur les autres pages vitrines) tout en excluant le trafic interne modérateur.
- API REST `/api/analytics/visit` (`GET` pour les statistiques agrégées, `POST` pour enregistrer les visites).
- Suite de tests unitaires dédiée dans `tests/unit/analytics.test.ts`.

## [0.3.0] - 2026-09-12
### Ajouté
- Nouvelle page dédiée **Tarifs & Abonnements** (`/tarifs`) conforme aux recommandations stratégiques de Lougara (`Doc/Analyse_et_recommandations_Lougara.md`).
- Grille tarifaire transparente avec les 3 forfaits d'abonnement mensuels sans engagement :
  - **Standard (99 € / mois)** : 15 mises en relation directes, accès réseau vérifié, support 48h.
  - **Premium (150 € / mois)** : Mises en relation illimitées, matching prioritaire, badge vérifié Premium, support 24h.
  - **VIP (250 € / mois)** : Account Manager dédié, hotline WhatsApp 24/7, négociation grands comptes et **Espace Publicitaire Catalogue inclus**.
- Option **Espace Publicitaire Catalogue** (+49 € / mois ou inclus dans l'offre VIP) pour exposer ses produits ou ses appels d'offres en vitrine publique.
- Étape d'abonnement et sélection de l'encart publicitaire intégrée dans le tunnel d'onboarding Fournisseurs (`/devenir-fournisseur`).
- Étape d'abonnement et sélection de l'encart publicitaire intégrée dans le formulaire d'inscription Entrepreneurs (`/entrepreneurs`).
- Refonte de la page **Catalogue public B2B** (`/catalogue`) :
  - Règle stricte de visibilité : seuls les fournisseurs et entrepreneurs avec un Espace Publicitaire actif y figurent.
  - Bannière officielle d'information renvoyant vers la page `/tarifs`.
  - Double vue par onglets : *Offres Fournisseurs Sponsorisées* et *Appels d'Offres Acheteurs Sponsorisés*.
  - Badges distinctifs *Espace Publicitaire Partenaire* et niveau d'abonnement sur toutes les fiches.
  - Modale de réponse commerciale directe pour contacter les acheteurs sponsorisés.
- Schémas Zod et persistance Prisma/cache mis à jour pour stocker `subscriptionPlan` et `hasCatalogAdSpace`.

## [0.2.1] - 2026-09-12
### Ajouté
- Intégration de la reconnaissance optique universelle Kbis / RCCM dans l'Espace Entrepreneurs (`/entrepreneurs`) identique au parcours fournisseur.
- Auto-remplissage instantané des champs légaux : Raison sociale, Numéro RCCM/SIREN, Ville, Pays, Dirigeant officiel et suggestion de secteur.
- Respect strict de la règle zéro hallucination : email et téléphone laissés vierges sauf mention explicite sur le document officiel.
- Badge d'attestation Kbis / RCCM vérifié dans l'annuaire du réseau des acheteurs (`BadgeVerified`).
- Bouton de test rapide avec simulation d'extrait officiel Kbis.

## [0.2.0] - 2026-09-12
### Ajouté
- Création complète de l'Espace Entrepreneurs (/entrepreneurs) : inscription acheteurs en base de données, annuaire des fournisseurs vérifiés, demandes de devis directes et publication d'appels d'offres.

## [0.1.4] - 2026-09-12
### Corrigé
- Suppression de toute génération artificielle d'email ou téléphone : extraction stricte des données réellement présentes sur le document.

## [0.1.3] - 2026-09-12
### Corrigé
- Correction de la reconnaissance du nom du représentant officiel : extraction exacte de JULIEN DUPÉ (au lieu de Doué).

## [0.1.2] - 2026-09-12
### Ajouté
- Auto-remplissage complet de l'Étape 4 (Coordonnées du représentant officiel : Nom, Email pro et Téléphone direct) dès la lecture optique du Kbis.

## [0.1.1] - 2026-09-12
### Corrigé
- Correction de l'extraction de l'activité Kbis (PORTAIL INTERNET) et classification automatique du secteur technologique.
