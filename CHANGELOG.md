# Journal des Modifications (Changelog)

Toutes les modifications notables apportées à ce projet sont consignées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

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
