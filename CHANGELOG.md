# Journal des Modifications (Changelog)

Toutes les modifications notables apportées à ce projet sont consignées dans ce fichier.
Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

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
